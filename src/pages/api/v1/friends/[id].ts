import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/shared/lib/prisma'
import { getFriendPairIds } from '@/shared/lib/friendPair'
import { postApiError, postApiMethodNotAllowed, postApiSuccess } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return postApiMethodNotAllowed(res, 'DELETE')

  const friendId = String(req.query.id ?? '')

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return postApiError(res, { status: 401, code: 'UNAUTHENTICATED', message: 'Sign in required' })
    }
    const myId = session.user.id
    const { userMinId, userMaxId } = getFriendPairIds(myId, friendId)

    const deleted = await prisma.friendRequest.deleteMany({
      where: { userMinId, userMaxId, status: 'ACCEPTED' },
    })
    if (!deleted.count) {
      return postApiError(res, { status: 404, code: 'FRIEND_NOT_FOUND', message: 'Friend not found' })
    }

    return postApiSuccess(res, { data: null, message: 'Friend removed successfully' })
  } catch {
    return postApiError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
