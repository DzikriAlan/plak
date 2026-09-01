import type { NextApiRequest, NextApiResponse } from 'next'
import {
  GAME_ROOM_SEAT_TOTAL,
  getGameRoomCode,
  getGameRoomNewState,
  getGameRoomToken,
  getGameRoomView,
} from '@/shared/lib/gameRoom'
import { getGameRoomRow, postGameRoomRow } from '@/shared/lib/gameRoomStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const game = String(req.body?.game ?? '')
  const name = String(req.body?.name ?? 'Pemain 1').slice(0, 24)
  const seatTotal = GAME_ROOM_SEAT_TOTAL[game]
  if (!seatTotal) return res.status(422).json({ message: 'Game not supported' })

  const postRoom = async (token: string) => {
    // Kode acak diulang bila bentrok dengan ruangan yang masih tersimpan.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = getGameRoomCode()
      const found = await getGameRoomRow(code)
      if (found) continue
      return postGameRoomRow({
        code,
        game,
        status: 'lobby',
        seatTotal,
        players: [{ seat: 'p1', token, name }],
        turn: 'p1',
        state: getGameRoomNewState(game),
        moveTotal: 0,
        winner: '',
      })
    }
    return null
  }

  try {
    const token = getGameRoomToken()
    const room = await postRoom(token)
    if (!room) return res.status(503).json({ message: 'Room code unavailable' })
    return res.status(201).json({ ...getGameRoomView(room, 'p1'), token })
  } catch {
    return res.status(500).json({ message: 'Failed to create room' })
  }
}
