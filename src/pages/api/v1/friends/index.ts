import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/shared/lib/prisma'
import { postApiError, postApiMethodNotAllowed, postApiSuccess } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return postApiMethodNotAllowed(res, 'GET')

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return postApiError(res, { status: 401, code: 'UNAUTHENTICATED', message: 'Sign in required' })
    }
    const myId = session.user.id

    const accepted = await prisma.friendRequest.findMany({
      where: { status: 'ACCEPTED', OR: [{ requesterId: myId }, { addresseeId: myId }] },
      include: { requester: true, addressee: true },
      orderBy: { updatedAt: 'desc' },
    })

    const friends = accepted.map((request) => {
      const friend = request.requesterId === myId ? request.addressee : request.requester
      return { id: friend.id, name: friend.name ?? '', email: friend.email ?? '', image: friend.image ?? '' }
    })

    return postApiSuccess(res, { data: friends, message: 'Friends fetched successfully' })
  } catch {
    return postApiError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
