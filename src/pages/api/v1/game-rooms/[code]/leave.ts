import type { NextApiRequest, NextApiResponse } from 'next'
import { getGameRoomSeat, getGameRoomView } from '@/shared/lib/gameRoom'
import { getGameRoomRow, updateGameRoomRow } from '@/shared/lib/gameRoomStore'
import { postGameRoomEvent } from '@/shared/lib/gameRoomEvents'
import { postApiError, postApiMethodNotAllowed, postApiSuccess } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return postApiMethodNotAllowed(res, 'POST')

  const code = String(req.query.code ?? '').toUpperCase()
  const token = String(req.body?.token ?? '')

  try {
    const room = await getGameRoomRow(code)
    if (!room) {
      return postApiError(res, { status: 404, code: 'ROOM_NOT_FOUND', message: 'Room not found' })
    }

    const seat = getGameRoomSeat(room.players, token)
    if (!seat) {
      return postApiError(res, { status: 403, code: 'SEAT_NOT_FOUND', message: 'You do not hold a seat in this room' })
    }
    if (room.status === 'finished') {
      return postApiSuccess(res, {
        data: { ...getGameRoomView(room, seat), token },
        message: 'Room already finished',
      })
    }

    // Pemain yang keluar mengakhiri sesi; lawan terakhir yang bertahan dinyatakan menang.
    const rivals = room.players.filter((player) => player.seat !== seat)
    const updated = await updateGameRoomRow(code, {
      status: 'finished',
      winner: rivals.length === 1 ? rivals[0].seat : '',
      state: { ...room.state, leftSeat: seat },
    })
    if (!updated) {
      return postApiError(res, { status: 404, code: 'ROOM_NOT_FOUND', message: 'Room not found' })
    }
    postGameRoomEvent(code, updated)

    return postApiSuccess(res, {
      data: { ...getGameRoomView(updated, seat), token },
      message: 'Room left successfully',
    })
  } catch {
    return postApiError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
