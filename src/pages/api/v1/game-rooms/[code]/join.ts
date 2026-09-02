import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getGameRoomAbandonedSeat,
  getGameRoomDealtState,
  getGameRoomFreeSeat,
  getGameRoomSeat,
  getGameRoomToken,
  getGameRoomView,
} from '@/shared/lib/gameRoom'
import { getGameRoomRow, updateGameRoomRow } from '@/shared/lib/gameRoomStore'
import { postGameRoomEvent } from '@/shared/lib/gameRoomEvents'
import { postApiError, postApiMethodNotAllowed, postApiSuccess } from '@/shared/lib/apiResponse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return postApiMethodNotAllowed(res, 'POST')

  const code = String(req.query.code ?? '').toUpperCase()
  const token = String(req.body?.token ?? '')
  const name = String(req.body?.name ?? '').slice(0, 24)

  try {
    const room = await getGameRoomRow(code)
    if (!room) {
      return postApiError(res, { status: 404, code: 'ROOM_NOT_FOUND', message: 'Room not found' })
    }

    // Pemain yang sudah punya kursi cukup memakai kursinya kembali saat halaman dimuat ulang.
    const seat = getGameRoomSeat(room.players, token)
    if (seat) {
      return postApiSuccess(res, {
        data: { ...getGameRoomView(room, seat), token },
        message: 'Seat resumed successfully',
      })
    }

    const nextToken = getGameRoomToken()
    const freeSeat = getGameRoomFreeSeat(room.players, room.seatTotal)
    // Kursi kosong dipakai lebih dulu; bila penuh, kursi yang ditinggalkan boleh diambil alih.
    const takenSeat = freeSeat ?? getGameRoomAbandonedSeat(room.players)
    if (!takenSeat) {
      return postApiError(res, { status: 409, code: 'ROOM_FULL', message: 'Every seat in this room is taken' })
    }

    const players = freeSeat
      ? [
          ...room.players,
          { seat: freeSeat, token: nextToken, name: name || `Pemain ${room.players.length + 1}`, seenAt: Date.now() },
        ]
      : room.players.map((player) =>
          player.seat === takenSeat
            ? { ...player, token: nextToken, name: name || player.name, seenAt: Date.now() }
            : player,
        )
    const isTableFull = players.length >= room.seatTotal
    const seats = players.map((player) => player.seat)
    const dealt = isTableFull ? getGameRoomDealtState(room.game, seats) : null
    const updated = await updateGameRoomRow(code, {
      players,
      status: isTableFull ? 'playing' : 'lobby',
      ...(dealt ? { state: dealt, turn: seats[0] } : {}),
    })
    if (!updated) {
      return postApiError(res, { status: 404, code: 'ROOM_NOT_FOUND', message: 'Room not found' })
    }
    postGameRoomEvent(code, updated)

    return postApiSuccess(res, {
      data: { ...getGameRoomView(updated, takenSeat), token: nextToken },
      message: 'Room joined successfully',
    })
  } catch {
    return postApiError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    })
  }
}
