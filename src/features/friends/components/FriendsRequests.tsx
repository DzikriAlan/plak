'use client'

import { useMemo } from 'react'
import { useFriendsControllers } from '../controllers/friendsControllers'

export default function FriendsRequests() {
  const { friendsRequests, modifyFriendsRequests } = useFriendsControllers()

  const data = useMemo(() => {
    const requests = friendsRequests.data ?? []
    const incoming = requests.filter((request) => request.direction === 'incoming')
    const outgoing = requests.filter((request) => request.direction === 'outgoing')
    return {
      incoming,
      outgoing,
      isHidden: !incoming.length && !outgoing.length,
    }
  }, [friendsRequests])

  const editFriendsRequests = (id: string, action: 'accept' | 'decline') => {
    modifyFriendsRequests.mutate({ id, action })
  }

  if (data.isHidden) return null

  return (
    <div className="rounded-2xl border border-[#26262b] bg-[#121214] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Permintaan pertemanan</p>

      {data.incoming.length ? (
        <ul className="mt-3 flex flex-col gap-2">
          {data.incoming.map((request) => (
            <li
              key={request.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#26262b] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#f2ede1]">
                  {request.user.name || request.user.email}
                </p>
                <p className="truncate text-[11px] text-[#a29d93]">Ingin berteman denganmu</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={modifyFriendsRequests.isPending}
                  onClick={() => editFriendsRequests(request.id, 'accept')}
                  className="rounded-full bg-[#f2ede1] px-3 py-1.5 text-[11px] font-semibold text-[#0a0a0b] disabled:opacity-40"
                >
                  Terima
                </button>
                <button
                  type="button"
                  disabled={modifyFriendsRequests.isPending}
                  onClick={() => editFriendsRequests(request.id, 'decline')}
                  className="rounded-full border border-[#3a3a42] px-3 py-1.5 text-[11px] font-semibold text-[#f2ede1] disabled:opacity-40"
                >
                  Tolak
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {data.outgoing.length ? (
        <ul className="mt-3 flex flex-col gap-2">
          {data.outgoing.map((request) => (
            <li
              key={request.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#3a3a42] px-3 py-2"
            >
              <p className="truncate text-[13px] text-[#a29d93]">
                Menunggu {request.user.name || request.user.email}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
