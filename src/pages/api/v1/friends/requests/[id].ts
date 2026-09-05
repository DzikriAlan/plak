import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/shared/lib/prisma'
import { postApiError, postApiMethodNotAllowed, postApiSuccess } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return postApiMethodNotAllowed(res, 'PATCH')

  const requestId = String(req.query.id ?? '')
  const action = String(req.body?.action ?? '')
  if (action !== 'accept' && action !== 'decline') {
    return postApiError(res, {
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: { action: ['action must be "accept" or "decline"'] },
    })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return postApiError(res, { status: 401, code: 'UNAUTHENTICATED', message: 'Sign in required' })
    }
    const myId = session.user.id

    const request = await prisma.friendRequest.findUnique({ where: { id: requestId } })
    // Hanya penerima yang boleh menerima/menolak; pengirim menunggu sampai pihak lain merespons.
    if (!request || request.addresseeId !== myId || request.status !== 'PENDING') {
      return postApiError(res, { status: 404, code: 'FRIEND_REQUEST_NOT_FOUND', message: 'Friend request not found' })
    }

    if (action === 'decline') {
      await prisma.friendRequest.delete({ where: { id: requestId } })
      return postApiSuccess(res, { data: null, message: 'Friend request declined' })
    }

    const accepted = await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
      include: { requester: true },
    })

    return postApiSuccess(res, {
      data: {
        id: accepted.requester.id,
        name: accepted.requester.name ?? '',
        email: accepted.requester.email ?? '',
        image: accepted.requester.image ?? '',
      },
      message: 'Friend request accepted',
    })
  } catch {
    return postApiError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
