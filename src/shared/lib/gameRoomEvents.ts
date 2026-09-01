import type { GameRoomRow } from './gameRoomStore'

type GameRoomListener = (row: GameRoomRow | null) => void

const globalForEvents = globalThis as unknown as {
  gameRoomListeners: Map<string, Set<GameRoomListener>> | undefined
}
const listeners = globalForEvents.gameRoomListeners ?? new Map<string, Set<GameRoomListener>>()
globalForEvents.gameRoomListeners = listeners

export const postGameRoomEvent = (code: string, row: GameRoomRow | null = null) => {
  const room = listeners.get(code)
  if (!room) return
  room.forEach((listener) => {
    try {
      listener(row)
    } catch {
      return
    }
  })
}

export const getGameRoomSubscription = (code: string, listener: GameRoomListener) => {
  const room = listeners.get(code) ?? new Set<GameRoomListener>()
  room.add(listener)
  listeners.set(code, room)

  return () => {
    room.delete(listener)
    if (!room.size) listeners.delete(code)
  }
}
