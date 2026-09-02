'use client'

import type { OthelloCell } from '../types/othelloTypes'

interface Props {
  cells: OthelloCell[]
  size: number
  turn: string
  playerLabel?: string
  botLabel?: string
  playerScore: number
  botScore: number
  onSubmitOthelloCell: (cellIndex: number) => void
}

export default function OthelloBoard({
  cells,
  size,
  turn,
  playerLabel = 'Kamu',
  botLabel = 'Bot',
  playerScore,
  botScore,
  onSubmitOthelloCell,
}: Props) {
  const getDiscTone = (cell: OthelloCell) => {
    if (cell.side === 'player') return 'bg-[#121214] ring-2 ring-[#3b3b45]'
    if (cell.side === 'bot') return 'bg-[#f2ede1] ring-2 ring-[#c9c2b2]'
    return ''
  }

  const isPlayerTurn = turn === 'player'
  const scoreState = (isOwnTurn: boolean) => (isOwnTurn ? 'opacity-100' : 'opacity-40')
  const gridStyle = { gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }

  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-2xl border border-[#26262b] bg-[#121214] p-3">
      <div className="grid shrink-0 grid-cols-2 gap-2">
        <div className={`rounded-xl border-2 border-[#3b3b45] bg-[#0a0a0b] py-2 text-center ${scoreState(isPlayerTurn)}`}>
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#a29d93]">{playerLabel}</p>
          <p className="text-[22px] font-black leading-none text-[#f2ede1]">{playerScore}</p>
        </div>
        <div className={`rounded-xl border-2 border-[#26262b] bg-[#f2ede1] py-2 text-center ${scoreState(!isPlayerTurn)}`}>
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0b]">{botLabel}</p>
          <p className="text-[22px] font-black leading-none text-[#0a0a0b]">{botScore}</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div
          className="grid aspect-square w-full max-w-full gap-[2px] rounded-lg bg-[#1f6d4f] p-[2px]"
          style={gridStyle}
        >
          {cells.map((cell) => (
            <button
              key={cell.index}
              type="button"
              disabled={!cell.isPlayable}
              aria-label={`Petak ${cell.row + 1}-${cell.column + 1}`}
              onClick={() => onSubmitOthelloCell(cell.index)}
              className={`flex items-center justify-center rounded-[3px] transition-colors ${
                cell.isLast ? 'bg-[#2c8a64]' : 'bg-[#27795a]'
              } ${cell.isPlayable ? 'ring-1 ring-inset ring-[#f0b429]/60' : ''}`}
            >
              {cell.side ? (
                <span className={`block h-[78%] w-[78%] rounded-full transition-colors ${getDiscTone(cell)}`} />
              ) : cell.isPlayable ? (
                <span className="block h-[26%] w-[26%] rounded-full bg-[#f0b429]/70" />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
