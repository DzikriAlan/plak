import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/shared/lib/prisma'
import { postApiError, postApiMethodNotAllowed, postApiSuccess } from '@/shared/lib/apiResponse'
import type { FriendStatus } from '@/features/users/types/usersTypes'

const RESULT_LIMIT = 10

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return postApiMethodNotAllowed(res, 'GET')

  const email = String(req.query.email ?? '').trim()
  if (!email) {
    return postApiError(res, {
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: { email: ['Email is required'] },
    })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return postApiError(res, { status: 401, code: 'UNAUTHENTICATED', message: 'Sign in required' })
    }
    const myId = session.user.id

    const matches = await prisma.user.findMany({
      where: { id: { not: myId }, email: { contains: email, mode: 'insensitive' } },
      select: { id: true, name: true, email: true, image: true },
      take: RESULT_LIMIT,
    })
    const matchIds = matches.map((match) => match.id)

    const requests = matchIds.length
      ? await prisma.friendRequest.findMany({
          where: {
            OR: [
              { requesterId: myId, addresseeId: { in: matchIds } },
              { addresseeId: myId, requesterId: { in: matchIds } },
            ],
          },
        })
      : []

    const getFriendStatus = (otherId: string): FriendStatus => {
      const request = requests.find((row) => row.requesterId === otherId || row.addresseeId === otherId)
      if (!request) return 'none'
      if (request.status === 'ACCEPTED') return 'friends'
      return request.requesterId === myId ? 'pending_sent' : 'pending_received'
    }

    return postApiSuccess(res, {
      data: matches.map((match) => ({
        id: match.id,
        name: match.name ?? '',
        email: match.email ?? '',
        image: match.image ?? '',
        friendStatus: getFriendStatus(match.id),
      })),
      message: 'Search completed successfully',
    })
  } catch {
    return postApiError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
