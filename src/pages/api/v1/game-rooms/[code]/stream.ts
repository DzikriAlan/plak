import type { NextApiRequest, NextApiResponse } from 'next'
import { getGameRoomSeat, getGameRoomView } from '@/shared/lib/gameRoom'
import type { GameRoomRow } from '@/shared/lib/gameRoomStore'
import { getGameRoomRow } from '@/shared/lib/gameRoomStore'
import { getGameRoomSubscription } from '@/shared/lib/gameRoomEvents'

const PING_INTERVAL = 15000
// Siaran dalam proses menutup kebutuhan utama; pembacaan cadangan tetap ada supaya perubahan dari
// instans lain ikut terkirim tanpa membebani basis data secara berlebihan.
const SAFETY_INTERVAL = 4000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const code = String(req.query.code ?? '').toUpperCase()
  const token = String(req.query.token ?? '')

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  // Peramban menahan potongan awal aliran sampai penyangganya terisi, jadi diberi bantalan
  // komentar supaya pesan pertama dan berikutnya langsung diteruskan ke halaman.
  res.write(`:${' '.repeat(2048)}\n\n`)

  let lastSent = ''
  let isClosed = false

  const postRoomState = async (known: GameRoomRow | null = null) => {
    if (isClosed) return
    try {
      const room = known ?? (await getGameRoomRow(code))
      if (!room) return
      const seat = getGameRoomSeat(room.players, token)
      const view = { ...getGameRoomView(room, seat), token: seat ? token : '' }
      const payload = JSON.stringify(view)
      // Cap waktu diabaikan saat membandingkan supaya keadaan yang sama tidak dikirim dua kali.
      const fingerprint = JSON.stringify({ ...view, updatedAt: '' })
      if (fingerprint === lastSent) return
      lastSent = fingerprint
      res.write(`data: ${payload}\n\n`)
    } catch {
      return
    }
  }

  await postRoomState()
  // Siaran dalam proses memberi kabar seketika, penarikan cadangan menjaga bila ada instans lain.
  const clearSubscription = getGameRoomSubscription(code, (row) => {
    void postRoomState(row)
  })
  const safetyTimer = setInterval(() => void postRoomState(), SAFETY_INTERVAL)
  const pingTimer = setInterval(() => {
    if (!isClosed) res.write(': ping\n\n')
  }, PING_INTERVAL)

  req.on('close', () => {
    isClosed = true
    clearSubscription()
    clearInterval(safetyTimer)
    clearInterval(pingTimer)
    res.end()
  })
}
