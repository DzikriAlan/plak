'use client'

import Link from 'next/link'

interface Level {
  id: number
  label: string
}

interface Props {
  levels: Level[]
  activeLevel: number
  moveTotal: number
  statusLabel: string
  onEditCaturLevel: (levelId: number) => void
}

export default function CaturHeader({ levels, activeLevel, moveTotal, statusLabel, onEditCaturLevel }: Props) {
  return (
    <header className="shrink-0 space-y-3">
      <div className="flex items-stretch gap-2">
        <Link
          href="/"
          aria-label="Kembali ke Plak Game Store"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#26262b] bg-[#121214] px-3 transition-colors hover:border-[#43434d]"
        >
          <span className="text-[10px] leading-none text-[#a29d93]">&#9664;</span>
          <span className="text-base font-black uppercase leading-none tracking-tighter text-[#f2ede1]">Catur</span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-[#26262b] bg-[#121214] px-3 py-2">
          <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">Status</span>
          <span className="truncate text-[13px] font-semibold text-[#f2ede1]">{statusLabel}</span>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] px-3 py-2">
          <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Langkah</span>
          <span className="text-lg font-black leading-none text-[#f2ede1]">{moveTotal}</span>
        </div>
      </div>

      <nav
        className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Tingkat kesulitan"
      >
        {levels.map((level) => (
          <button
            key={level.id}
            type="button"
            aria-pressed={level.id === activeLevel}
            onClick={() => onEditCaturLevel(level.id)}
            className={`shrink-0 rounded-full border px-4 py-[6px] text-[12px] font-medium transition-colors ${
              level.id === activeLevel
                ? 'border-[#f2ede1] bg-[#f2ede1] text-[#0a0a0b]'
                : 'border-[#2e2e34] bg-[#131316] text-[#f2ede1] hover:border-[#454550]'
            }`}
          >
            {level.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
