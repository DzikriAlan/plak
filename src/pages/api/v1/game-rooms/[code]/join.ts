import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getGameRoomDealtState,
  getGameRoomFreeSeat,
  getGameRoomSeat,
  getGameRoomToken,
  getGameRoomView,
} from '@/shared/lib/gameRoom'
import { getGameRoomRow, updateGameRoomRow } from '@/shared/lib/gameRoomStore'

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

    const freeSeat = getGameRoomFreeSeat(room.players, room.seatTotal)
    if (!freeSeat) return res.status(409).json({ message: 'Room is full' })

    const nextToken = getGameRoomToken()
    const players = [
      ...room.players,
      { seat: freeSeat, token: nextToken, name: name || `Pemain ${room.players.length + 1}` },
    ]
    const isTableFull = players.length >= room.seatTotal
    const seats = players.map((player) => player.seat)
    const dealt = isTableFull ? getGameRoomDealtState(room.game, seats) : null
    const updated = await updateGameRoomRow(code, {
      players,
      status: isTableFull ? 'playing' : 'lobby',
      ...(dealt ? { state: dealt, turn: seats[0] } : {}),
    })
    if (!updated) return res.status(404).json({ message: 'Room not found' })

    return res.status(200).json({ ...getGameRoomView(updated, freeSeat), token: nextToken })
  } catch {
    return res.status(500).json({ message: 'Failed to join room' })
  }
}
