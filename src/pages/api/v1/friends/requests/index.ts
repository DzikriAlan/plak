import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/shared/lib/prisma'
import { getFriendPairIds } from '@/shared/lib/friendPair'
import { postApiError, postApiMethodNotAllowed, postApiSuccess } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return postApiMethodNotAllowed(res, 'GET, POST')

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return postApiError(res, { status: 401, code: 'UNAUTHENTICATED', message: 'Sign in required' })
    }
    const myId = session.user.id

    if (req.method === 'GET') {
      const pending = await prisma.friendRequest.findMany({
        where: { status: 'PENDING', OR: [{ requesterId: myId }, { addresseeId: myId }] },
        include: { requester: true, addressee: true },
        orderBy: { createdAt: 'desc' },
      })

      const requests = pending.map((request) => {
        const isOutgoing = request.requesterId === myId
        const otherUser = isOutgoing ? request.addressee : request.requester
        return {
          id: request.id,
          direction: isOutgoing ? 'outgoing' : 'incoming',
          user: { id: otherUser.id, name: otherUser.name ?? '', email: otherUser.email ?? '', image: otherUser.image ?? '' },
          createdAt: request.createdAt.toISOString(),
        }
      })

      return postApiSuccess(res, { data: requests, message: 'Friend requests fetched successfully' })
    }

    const addresseeId = String(req.body?.addresseeId ?? '')
    if (!addresseeId || addresseeId === myId) {
      return postApiError(res, {
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: { addresseeId: ['A valid addresseeId is required'] },
      })
    }

    const addressee = await prisma.user.findUnique({ where: { id: addresseeId } })
    if (!addressee) {
      return postApiError(res, { status: 404, code: 'USER_NOT_FOUND', message: 'User not found' })
    }

    const { userMinId, userMaxId } = getFriendPairIds(myId, addresseeId)
    const existing = await prisma.friendRequest.findUnique({ where: { userMinId_userMaxId: { userMinId, userMaxId } } })
    if (existing) {
      return postApiError(res, {
        status: 409,
        code: 'FRIEND_REQUEST_EXISTS',
        message: existing.status === 'ACCEPTED' ? 'Already friends' : 'Friend request already pending',
      })
    }

    const created = await prisma.friendRequest.create({
      data: { requesterId: myId, addresseeId, userMinId, userMaxId },
      include: { requester: true, addressee: true },
    })

    return postApiSuccess(res, {
      status: 201,
      data: {
        id: created.id,
        direction: 'outgoing',
        user: {
          id: created.addressee.id,
          name: created.addressee.name ?? '',
          email: created.addressee.email ?? '',
          image: created.addressee.image ?? '',
        },
        createdAt: created.createdAt.toISOString(),
      },
      message: 'Friend request sent successfully',
    })
  } catch {
    return postApiError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
