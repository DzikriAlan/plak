import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import type { GameRoomPlayer } from './gameRoom'

export type GameRoomRow = {
  code: string
  game: string
  status: string
  seatTotal: number
  players: GameRoomPlayer[]
  turn: string
  state: Record<string, unknown>
  moveTotal: number
  winner: string
  updatedAt: Date
}

export type GameRoomPatch = Partial<Omit<GameRoomRow, 'code' | 'updatedAt'>>

// Ruangan disimpan di Postgres Supabase bila string koneksinya terisi; selain itu dipakai memori
// proses supaya mode pengembangan tetap bisa dijalankan tanpa basis data.
const getIsDatabaseReady = () => /^postgres(ql)?:\/\//.test(process.env.SUPABASE_CONNECTION_STRING ?? '')

const globalForRooms = globalThis as unknown as {
  gameRooms: Map<string, GameRoomRow> | undefined
  gameRoomsCache: Map<string, { row: GameRoomRow; at: number }> | undefined
  gameRoomsFallback: boolean | undefined
}
const memoryRooms = globalForRooms.gameRooms ?? new Map<string, GameRoomRow>()
globalForRooms.gameRooms = memoryRooms

// Ruangan yang baru saja dibaca atau ditulis disimpan sebentar supaya setiap langkah tidak
// menunggu perjalanan bolak-balik ke basis data yang jauh.
const CACHE_TTL = 10000
const cachedRooms = globalForRooms.gameRoomsCache ?? new Map<string, { row: GameRoomRow; at: number }>()
globalForRooms.gameRoomsCache = cachedRooms

const getCachedRoom = (code: string) => {
  const found = cachedRooms.get(code)
  if (!found) return null
  if (Date.now() - found.at > CACHE_TTL) {
    cachedRooms.delete(code)
    return null
  }
  return found.row
}

const postCachedRoom = (row: GameRoomRow) => {
  cachedRooms.set(row.code, { row, at: Date.now() })
}

// Di luar produksi, basis data yang tidak terjangkau dialihkan ke memori supaya permainan tetap
// bisa dicoba; di produksi kegagalan tetap dilempar agar salah konfigurasi cepat ketahuan.
const getIsFallbackAllowed = () => process.env.NODE_ENV !== 'production'

const getIsMemoryMode = () => !getIsDatabaseReady() || (globalForRooms.gameRoomsFallback ?? false)

const postFallbackMode = (error: unknown) => {
  if (!getIsFallbackAllowed()) throw error
  globalForRooms.gameRoomsFallback = true
  console.warn('[game-rooms] Basis data tidak terjangkau, ruangan dialihkan ke memori proses.')
}

export const getGameRoomStoreMode = () => (getIsMemoryMode() ? 'memory' : 'database')

export const getGameRoomRow = async (code: string): Promise<GameRoomRow | null> => {
  if (getIsMemoryMode()) return memoryRooms.get(code) ?? null

  const cached = getCachedRoom(code)
  if (cached) return cached

  const room = await prisma.gameRoom.findUnique({ where: { code } }).catch((error) => {
    postFallbackMode(error)
    return null
  })
  if (!room) return getIsMemoryMode() ? memoryRooms.get(code) ?? null : null

  const row: GameRoomRow = {
    code: room.code,
    game: room.game,
    status: room.status,
    seatTotal: room.seatTotal,
    players: (room.players ?? []) as GameRoomPlayer[],
    turn: room.turn,
    state: (room.state ?? {}) as Record<string, unknown>,
    moveTotal: room.moveTotal,
    winner: room.winner,
    updatedAt: room.updatedAt,
  }
  postCachedRoom(row)
  return row
}

export const postGameRoomRow = async (row: Omit<GameRoomRow, 'updatedAt'>) => {
  const created: GameRoomRow = { ...row, updatedAt: new Date() }
  if (getIsMemoryMode()) {
    memoryRooms.set(row.code, created)
    return created
  }

  const stored = await prisma.gameRoom.create({
    data: {
      code: row.code,
      game: row.game,
      status: row.status,
      seatTotal: row.seatTotal,
      players: row.players as unknown as Prisma.InputJsonValue,
      turn: row.turn,
      state: row.state as Prisma.InputJsonValue,
      moveTotal: row.moveTotal,
      winner: row.winner,
    },
  }).catch((error) => {
    postFallbackMode(error)
    return null
  })
  if (!stored) memoryRooms.set(row.code, created)
  postCachedRoom(created)
  return created
}

// Kehadiran cukup ditulis berkala supaya basis data tidak dibanjiri denyut dari setiap pemain.
// Jadwal tulisnya dicatat terpisah karena cache selalu memegang waktu terlihat yang terbaru.
const SEEN_WRITE_INTERVAL = 8000
const seenWrites = new Map<string, number>()

export const updateGameRoomSeen = async (code: string, token: string) => {
  if (!token) return null
  const room = await getGameRoomRow(code)
  if (!room) return null

  const now = Date.now()
  const found = room.players.find((player) => player.token === token)
  if (!found) return room

  const players = room.players.map((player) => (player.token === token ? { ...player, seenAt: now } : player))
  const isWriteDue = now - (seenWrites.get(token) ?? 0) > SEEN_WRITE_INTERVAL
  if (!isWriteDue) {
    postCachedRoom({ ...room, players })
    return { ...room, players }
  }

  seenWrites.set(token, now)
  return updateGameRoomRow(code, { players })
}

export const updateGameRoomRow = async (code: string, patch: GameRoomPatch): Promise<GameRoomRow | null> => {
  const updateMemoryRow = () => {
    const found = memoryRooms.get(code)
    if (!found) return null
    const next: GameRoomRow = { ...found, ...patch, updatedAt: new Date() }
    memoryRooms.set(code, next)
    postCachedRoom(next)
    return next
  }

  if (getIsMemoryMode()) return updateMemoryRow()

  const room = await prisma.gameRoom.update({
    where: { code },
    data: {
      status: patch.status,
      seatTotal: patch.seatTotal,
      players: patch.players as unknown as Prisma.InputJsonValue | undefined,
      turn: patch.turn,
      state: patch.state as Prisma.InputJsonValue | undefined,
      moveTotal: patch.moveTotal,
      winner: patch.winner,
    },
  }).catch((error) => {
    postFallbackMode(error)
    return null
  })
  if (!room) return updateMemoryRow()

  const next: GameRoomRow = {
    code: room.code,
    game: room.game,
    status: room.status,
    seatTotal: room.seatTotal,
    players: (room.players ?? []) as GameRoomPlayer[],
    turn: room.turn,
    state: (room.state ?? {}) as Record<string, unknown>,
    moveTotal: room.moveTotal,
    winner: room.winner,
    updatedAt: room.updatedAt,
  }
  postCachedRoom(next)
  return next
}
