'use client'

import Link from 'next/link'
import GameSoundToggle from '@/shared/components/reusable/GameSoundToggle'

interface Props {
  roomCode: string
  turnName: string
  drawTotal: number
  discardTotal: number
  isCopied: boolean
  isSoundOn: boolean
  onLoadUnoRoomCode: () => void
  onEditUnoSound: () => void
}

export default function UnoHeader({
  roomCode,
  turnName,
  drawTotal,
  discardTotal,
  isCopied,
  isSoundOn,
  onLoadUnoRoomCode,
  onEditUnoSound,
}: Props) {
  return (
    <header className="grid shrink-0 grid-cols-3 gap-px border-b border-[#26262b] bg-[#26262b] sm:grid-cols-[auto_1fr_auto_auto_auto]">
      <Link
        href="/"
        aria-label="Back to Waitplay Game Store"
        className="order-1 flex items-center justify-center gap-1 bg-[#121214] px-2 py-3 transition-colors active:bg-[#1b1b1f] sm:gap-1.5 sm:px-4"
      >
        <span className="text-[10px] font-black leading-none text-[#a29d93]">&#9664;</span>
        <span className="text-base font-black leading-none tracking-tighter text-[#f2ede1] sm:text-xl [font-family:'Arial_Black','Archivo_Black',system-ui]">
          UNO
        </span>
      </Link>

      <button
        type="button"
        onClick={onLoadUnoRoomCode}
        aria-label="Copy room code"
        className="order-2 flex min-w-0 flex-col items-start justify-center gap-1 bg-[#121214] px-2 py-3 text-left transition-colors active:bg-[#1b1b1f] sm:px-3"
      >
        <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">Room code</span>
        <span className="flex w-full items-center gap-2 text-sm font-black leading-none tracking-tight text-[#f2ede1] sm:text-base">
          <span className="truncate">{roomCode}</span>
          <span className="shrink-0 rounded border border-[#3a3a42] px-[5px] py-[1px] text-[8px] text-[#a29d93]">
            {isCopied ? 'OK' : 'COPY'}
          </span>
        </span>
      </button>

      <div className="order-4 flex flex-col items-center justify-center gap-1 bg-[#121214] px-1.5 py-3 sm:order-3 sm:px-3">
        <span className="text-[8px] font-semibold uppercase tracking-normal text-[#a29d93] sm:tracking-[0.2em]">Turn</span>
        <span className="rounded bg-[#f0b429] px-[6px] py-[1px] text-[11px] font-semibold uppercase leading-tight text-[#0a0a0b]">
          {turnName}
        </span>
      </div>

      <GameSoundToggle
        isSoundOn={isSoundOn}
        className="order-3 w-full rounded-none border-0 bg-[#121214] sm:order-4 sm:w-[38px]"
        onEditGameSound={onEditUnoSound}
      />

      <div className="order-5 col-span-2 grid grid-cols-2 gap-px bg-[#26262b] sm:col-span-1">
        <div className="flex flex-col items-center justify-center gap-1 bg-[#121214] px-1.5 py-3 sm:px-3">
          <span className="text-[8px] font-semibold uppercase tracking-normal text-[#a29d93] sm:tracking-[0.14em]">
            Draw
          </span>
          <span className="text-lg font-black leading-none text-[#f2ede1]">{drawTotal}</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 bg-[#121214] px-1.5 py-3 sm:px-3">
          <span className="text-[8px] font-semibold uppercase tracking-normal text-[#a29d93] sm:tracking-[0.14em]">
            Discard
          </span>
          <span className="text-lg font-black leading-none text-[#f2ede1]">{discardTotal}</span>
        </div>
      </div>
    </header>
  )
}
