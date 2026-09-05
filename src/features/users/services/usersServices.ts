import type { PayloadGetUsersSearch } from '../types/usersTypes'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export const getUsersBody = async (res: Response) => {
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.success) {
    throw new Error(body?.error?.message ?? res.statusText)
  }
  return body.data
}

export const getUsersMe = async () => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/users/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return getUsersBody(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

export const getUsersSearch = async (payload: PayloadGetUsersSearch) => {
  try {
    const queryString = '?' + new URLSearchParams({ email: payload.email }).toString()
    const res = await fetch(`${baseUrl}/api/v1/users/search${queryString}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return getUsersBody(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}
