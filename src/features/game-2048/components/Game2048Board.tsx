'use client'

import type { Game2048Tile } from '../types/game2048Types'

interface Props {
  tiles: Game2048Tile[]
  size: number
  score: number
  bestScore: number
  scoreLabel?: string
  bestLabel?: string
}

// Warna menua seiring nilai ubin supaya angka besar langsung terlihat menonjol.
const TONES: Record<number, { background: string; text: string }> = {
  2: { background: '#26262b', text: '#f2ede1' },
  4: { background: '#33333a', text: '#f2ede1' },
  8: { background: '#e8862c', text: '#0a0a0b' },
  16: { background: '#e0452a', text: '#f2ede1' },
  32: { background: '#c2331d', text: '#f2ede1' },
  64: { background: '#8b5cf6', text: '#f2ede1' },
  128: { background: '#3b6fd4', text: '#f2ede1' },
  256: { background: '#2ec4b6', text: '#0a0a0b' },
  512: { background: '#2f8f46', text: '#f2ede1' },
  1024: { background: '#f0b429', text: '#0a0a0b' },
  2048: { background: '#f2ede1', text: '#0a0a0b' },
}

export default function Game2048Board({
  tiles,
  size,
  score,
  bestScore,
  scoreLabel = 'Skor',
  bestLabel = 'Terbaik',
}: Props) {
  const getTileStyle = (tile: Game2048Tile) => {
    if (!tile.value) return undefined
    const tone = TONES[tile.value] ?? { background: '#f2ede1', text: '#0a0a0b' }
    return { backgroundColor: tone.background, color: tone.text }
  }
  const getTileSize = (tile: Game2048Tile) => {
    if (tile.value >= 1024) return 'text-[15px] sm:text-[19px]'
    if (tile.value >= 128) return 'text-[18px] sm:text-[23px]'
    return 'text-[21px] sm:text-[27px]'
  }

  const gridStyle = { gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }

  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-2xl border border-[#26262b] bg-[#121214] p-3">
      <div className="grid shrink-0 grid-cols-2 gap-2">
        <div className="rounded-xl border border-[#26262b] bg-[#0a0a0b] py-2 text-center">
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#a29d93]">{scoreLabel}</p>
          <p className="text-[22px] font-black leading-none text-[#f2ede1]">{score}</p>
        </div>
        <div className="rounded-xl border border-[#26262b] bg-[#0a0a0b] py-2 text-center">
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#a29d93]">{bestLabel}</p>
          <p className="text-[22px] font-black leading-none text-[#f0b429]">{bestScore}</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="grid aspect-square w-full max-w-full gap-2 rounded-xl bg-[#0a0a0b] p-2" style={gridStyle}>
          {tiles.map((tile) => (
            <span
              key={tile.index}
              style={getTileStyle(tile)}
              className={`flex items-center justify-center rounded-lg font-black leading-none transition-colors ${
                tile.value ? getTileSize(tile) : 'bg-[#17171b]'
              }`}
            >
              {tile.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
