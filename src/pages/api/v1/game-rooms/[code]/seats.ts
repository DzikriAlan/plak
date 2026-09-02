import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getGameRoomDealtState,
  getGameRoomSeat,
  getGameRoomSeatOptions,
  getGameRoomView,
} from '@/shared/lib/gameRoom'
import { getGameRoomRow, updateGameRoomRow } from '@/shared/lib/gameRoomStore'
import { postGameRoomEvent } from '@/shared/lib/gameRoomEvents'
import { postApiError, postApiMethodNotAllowed, postApiSuccess } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return postApiMethodNotAllowed(res, 'POST')

  const code = String(req.query.code ?? '').toUpperCase()
  const token = String(req.body?.token ?? '')
  const seatTotal = Number(req.body?.seatTotal)

  try {
    const room = await getGameRoomRow(code)
    if (!room) {
      return postApiError(res, { status: 404, code: 'ROOM_NOT_FOUND', message: 'Room not found' })
    }

    const seat = getGameRoomSeat(room.players, token)
    if (!seat) {
      return postApiError(res, { status: 403, code: 'SEAT_NOT_FOUND', message: 'You do not hold a seat in this room' })
    }
    // Jumlah pemain hanya boleh diatur pemilik ruangan sebelum permainan dimulai.
    if (seat !== room.players[0]?.seat) {
      return postApiError(res, { status: 403, code: 'HOST_ONLY', message: 'Only the host can set the seat total' })
    }
    if (room.status !== 'lobby') {
      return postApiError(res, { status: 409, code: 'ROOM_ALREADY_STARTED', message: 'This room has already started' })
    }

    const options = getGameRoomSeatOptions(room.game)
    if (!options.includes(seatTotal)) {
      return postApiError(res, {
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: { seatTotal: ['This seat total is not available for this game'] },
      })
    }
    if (seatTotal < room.players.length) {
      return postApiError(res, {
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: { seatTotal: ['More players have already joined than this seat total'] },
      })
    }

    // Meja langsung dibagikan bila kursi yang dipilih sudah terisi penuh.
    const seats = room.players.map((player) => player.seat)
    const isTableFull = room.players.length >= seatTotal
    const dealt = isTableFull ? getGameRoomDealtState(room.game, seats) : null
    const updated = await updateGameRoomRow(code, {
      seatTotal,
      status: dealt ? 'playing' : 'lobby',
      ...(dealt ? { state: dealt, turn: seats[0], moveTotal: 0 } : {}),
    })
    if (!updated) {
      return postApiError(res, { status: 404, code: 'ROOM_NOT_FOUND', message: 'Room not found' })
    }
    postGameRoomEvent(code, updated)

    return postApiSuccess(res, {
      data: { ...getGameRoomView(updated, seat), token },
      message: 'Seat total updated successfully',
    })
  } catch {
    return postApiError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
