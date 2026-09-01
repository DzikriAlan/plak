import type { NextApiRequest, NextApiResponse } from 'next'
import { getGameRoomAppliedMove, getGameRoomSeat, getGameRoomView } from '@/shared/lib/gameRoom'
import { getGameRoomRow, updateGameRoomRow } from '@/shared/lib/gameRoomStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const code = String(req.query.code ?? '').toUpperCase()
  const token = String(req.body?.token ?? '')
  const holeIndex = Number(req.body?.holeIndex)
  const from = String(req.body?.from ?? '')
  const to = String(req.body?.to ?? '')
  const promotion = String(req.body?.promotion ?? '')
  const action = String(req.body?.action ?? '')
  const cardId = String(req.body?.cardId ?? '')
  const color = String(req.body?.color ?? '')

  try {
    const room = await getGameRoomRow(code)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    const seat = getGameRoomSeat(room.players, token)
    if (!seat) return res.status(403).json({ message: 'Seat not found' })

    const applied = getGameRoomAppliedMove(room, seat, {
      holeIndex,
      from,
      to,
      promotion: promotion || undefined,
      action: action || undefined,
      cardId: cardId || undefined,
      color: color || undefined,
    })
    if (!applied) return res.status(422).json({ message: 'Move not allowed' })

    const updated = await updateGameRoomRow(code, applied)
    if (!updated) return res.status(404).json({ message: 'Room not found' })

    return res.status(200).json({ ...getGameRoomView(updated, seat), token })
  } catch {
    return res.status(500).json({ message: 'Failed to apply move' })
  }
}
