'use client'

import Link from 'next/link'
import GameSoundToggle from '@/shared/components/reusable/GameSoundToggle'

interface Props {
  roomCode: string
  turnName: string
  isCopied: boolean
  isSoundOn: boolean
  isInviteVisible?: boolean
  isInviteLoading?: boolean
  onSubmitUnoInvite?: () => void
  onLoadUnoRoomCode: () => void
  onEditUnoSound: () => void
}

export default function UnoHeader({
  roomCode,
  turnName,
  isCopied,
  isSoundOn,
  isInviteVisible = false,
  isInviteLoading = false,
  onSubmitUnoInvite,
  onLoadUnoRoomCode,
  onEditUnoSound,
}: Props) {
  return (
    <header className="grid shrink-0 grid-cols-[auto_1fr_auto] gap-px border-b border-[#26262b] bg-[#26262b]">
      <Link
        href="/"
        aria-label="Back to Waitplay Game Collection"
        className="flex items-center gap-1.5 bg-[#121214] px-3 py-3 transition-colors active:bg-[#1b1b1f]"
      >
        <span className="text-[10px] font-black leading-none text-[#a29d93]">&#9664;</span>
        <span className="text-base font-black leading-none tracking-tighter text-[#f2ede1] [font-family:'Arial_Black','Archivo_Black',system-ui] sm:text-lg">
          UNO
        </span>
      </Link>

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
            className="flex shrink-0 items-center gap-1.5 rounded border border-[#3a3a42] px-2 py-[3px] text-[#f2ede1] transition-colors active:bg-[#1b1b1f] disabled:opacity-45"
          >
            <span className="text-[8px] font-semibold uppercase leading-none tracking-[0.14em]">
              {isInviteLoading ? 'Menyiapkan…' : 'Main bareng'}
            </span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onLoadUnoRoomCode}
          aria-label="Copy room code"
          className="flex shrink-0 items-center gap-1.5 rounded border border-[#3a3a42] px-2 py-[3px] transition-colors active:bg-[#1b1b1f]"
        >
          <span className="text-[11px] font-black leading-none tracking-tight text-[#f2ede1]">{roomCode}</span>
          <span className="text-[8px] font-semibold uppercase leading-none text-[#a29d93]">
            {isCopied ? 'OK' : 'Copy'}
          </span>
        </button>
      </div>

      <GameSoundToggle
        isSoundOn={isSoundOn}
        className="w-[46px] rounded-none border-0 bg-[#121214]"
        onEditGameSound={onEditUnoSound}
      />
    </header>
  )
}
