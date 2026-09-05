import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useGameInvitesStates } from '../states/gameInvitesStates'
import { getGameInvitesChannel, postGameInvites } from '../services/gameInvitesServices'
import type { DataGameInvites, PayloadPostGameInvites } from '../types/gameInvitesTypes'

export const useGameInvitesControllers = () => {
  const { data: session, status: sessionStatus } = useSession()
  const { gameInvites, setGameInvites } = useGameInvitesStates()

  const storeGameInvites = useMutation({
    mutationFn: (payload: PayloadPostGameInvites) => postGameInvites(payload),
  })

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !session?.user) return

    const channel = getGameInvitesChannel({ userId: session.user.id })
    if (!channel) return

    channel
      .on('broadcast', { event: 'invite' }, ({ payload }: { payload: DataGameInvites }) => {
        setGameInvites({ status: 'success', data: payload })
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [session?.user, sessionStatus, setGameInvites])

  return { gameInvites, storeGameInvites }
}
