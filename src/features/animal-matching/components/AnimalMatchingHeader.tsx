'use client'

import Link from 'next/link'

interface Props {
  level: number
  remainingTotal: number
  progress: number
}

export default function AnimalMatchingHeader({ level, remainingTotal, progress }: Props) {
  return (
    <header className="shrink-0 space-y-3">
      <div className="flex items-stretch gap-2">
        <Link
          href="/"
          aria-label="Kembali ke Plak Game Store"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#26262b] bg-[#121214] px-3 transition-colors hover:border-[#43434d]"
        >
          <span className="text-[10px] leading-none text-[#a29d93]">&#9664;</span>
          <span className="text-base font-black uppercase leading-none tracking-tighter text-[#f2ede1]">Hewan</span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-[#26262b] bg-[#121214] px-3 py-2">
          <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">Level {level}</span>
          <span className="mt-1 h-[6px] w-full overflow-hidden rounded-full bg-[#26262b]">
            <span className="block h-full rounded-full bg-[#f0b429] transition-[width]" style={{ width: `${progress}%` }} />
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] px-3 py-2">
          <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Sisa</span>
          <span className="text-lg font-black leading-none text-[#f2ede1]">{remainingTotal}</span>
        </div>
      </div>
    </header>
  )
}
