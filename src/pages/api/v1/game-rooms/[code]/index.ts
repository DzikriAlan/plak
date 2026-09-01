import type { NextApiRequest, NextApiResponse } from 'next'
import { getGameRoomSeat, getGameRoomView } from '@/shared/lib/gameRoom'
import { getGameRoomRow } from '@/shared/lib/gameRoomStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const code = String(req.query.code ?? '').toUpperCase()
  const token = String(req.query.token ?? '')

  try {
    const room = await getGameRoomRow(code)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    const seat = getGameRoomSeat(room.players, token)
    return res.status(200).json({ ...getGameRoomView(room, seat), token: seat ? token : '' })
  } catch {
    return res.status(500).json({ message: 'Failed to load room' })
  }
}
