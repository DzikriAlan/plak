import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/shared/lib/prisma'
import { getFriendPairIds } from '@/shared/lib/friendPair'
import { getSupabaseRealtimeClient } from '@/shared/lib/supabaseRealtime'
import { postApiError, postApiMethodNotAllowed, postApiSuccess } from '@/shared/lib/apiResponse'

const BROADCAST_TIMEOUT_MS = 4000

// Kanal hanya perlu tersambung sesaat untuk mengirim satu pesan siaran, jadi dibuka dan
// dilepas lagi per permintaan alih-alih dipertahankan di antara panggilan API.
const postInviteBroadcast = (toUserId: string, payload: Record<string, unknown>) => {
  const client = getSupabaseRealtimeClient()
  if (!client) return Promise.resolve(false)

  return new Promise<boolean>((resolve) => {
    const channel = client.channel(`invites:${toUserId}`)
    const timer = setTimeout(() => {
      channel.unsubscribe()
      resolve(false)
    }, BROADCAST_TIMEOUT_MS)

    channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      await channel.send({ type: 'broadcast', event: 'invite', payload })
      clearTimeout(timer)
      channel.unsubscribe()
      resolve(true)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return postApiMethodNotAllowed(res, 'POST')

  const toUserId = String(req.body?.toUserId ?? '')
  const roomCode = String(req.body?.roomCode ?? '')
  const game = String(req.body?.game ?? '')
  if (!toUserId || !roomCode || !game) {
    return postApiError(res, {
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: {
        toUserId: !toUserId ? ['toUserId is required'] : [],
        roomCode: !roomCode ? ['roomCode is required'] : [],
        game: !game ? ['game is required'] : [],
      },
    })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return postApiError(res, { status: 401, code: 'UNAUTHENTICATED', message: 'Sign in required' })
    }
    const myId = session.user.id

    const { userMinId, userMaxId } = getFriendPairIds(myId, toUserId)
    const friendship = await prisma.friendRequest.findUnique({
      where: { userMinId_userMaxId: { userMinId, userMaxId } },
    })
    if (!friendship || friendship.status !== 'ACCEPTED') {
      return postApiError(res, { status: 403, code: 'NOT_FRIENDS', message: 'You can only invite a friend' })
    }

    const data = {
      fromUserId: myId,
      fromName: session.user.name ?? '',
      fromImage: session.user.image ?? '',
      roomCode,
      game,
      sentAt: new Date().toISOString(),
    }
    const isSent = await postInviteBroadcast(toUserId, data)
    if (!isSent) {
      return postApiError(res, {
        status: 503,
        code: 'INVITE_UNAVAILABLE',
        message: 'Could not reach the realtime channel right now',
      })
    }

    return postApiSuccess(res, { data, message: 'Invite sent successfully' })
  } catch {
    return postApiError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
