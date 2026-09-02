'use client'

import GameSoundToggle from '@/shared/components/reusable/GameSoundToggle'

interface Props {
  onLoadUnoExit: () => void
  roomCode: string
  turnName: string
  isSoundOn: boolean
  isInviteVisible?: boolean
  isInviteLoading?: boolean
  onSubmitUnoInvite?: () => void
  onLoadUnoGuide: () => void
  onEditUnoSound: () => void
}

export default function UnoHeader({
  onLoadUnoExit,
  roomCode,
  turnName,
  isSoundOn,
  isInviteVisible = false,
  isInviteLoading = false,
  onSubmitUnoInvite,
  onLoadUnoGuide,
  onEditUnoSound,
}: Props) {
  return (
    <header className="grid shrink-0 grid-cols-[auto_1fr_auto_auto] gap-px border-b border-[#26262b] bg-[#26262b]">
      <button
        type="button"
        onClick={onLoadUnoExit}
        aria-label="Back to Waitplay Game Collection"
        className="flex items-center gap-1.5 bg-[#121214] px-3 py-3 transition-colors active:bg-[#1b1b1f]"
      >
        <span className="text-[10px] font-black leading-none text-[#a29d93]">&#9664;</span>
        <span className="text-base font-black leading-none tracking-tighter text-[#f2ede1] [font-family:'Arial_Black','Archivo_Black',system-ui] sm:text-lg">
          UNO
        </span>
      </button>

      <div className="flex min-w-0 items-center justify-between gap-2 bg-[#121214] px-2 sm:px-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="hidden shrink-0 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#a29d93] sm:inline">
            Turn
          </span>
          <span className="truncate rounded bg-[#f0b429] px-[6px] py-[2px] text-[11px] font-semibold uppercase leading-tight text-[#0a0a0b]">
            {turnName}
          </span>
        </span>

        {isInviteVisible ? (
          <button
            type="button"
            disabled={isInviteLoading}
            onClick={onSubmitUnoInvite}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#26262b] px-2 py-[5px] text-[#f2ede1] transition-colors hover:border-[#43434d] active:bg-[#1b1b1f] disabled:opacity-45"
          >
            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="8.5" r="3.2" />
              <path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" strokeLinecap="round" />
              <path d="M18 8v6M21 11h-6" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] font-semibold uppercase leading-none tracking-[0.16em]">
              {isInviteLoading ? 'Menyiapkan…' : 'Main bareng'}
            </span>
          </button>
        ) : (
          <span className="flex shrink-0 flex-col items-end leading-none">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Ruangan</span>
            <span className="mt-[3px] text-[13px] font-black leading-none text-[#f2ede1]">{roomCode}</span>
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label="Panduan permainan"
        onClick={onLoadUnoGuide}
        className="flex w-[42px] items-center justify-center bg-[#121214] text-[#f2ede1] transition-colors active:bg-[#1b1b1f]"
      >
        <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.6 9.4a2.5 2.5 0 1 1 3.2 2.4c-.6.2-.9.7-.9 1.3v.5" strokeLinecap="round" />
          <path d="M12 17h.01" strokeLinecap="round" />
        </svg>
      </button>

      <GameSoundToggle
        isSoundOn={isSoundOn}
        className="w-[46px] rounded-none border-0 bg-[#121214]"
        onEditGameSound={onEditUnoSound}
      />
    </header>
  )
}
