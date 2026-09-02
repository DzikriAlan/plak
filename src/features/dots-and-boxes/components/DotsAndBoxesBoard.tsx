'use client'

import type { DotsAndBoxesBox, DotsAndBoxesLine } from '../types/dotsAndBoxesTypes'

interface Props {
  lines: DotsAndBoxesLine[]
  boxes: DotsAndBoxesBox[]
  dotTotal: number
  turn: string
  playerLabel?: string
  botLabel?: string
  playerScore: number
  botScore: number
  onSubmitDotsAndBoxesLine: (lineIndex: number) => void
}

export default function DotsAndBoxesBoard({
  lines,
  boxes,
  dotTotal,
  turn,
  playerLabel = 'Kamu',
  botLabel = 'Bot',
  playerScore,
  botScore,
  onSubmitDotsAndBoxesLine,
}: Props) {
  // Titik dan ruas dipetakan ke jalur ganjil dan genap supaya papan tetap rapi di segala lebar.
  const getDots = () =>
    Array.from({ length: dotTotal * dotTotal }, (_, index) => ({
      id: index,
      row: Math.floor(index / dotTotal),
      column: index % dotTotal,
    }))
  const getLineTone = (line: DotsAndBoxesLine) => {
    if (line.side === 'player') return 'bg-[#3b6fd4]'
    if (line.side === 'bot') return 'bg-[#e0452a]'
    return line.isPlayable ? 'bg-[#2b2b31]' : 'bg-[#1b1b1f]'
  }
  const getBoxTone = (box: DotsAndBoxesBox) => {
    if (box.side === 'player') return 'bg-[#3b6fd4]/20 text-[#6f9bf0]'
    if (box.side === 'bot') return 'bg-[#e0452a]/20 text-[#f07a63]'
    return 'text-transparent'
  }

  const dots = getDots()
  const gridStyle = {
    gridTemplateColumns: `12px repeat(${dotTotal - 1}, minmax(0, 1fr) 12px)`,
    gridTemplateRows: `12px repeat(${dotTotal - 1}, minmax(0, 1fr) 12px)`,
  }
  const isPlayerTurn = turn === 'player'
  const scoreState = (isOwnTurn: boolean) => (isOwnTurn ? 'opacity-100' : 'opacity-40')

  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-2xl border border-[#26262b] bg-[#121214] p-3">
      <div className="grid shrink-0 grid-cols-2 gap-2">
        <div className={`rounded-xl border-2 border-[#26262b] bg-[#3b6fd4] py-2 text-center ${scoreState(isPlayerTurn)}`}>
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0b]">{playerLabel}</p>
          <p className="text-[22px] font-black leading-none text-[#0a0a0b]">{playerScore}</p>
        </div>
        <div className={`rounded-xl border-2 border-[#26262b] bg-[#e0452a] py-2 text-center ${scoreState(!isPlayerTurn)}`}>
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0b]">{botLabel}</p>
          <p className="text-[22px] font-black leading-none text-[#0a0a0b]">{botScore}</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="grid aspect-square w-full max-w-full" style={gridStyle}>
          {boxes.map((box) => (
            <div
              key={`box-${box.index}`}
              style={{ gridRow: box.row * 2 + 2, gridColumn: box.column * 2 + 2 }}
              className={`flex items-center justify-center rounded-[4px] text-[12px] font-black leading-none transition-colors ${getBoxTone(
                box,
              )}`}
            >
              {box.label || '·'}
            </div>
          ))}

          {lines.map((line) => (
            <button
              key={`line-${line.index}`}
              type="button"
              disabled={!line.isPlayable}
              aria-label={`Tarik garis ${line.index + 1}`}
              onClick={() => onSubmitDotsAndBoxesLine(line.index)}
              style={{
                gridRow: line.isRow ? line.row * 2 + 1 : line.row * 2 + 2,
                gridColumn: line.isRow ? line.column * 2 + 2 : line.column * 2 + 1,
              }}
              className="group flex touch-manipulation items-center justify-center disabled:cursor-default"
            >
              <span
                className={`block rounded-full transition-colors ${
                  line.isRow ? 'h-[5px] w-full' : 'h-full w-[5px]'
                } ${getLineTone(line)} ${line.isPlayable ? 'group-active:bg-[#f2ede1]' : ''}`}
              />
            </button>
          ))}

          {dots.map((dot) => (
            <span
              key={`dot-${dot.id}`}
              style={{ gridRow: dot.row * 2 + 1, gridColumn: dot.column * 2 + 1 }}
              className="block h-[12px] w-[12px] rounded-full bg-[#f2ede1]"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
