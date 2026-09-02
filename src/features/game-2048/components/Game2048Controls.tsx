'use client'

import type { Game2048Direction } from '../types/game2048Types'

interface Props {
  hintLabel: string
  isDisabled: boolean
  onSubmitGame2048Slide: (direction: Game2048Direction) => void
}

export default function Game2048Controls({ hintLabel, isDisabled, onSubmitGame2048Slide }: Props) {
  const directions: Array<{ id: Game2048Direction; label: string; path: string }> = [
    { id: 'left', label: 'Geser kiri', path: 'M14 5l-7 7 7 7' },
    { id: 'up', label: 'Geser atas', path: 'M5 14l7-7 7 7' },
    { id: 'down', label: 'Geser bawah', path: 'M5 10l7 7 7-7' },
    { id: 'right', label: 'Geser kanan', path: 'M10 5l7 7-7 7' },
  ]

  return (
    <div className="shrink-0 space-y-2">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a29d93]">{hintLabel}</p>

      <div className="grid grid-cols-4 gap-2">
        {directions.map((direction) => (
          <button
            key={direction.id}
            type="button"
            disabled={isDisabled}
            aria-label={direction.label}
            onClick={() => onSubmitGame2048Slide(direction.id)}
            className="flex items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-3 text-[#f2ede1] transition-colors hover:border-[#43434d] disabled:opacity-45"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={direction.path} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}
