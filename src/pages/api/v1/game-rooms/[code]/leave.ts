import type { NextApiRequest, NextApiResponse } from 'next'
import { getGameRoomSeat, getGameRoomView } from '@/shared/lib/gameRoom'
import { getGameRoomRow, updateGameRoomRow } from '@/shared/lib/gameRoomStore'

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
    if (room.status === 'finished') return res.status(200).json({ ...getGameRoomView(room, seat), token })

    // Pemain yang keluar mengakhiri sesi; lawan terakhir yang bertahan dinyatakan menang.
    const rivals = room.players.filter((player) => player.seat !== seat)
    const updated = await updateGameRoomRow(code, {
      status: 'finished',
      winner: rivals.length === 1 ? rivals[0].seat : '',
      state: { ...room.state, leftSeat: seat },
    })
    if (!updated) return res.status(404).json({ message: 'Room not found' })

    return res.status(200).json({ ...getGameRoomView(updated, seat), token })
  } catch {
    return res.status(500).json({ message: 'Failed to leave room' })
  }
}
