import type { NextApiRequest, NextApiResponse } from 'next'
import { getGameRoomSeat, getGameRoomView } from '@/shared/lib/gameRoom'
import { getGameRoomRow, updateGameRoomSeen } from '@/shared/lib/gameRoomStore'
import { postApiError, postApiMethodNotAllowed, postApiSuccess } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return postApiMethodNotAllowed(res, 'GET')

  const code = String(req.query.code ?? '').toUpperCase()
  const token = String(req.query.token ?? '')

  try {
    // Penarikan berkala ikut menandai kehadiran supaya pemain yang aliran kabarnya terputus tetap
    // terlihat tersambung oleh lawannya.
    const room = token ? await updateGameRoomSeen(code, token) : await getGameRoomRow(code)
    if (!room) {
      return postApiError(res, { status: 404, code: 'ROOM_NOT_FOUND', message: 'Room not found' })
    }

    const seat = getGameRoomSeat(room.players, token)
    return postApiSuccess(res, {
      data: { ...getGameRoomView(room, seat), token: seat ? token : '' },
      message: 'Room retrieved successfully',
    })
  } catch {
    return postApiError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
