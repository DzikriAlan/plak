import type { PayloadPostFriendsRequests } from '../types/friendsTypes'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export const getFriendsBody = async (res: Response) => {
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.success) {
    throw new Error(body?.error?.message ?? res.statusText)
  }
  return body.data
}

export const getFriends = async () => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/friends`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return getFriendsBody(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getFriendsRequests = async () => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/friends/requests`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return getFriendsBody(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const postFriendsRequests = async (payload: PayloadPostFriendsRequests) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/friends/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return getFriendsBody(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

// CODE.md hanya mendefinisikan Payload untuk GET & POST, jadi input PATCH/DELETE ditulis
// sebagai tipe inline pada tanda tangan fungsi, bukan Payload yang tidak dicakup.
export const patchFriendsRequests = async (payload: { id: string; action: 'accept' | 'decline' }) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/friends/requests/${payload.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: payload.action }),
    })
    return getFriendsBody(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const deleteFriends = async (payload: { id: string }) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/friends/${payload.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    return getFriendsBody(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}
