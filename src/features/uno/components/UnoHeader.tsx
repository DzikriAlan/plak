'use client'

import Link from 'next/link'

interface Props {
  roomCode: string
  turnName: string
  drawTotal: number
  discardTotal: number
  isCopied: boolean
  onLoadUnoRoomCode: () => void
}

export default function UnoHeader({
  roomCode,
  turnName,
  drawTotal,
  discardTotal,
  isCopied,
  onLoadUnoRoomCode,
}: Props) {
  return (
    <header className="grid shrink-0 grid-cols-[auto_1fr_auto_auto] gap-px border-b border-[#26262b] bg-[#26262b]">
      <Link
        href="/"
        aria-label="Kembali ke Plak Game Store"
        className="flex items-center justify-center gap-1 bg-[#121214] px-2 py-3 transition-colors active:bg-[#1b1b1f] sm:gap-1.5 sm:px-4"
      >
        <span className="text-[10px] font-black leading-none text-[#a29d93]">&#9664;</span>
        <span className="text-base font-black leading-none tracking-tighter text-[#f2ede1] sm:text-xl [font-family:'Arial_Black','Archivo_Black',system-ui]">
          UNO
        </span>
      </Link>

      <button
        type="button"
        onClick={onLoadUnoRoomCode}
        aria-label="Salin kode ruangan"
        className="flex min-w-0 flex-col items-start justify-center gap-1 bg-[#121214] px-2 py-3 text-left transition-colors active:bg-[#1b1b1f] sm:px-3"
      >
        <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">Room code</span>
        <span className="flex w-full items-center gap-2 text-sm font-black leading-none tracking-tight text-[#f2ede1] sm:text-base">
          <span className="truncate">{roomCode}</span>
          <span className="hidden shrink-0 rounded border border-[#3a3a42] px-[5px] py-[1px] text-[8px] text-[#a29d93] min-[360px]:inline-block">
            {isCopied ? 'OK' : 'COPY'}
          </span>
        </span>
      </button>

      <div className="flex flex-col items-center justify-center gap-1 bg-[#121214] px-1.5 py-3 sm:px-3">
        <span className="text-[8px] font-semibold uppercase tracking-normal text-[#a29d93] sm:tracking-[0.2em]">Turn</span>
        <span className="rounded bg-[#f0b429] px-[6px] py-[1px] text-[11px] font-semibold uppercase leading-tight text-[#0a0a0b]">
          {turnName}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[#26262b]">
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
