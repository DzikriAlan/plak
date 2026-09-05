import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const globalForSupabase = globalThis as unknown as {
  supabaseRealtime: SupabaseClient | undefined
}

// Klien tunggal dipakai bersama browser dan server (kunci anon yang sama, tanpa rahasia baru)
// khusus untuk kanal Realtime (presence & broadcast), bukan untuk akses tabel/Prisma.
export const getSupabaseRealtimeClient = () => {
  if (globalForSupabase.supabaseRealtime) return globalForSupabase.supabaseRealtime

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const client = createClient(url, anonKey, {
    auth: { persistSession: false },
  })
  globalForSupabase.supabaseRealtime = client
  return client
}
