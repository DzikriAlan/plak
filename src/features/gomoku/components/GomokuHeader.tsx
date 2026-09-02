'use client'

import GameSoundToggle from '@/shared/components/reusable/GameSoundToggle'

interface Props {
  onLoadGomokuExit: () => void
  isSoundOn: boolean
  isInviteVisible?: boolean
  isInviteLoading?: boolean
  onSubmitGomokuInvite?: () => void
  onLoadGomokuGuide: () => void
  onEditGomokuSound: () => void
}

export default function GomokuHeader({
  onLoadGomokuExit,
  isSoundOn,
  isInviteVisible = false,
  isInviteLoading = false,
  onSubmitGomokuInvite,
  onLoadGomokuGuide,
  onEditGomokuSound,
}: Props) {
  return (
    <header className="shrink-0 space-y-3">
      <div className="flex min-h-[48px] items-stretch gap-2">
        <button
          type="button"
          onClick={onLoadGomokuExit}
          aria-label="Back to Waitplay Game Collection"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#26262b] bg-[#121214] px-2 transition-colors hover:border-[#43434d] sm:px-3"
        >
          <span className="text-[10px] leading-none text-[#a29d93]">&#9664;</span>
          <span className="text-sm font-black uppercase leading-none tracking-tighter text-[#f2ede1] sm:text-base">
            Gomoku
          </span>
        </button>

        {isInviteVisible ? (
          <button
            type="button"
            disabled={isInviteLoading}
            onClick={onSubmitGomokuInvite}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#26262b] bg-[#121214] px-2 text-[#f2ede1] transition-colors hover:border-[#43434d] disabled:opacity-45"
          >
            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="8.5" r="3.2" />
              <path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" strokeLinecap="round" />
              <path d="M18 8v6M21 11h-6" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em]">
              {isInviteLoading ? 'Menyiapkan…' : 'Main berdua'}
            </span>
          </button>
        ) : (
          <div className="flex-1" />
        )}

        <button
          type="button"
          aria-label="Panduan permainan"
          onClick={onLoadGomokuGuide}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] text-[#f2ede1] transition-colors hover:border-[#43434d]"
        >
          <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.6 9.4a2.5 2.5 0 1 1 3.2 2.4c-.6.2-.9.7-.9 1.3v.5" strokeLinecap="round" />
            <path d="M12 17h.01" strokeLinecap="round" />
          </svg>
        </button>

        <GameSoundToggle isSoundOn={isSoundOn} className="w-[38px] shrink-0" onEditGameSound={onEditGomokuSound} />
      </div>
    </header>
  )
}
