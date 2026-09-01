import type { NextApiRequest, NextApiResponse } from 'next'
import { getGameRoomDealtState, getGameRoomSeat, getGameRoomView } from '@/shared/lib/gameRoom'
import { getGameRoomRow, updateGameRoomRow } from '@/shared/lib/gameRoomStore'
import { postGameRoomEvent } from '@/shared/lib/gameRoomEvents'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const code = String(req.query.code ?? '').toUpperCase()
  const token = String(req.body?.token ?? '')

  try {
    const room = await getGameRoomRow(code)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    const seat = getGameRoomSeat(room.players, token)
    if (!seat) return res.status(403).json({ message: 'Seat not found' })
    // Hanya tuan rumah yang boleh memulai, dan meja baru dibagikan sekali.
    if (seat !== room.players[0]?.seat) return res.status(403).json({ message: 'Only the host can start' })
    if (room.status !== 'lobby') return res.status(409).json({ message: 'Room already started' })

    const seats = room.players.map((player) => player.seat)
    const state = getGameRoomDealtState(room.game, seats)
    if (!state) return res.status(422).json({ message: 'Not enough players' })

    const updated = await updateGameRoomRow(code, { status: 'playing', state, turn: seats[0], moveTotal: 0 })
    if (!updated) return res.status(404).json({ message: 'Room not found' })
    postGameRoomEvent(code, updated)

    return res.status(200).json({ ...getGameRoomView(updated, seat), token })
  } catch {
    return res.status(500).json({ message: 'Failed to start room' })
  }
}
