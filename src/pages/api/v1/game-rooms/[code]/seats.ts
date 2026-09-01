import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getGameRoomDealtState,
  getGameRoomSeat,
  getGameRoomSeatOptions,
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
  const seatTotal = Number(req.body?.seatTotal)

  try {
    const room = await getGameRoomRow(code)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    const seat = getGameRoomSeat(room.players, token)
    if (!seat) return res.status(403).json({ message: 'Seat not found' })
    // Jumlah pemain hanya boleh diatur pemilik ruangan sebelum permainan dimulai.
    if (seat !== room.players[0]?.seat) return res.status(403).json({ message: 'Only the host can set seats' })
    if (room.status !== 'lobby') return res.status(409).json({ message: 'Room already started' })

    const options = getGameRoomSeatOptions(room.game)
    if (!options.includes(seatTotal)) return res.status(422).json({ message: 'Seat total not allowed' })
    if (seatTotal < room.players.length) return res.status(422).json({ message: 'Too many players already joined' })

    // Meja langsung dibagikan bila kursi yang dipilih sudah terisi penuh.
    const seats = room.players.map((player) => player.seat)
    const isTableFull = room.players.length >= seatTotal
    const dealt = isTableFull ? getGameRoomDealtState(room.game, seats) : null
    const updated = await updateGameRoomRow(code, {
      seatTotal,
      status: dealt ? 'playing' : 'lobby',
      ...(dealt ? { state: dealt, turn: seats[0], moveTotal: 0 } : {}),
    })
    if (!updated) return res.status(404).json({ message: 'Room not found' })
    postGameRoomEvent(code, updated)

    return res.status(200).json({ ...getGameRoomView(updated, seat), token })
  } catch {
    return res.status(500).json({ message: 'Failed to set seats' })
  }
}
