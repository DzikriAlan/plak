import type {
  PayloadGetGameRooms,
  PayloadPostGameRooms,
  PayloadPostGameRoomsJoin,
  PayloadPostGameRoomsMove,
  PayloadPostGameRoomsLeave,
  PayloadPostGameRoomsSeats,
  PayloadPostGameRoomsStart,
} from '../types/gameRoomsTypes'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

// Aliran dipakai untuk menerima perubahan ruangan tanpa menunggu penarikan berikutnya.
export const getGameRoomsStream = (payload: PayloadGetGameRooms) => {
  if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') return null
  const queryString = '?' + new URLSearchParams({ token: payload.token }).toString()
  return new EventSource(`${baseUrl}/api/v1/game-rooms/${payload.code}/stream${queryString}`)
}

export const postGameRooms = async (payload: PayloadPostGameRooms) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/game-rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getGameRooms = async (payload: PayloadGetGameRooms) => {
  try {
    const queryString = '?' + new URLSearchParams({ token: payload.token }).toString()
    const res = await fetch(`${baseUrl}/api/v1/game-rooms/${payload.code}${queryString}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postGameRoomsJoin = async (payload: PayloadPostGameRoomsJoin) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/game-rooms/${payload.code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: payload.token, name: payload.name }),
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postGameRoomsStart = async (payload: PayloadPostGameRoomsStart) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/game-rooms/${payload.code}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: payload.token }),
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postGameRoomsSeats = async (payload: PayloadPostGameRoomsSeats) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/game-rooms/${payload.code}/seats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: payload.token, seatTotal: payload.seatTotal }),
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postGameRoomsLeave = async (payload: PayloadPostGameRoomsLeave) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/game-rooms/${payload.code}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: payload.token }),
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postGameRoomsMove = async (payload: PayloadPostGameRoomsMove) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/game-rooms/${payload.code}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: payload.token,
        holeIndex: payload.holeIndex,
        from: payload.from,
        to: payload.to,
        promotion: payload.promotion,
        action: payload.action,
        cardId: payload.cardId,
        color: payload.color,
      }),
    })
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}
