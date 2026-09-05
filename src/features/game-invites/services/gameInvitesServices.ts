import { getSupabaseRealtimeClient } from '@/shared/lib/supabaseRealtime'
import type { PayloadPostGameInvites } from '../types/gameInvitesTypes'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export const getGameInvitesBody = async (res: Response) => {
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.success) {
    throw new Error(body?.error?.message ?? res.statusText)
  }
  return body.data
}

export const postGameInvites = async (payload: PayloadPostGameInvites) => {
  try {
    const res = await fetch(`${baseUrl}/api/v1/game-invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return getGameInvitesBody(res)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

// Kanal ini hanya menerima siaran undangan milik pengguna sendiri, dikirim dari server lewat
// endpoint di atas — bukan disiarkan langsung antar klien.
export const getGameInvitesChannel = (payload: { userId: string }) => {
  const client = getSupabaseRealtimeClient()
  if (!client) return null
  return client.channel(`invites:${payload.userId}`)
}
