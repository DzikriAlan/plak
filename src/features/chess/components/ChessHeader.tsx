'use client'

import Link from 'next/link'

interface Props {
  onLoadChessSettings: () => void
}

export default function ChessHeader({ onLoadChessSettings }: Props) {
  return (
    <header className="flex shrink-0 items-center gap-2">
      <Link
        href="/"
        aria-label="Back to Waitplay Game Store"
        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#26262b] bg-[#121214] px-3 py-2 transition-colors hover:border-[#43434d]"
      >
        <span className="text-[10px] leading-none text-[#a29d93]">&#9664;</span>
        <span className="text-base font-black uppercase leading-none tracking-tighter text-[#f2ede1]">Chess</span>
      </Link>

      <div className="flex min-w-0 flex-1 items-center justify-center" />

      <button
        type="button"
        aria-label="Open settings"
        onClick={onLoadChessSettings}
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] text-[#f2ede1] transition-colors hover:border-[#43434d]"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.8v2.6M12 18.6v2.6M4.5 4.5l1.9 1.9M17.6 17.6l1.9 1.9M2.8 12h2.6M18.6 12h2.6M4.5 19.5l1.9-1.9M17.6 6.4l1.9-1.9" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  )
}
