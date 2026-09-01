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
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="3.4" />
          <path
            d="M19.1 14.4a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.55V21a2 2 0 1 1-4 0v-.06a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1.03H3a2 2 0 1 1 0-4h.06a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.08A1.7 1.7 0 0 0 10.08 3.6V3a2 2 0 1 1 4 0v.06a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.55 1.03H21a2 2 0 1 1 0 4h-.06a1.7 1.7 0 0 0-1.55 1.03z"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </header>
  )
}
