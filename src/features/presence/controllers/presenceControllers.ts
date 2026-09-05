import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { usePresenceStates } from '../states/presenceStates'
import { getPresenceChannel } from '../services/presenceServices'
import type { DataPresence } from '../types/presenceTypes'

// Presence yang disebar lewat kunci anon publik: payload berisi id/nama/avatar yang sudah publik
// lewat profil Google, jadi risikonya sebatas kosmetik (lihat CODE plan) — bukan data sensitif.
export const usePresenceControllers = () => {
  const { data: session, status: sessionStatus } = useSession()
  const { presence, setPresence } = usePresenceStates()

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !session?.user) return

    const userId = session.user.id
    const name = session.user.name ?? ''
    const image = session.user.image ?? ''
    const channel = getPresenceChannel({ userId, name, image })
    if (!channel) return

    let current: RealtimeChannel | null = channel

    const loadPresenceSync = () => {
      const state = channel.presenceState<DataPresence>()
      const online = Object.values(state)
        .map((entries) => entries[0])
        .filter((entry): entry is DataPresence & { presence_ref: string } => !!entry)
        .map(({ userId: onlineUserId, name: onlineName, image: onlineImage }) => ({
          userId: onlineUserId,
          name: onlineName,
          image: onlineImage,
        }))
      setPresence({ status: online.length ? 'success' : 'empty', data: online })
    }

    channel
      .on('presence', { event: 'sync' }, loadPresenceSync)
      .subscribe(async (subscribeStatus) => {
        if (subscribeStatus !== 'SUBSCRIBED') return
        await channel.track({ userId, name, image })
      })

    return () => {
      current?.untrack()
      current?.unsubscribe()
      current = null
    }
  }, [session?.user, sessionStatus, setPresence])

  return { presence }
}
