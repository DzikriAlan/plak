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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const code = String(req.query.code ?? '').toUpperCase()
  const token = String(req.body?.token ?? '')
  const name = String(req.body?.name ?? '').slice(0, 24)

  try {
    const room = await getGameRoomRow(code)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    // Pemain yang sudah punya kursi cukup memakai kursinya kembali saat halaman dimuat ulang.
    const seat = getGameRoomSeat(room.players, token)
    if (seat) return res.status(200).json({ ...getGameRoomView(room, seat), token })

    const nextToken = getGameRoomToken()
    const freeSeat = getGameRoomFreeSeat(room.players, room.seatTotal)
    // Kursi kosong dipakai lebih dulu; bila penuh, kursi yang ditinggalkan boleh diambil alih.
    const takenSeat = freeSeat ?? getGameRoomAbandonedSeat(room.players)
    if (!takenSeat) return res.status(409).json({ message: 'Room is full' })

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
    if (!updated) return res.status(404).json({ message: 'Room not found' })
    postGameRoomEvent(code, updated)

    return res.status(200).json({ ...getGameRoomView(updated, takenSeat), token: nextToken })
  } catch {
    return res.status(500).json({ message: 'Failed to join room' })
  }
}
