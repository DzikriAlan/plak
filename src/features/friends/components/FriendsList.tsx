'use client'

interface FriendItem {
  id: string
  name: string
  email: string
  image: string
  isOnline: boolean
}

interface Props {
  friends: FriendItem[]
  isInviteAvailable: boolean
  onSubmitFriendsInvite?: (friendId: string) => void
  onClearFriends: (friendId: string) => void
}

export default function FriendsList({ friends, isInviteAvailable, onSubmitFriendsInvite, onClearFriends }: Props) {
  if (!friends.length) {
    return (
      <div className="rounded-2xl border border-[#26262b] bg-[#121214] p-4 text-center">
        <p className="text-[12px] text-[#a29d93]">Belum ada teman. Cari lewat email untuk menambah.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#26262b] bg-[#121214] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">
        Teman ({friends.length})
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {friends.map((friend) => (
          <li key={friend.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#26262b] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full ${friend.isOnline ? 'bg-emerald-400' : 'bg-[#3a3a42]'}`}
              />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#f2ede1]">{friend.name || friend.email}</p>
                <p className="truncate text-[11px] text-[#a29d93]">{friend.isOnline ? 'Online' : 'Offline'}</p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              {friend.isOnline && isInviteAvailable ? (
                <button
                  type="button"
                  onClick={() => onSubmitFriendsInvite?.(friend.id)}
                  className="rounded-full bg-[#f2ede1] px-3 py-1.5 text-[11px] font-semibold text-[#0a0a0b]"
                >
                  Undang
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onClearFriends(friend.id)}
                className="rounded-full border border-[#3a3a42] px-3 py-1.5 text-[11px] font-semibold text-[#f2ede1]"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
