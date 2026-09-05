import { getSupabaseRealtimeClient } from '@/shared/lib/supabaseRealtime'
import type { PayloadGetPresenceChannel } from '../types/presenceTypes'

const PRESENCE_CHANNEL = 'presence:online-users'

// Sama seperti getGameRoomsStream membungkus EventSource, kanal Supabase Realtime dibungkus di
// sini sebagai primitive SDK, bukan panggilan fetch ke API sendiri.
export const getPresenceChannel = (payload: PayloadGetPresenceChannel) => {
  const client = getSupabaseRealtimeClient()
  if (!client) return null
  return client.channel(PRESENCE_CHANNEL, { config: { presence: { key: payload.userId } } })
}
