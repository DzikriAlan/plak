'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useFriendsControllers } from '../controllers/friendsControllers'
import { usePresenceControllers } from '@/features/presence/controllers/presenceControllers'
import { useGameInvitesControllers } from '@/features/game-invites/controllers/gameInvitesControllers'
import { useGameRoomsStates } from '@/features/game-rooms/states/gameRoomsStates'
import FriendsAdd from './FriendsAdd'
import FriendsRequests from './FriendsRequests'
import FriendsList from './FriendsList'

export default function FriendsPage() {
  const { status: sessionStatus } = useSession()
  const { friends, removeFriends } = useFriendsControllers()
  const { presence } = usePresenceControllers()
  const { storeGameInvites } = useGameInvitesControllers()
  const { gameRooms } = useGameRoomsStates()

  const data = useMemo(() => {
    // Selama sesi belum pasti, tidak ada kartu yang ditampilkan supaya prompt "masuk dulu" tidak
    // sempat berkedip sebelum status login diketahui.
    const getView = () => {
      if (sessionStatus === 'loading') return 'pending'
      if (sessionStatus === 'authenticated') return 'ready'
      return 'guest'
    }

    const onlineIds = new Set((presence.data ?? []).map((entry) => entry.userId))
    const list = (friends.data ?? []).map((friend) => ({ ...friend, isOnline: onlineIds.has(friend.id) }))
    const activeRoom = gameRooms.data
    // Undangan hanya masuk akal saat pemain sedang berada di sebuah ruangan yang belum selesai.
    const isInviteAvailable = !!activeRoom && !!activeRoom.code && activeRoom.status !== 'finished'

    return { list, isInviteAvailable, activeRoom, view: getView(), isFriendsReady: friends.status !== 'loading' }
  }, [friends, presence, gameRooms, sessionStatus])

  const submitFriendsInvite = (friendId: string) => {
    if (!data.activeRoom) return
    storeGameInvites.mutate({ toUserId: friendId, roomCode: data.activeRoom.code, game: data.activeRoom.game })
  }
  const clearFriends = (friendId: string) => {
    removeFriends.mutate({ id: friendId })
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0b] text-[#f2ede1]">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">
            &larr; Waitplay
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Teman</p>
        </header>

        {data.view === 'guest' ? (
          <div className="rounded-2xl border border-[#26262b] bg-[#121214] p-4 text-center">
            <p className="text-[12px] text-[#a29d93]">Masuk dulu untuk mengelola daftar teman.</p>
            <Link
              href="/login"
              className="mt-3 inline-block rounded-full bg-[#f2ede1] px-4 py-2 text-[12px] font-semibold text-[#0a0a0b]"
            >
              Masuk dengan Google
            </Link>
          </div>
        ) : null}

        {data.view === 'ready' ? (
          <>
            <FriendsAdd />
            <FriendsRequests />
            {data.isFriendsReady ? (
              <FriendsList
                friends={data.list}
                isInviteAvailable={data.isInviteAvailable}
                onSubmitFriendsInvite={submitFriendsInvite}
                onClearFriends={clearFriends}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
