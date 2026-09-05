'use client'

import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useGameInvitesControllers } from '../controllers/gameInvitesControllers'
import { useGameInvitesStates } from '../states/gameInvitesStates'

export default function GameInvitesToast() {
  const router = useRouter()
  const { gameInvites } = useGameInvitesControllers()
  const { setGameInvites } = useGameInvitesStates()

  const data = useMemo(
    () => ({
      isVisible: gameInvites.status === 'success' && !!gameInvites.data,
      invite: gameInvites.data,
    }),
    [gameInvites],
  )

  const submitGameInvitesAccept = () => {
    if (!data.invite) return
    router.push(`/${data.invite.game}/${data.invite.roomCode}`)
    clearGameInvitesToast()
  }
  const clearGameInvitesToast = () => {
    setGameInvites({ status: 'empty', data: null })
  }

  if (!data.isVisible || !data.invite) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex w-full max-w-[360px] items-center gap-3 rounded-2xl border border-[#26262b] bg-[#121214] p-4 shadow-lg">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#f2ede1]">
            {data.invite.fromName || 'Teman'} mengajak main
          </p>
          <p className="truncate text-[11px] text-[#a29d93]">Kode ruangan {data.invite.roomCode}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={submitGameInvitesAccept}
            className="rounded-full bg-[#f2ede1] px-3 py-1.5 text-[11px] font-semibold text-[#0a0a0b]"
          >
            Gabung
          </button>
          <button
            type="button"
            onClick={clearGameInvitesToast}
            className="rounded-full border border-[#3a3a42] px-3 py-1.5 text-[11px] font-semibold text-[#f2ede1]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
