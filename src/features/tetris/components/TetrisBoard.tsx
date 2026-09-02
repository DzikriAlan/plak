'use client'

import type { TetrisCell, TetrisPreviewCell } from '../types/tetrisTypes'

interface Props {
  cells: TetrisCell[]
  preview: TetrisPreviewCell[]
  columnTotal: number
  rowTotal: number
  score: number
  bestScore: number
  nextLabel?: string
  scoreLabel?: string
  bestLabel?: string
}

export default function TetrisBoard({
  cells,
  preview,
  columnTotal,
  rowTotal,
  score,
  bestScore,
  nextLabel = 'Berikutnya',
  scoreLabel = 'Skor',
  bestLabel = 'Terbaik',
}: Props) {
  const getCellTone = (cell: TetrisCell) => {
    if (cell.tone) return ''
    if (cell.isGhost) return 'border border-dashed border-[#43434d] bg-transparent'
    return 'bg-[#17171b]'
  }

  const boardStyle = {
    gridTemplateColumns: `repeat(${columnTotal}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rowTotal}, minmax(0, 1fr))`,
    aspectRatio: `${columnTotal} / ${rowTotal}`,
  }
  const previewStyle = { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }

  return (
    <div className="flex h-full w-full gap-3 rounded-2xl border border-[#26262b] bg-[#121214] p-3">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="grid h-full max-h-full gap-[2px] rounded-lg bg-[#0a0a0b] p-[3px]" style={boardStyle}>
          {cells.map((cell) => (
            <span
              key={cell.index}
              style={cell.tone ? { backgroundColor: cell.tone } : undefined}
              className={`block rounded-[2px] ${getCellTone(cell)}`}
            />
          ))}
        </div>
      </div>

      <div className="flex w-[86px] shrink-0 flex-col gap-2">
        <div className="rounded-xl border border-[#26262b] bg-[#0a0a0b] p-2">
          <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#a29d93]">{nextLabel}</p>
          <div className="mt-2 grid aspect-square gap-[2px]" style={previewStyle}>
            {preview.map((cell) => (
              <span
                key={cell.index}
                style={cell.tone ? { backgroundColor: cell.tone } : undefined}
                className={`block rounded-[2px] ${cell.tone ? '' : 'bg-[#17171b]'}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#26262b] bg-[#0a0a0b] p-2">
          <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#a29d93]">{scoreLabel}</p>
          <p className="mt-1 text-[16px] font-black leading-none text-[#f2ede1]">{score}</p>
        </div>

        <div className="rounded-xl border border-[#26262b] bg-[#0a0a0b] p-2">
          <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#a29d93]">{bestLabel}</p>
          <p className="mt-1 text-[16px] font-black leading-none text-[#f0b429]">{bestScore}</p>
        </div>
      </div>
    </div>
  )
}
