'use client'

interface Props {
  code: string
  seatOptions?: number[]
  seatLabel?: string
  isSeatEditable?: boolean
  isSeatLoading?: boolean
  onEditGameRoomsSeats?: (seatTotal: number) => void
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
  seatOptions = [],
  seatLabel = 'Jumlah pemain',
  isSeatEditable = false,
  isSeatLoading = false,
  onEditGameRoomsSeats,
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
        {isSeatEditable && seatOptions.length ? (
          <div className="mt-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">{seatLabel}</p>
            <div className="mt-2 flex justify-center gap-2">
              {seatOptions.map((option) => {
                const isActive = option === seatTotal
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isActive}
                    disabled={isSeatLoading || option < playerTotal}
                    onClick={() => onEditGameRoomsSeats?.(option)}
                    className={`h-10 w-12 rounded-xl border text-[13px] font-black transition-colors disabled:opacity-35 ${
                      isActive
                        ? 'border-[#f2ede1] bg-[#f2ede1] text-[#0a0a0b]'
                        : 'border-[#3a3a42] text-[#f2ede1] hover:border-[#f2ede1]'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

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
