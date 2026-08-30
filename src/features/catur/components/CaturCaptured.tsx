'use client'

import CaturPiece from './CaturPiece'

interface Props {
  label: string
  pieces: string[]
  color: string
  advantage: number
}

export default function CaturCaptured({ label, pieces, color, advantage }: Props) {
  const getSortedPieces = () => {
    const rank: Record<string, number> = { q: 0, r: 1, b: 2, n: 3, p: 4 }
    return [...pieces].sort((left, right) => (rank[left] ?? 9) - (rank[right] ?? 9))
  }

  const sorted = getSortedPieces()

  return (
    <div className="flex min-h-[26px] shrink-0 items-center gap-2 rounded-lg border border-[#26262b] bg-[#121214] px-2 py-1">
      <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#a29d93]">{label}</span>
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-[1px]">
        {sorted.map((piece, index) => (
          <span key={`${piece}-${index}`} className="block h-4 w-4 shrink-0">
            <CaturPiece type={piece} color={color} />
          </span>
        ))}
      </span>
      {advantage > 0 ? (
        <span className="shrink-0 text-[11px] font-black text-[#f0b429]">+{advantage}</span>
      ) : null}
    </div>
  )
}
