'use client'

interface Props {
  code: string
  inviteUrl: string
  playerTotal: number
  seatTotal: number
  isCopied: boolean
  isStartVisible?: boolean
  isStartDisabled?: boolean
  onSubmitGameRoomsInvite: () => void
  onSubmitGameRoomsStart?: () => void
}

export default function GameRoomsInvite({
  code,
  inviteUrl,
  playerTotal,
  seatTotal,
  isCopied,
  isStartVisible = false,
  isStartDisabled = false,
  onSubmitGameRoomsInvite,
  onSubmitGameRoomsStart,
}: Props) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/85 px-6 backdrop-blur-sm">
      <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Undang teman</p>
        <p className="mt-2 text-3xl font-black uppercase leading-none tracking-tighter text-[#f2ede1]">{code}</p>
        <p className="mt-3 text-[11px] leading-snug text-[#a29d93]">
          Kirim tautan ini ke temanmu. Permainan mulai begitu semua pemain bergabung.
        </p>

        <p className="mt-4 truncate rounded-xl border border-[#26262b] bg-[#0a0a0b] px-3 py-3 text-[11px] text-[#f2ede1]">
          {inviteUrl}
        </p>

        <button
          type="button"
          onClick={onSubmitGameRoomsInvite}
          className="mt-3 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
        >
          {isCopied ? 'Tautan tersalin' : 'Salin tautan'}
        </button>

        {isStartVisible ? (
          <button
            type="button"
            disabled={isStartDisabled}
            onClick={onSubmitGameRoomsStart}
            className="mt-2 w-full rounded-xl border border-[#f2ede1] py-3 text-[13px] font-semibold text-[#f2ede1] transition-colors hover:bg-[#f2ede1] hover:text-[#0a0a0b] disabled:opacity-35"
          >
            Mulai sekarang
          </button>
        ) : null}

        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">
          Menunggu pemain {playerTotal}/{seatTotal}
        </p>
      </div>
    </div>
  )
}
