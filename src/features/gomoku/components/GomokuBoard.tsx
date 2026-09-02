'use client'

import type { GomokuCell } from '../types/gomokuTypes'

interface Props {
  cells: GomokuCell[]
  size: number
  turn: string
  playerLabel?: string
  botLabel?: string
  playerScore: number
  botScore: number
  onSubmitGomokuCell: (cellIndex: number) => void
}

export default function GomokuBoard({
  cells,
  size,
  turn,
  playerLabel = 'Kamu',
  botLabel = 'Bot',
  playerScore,
  botScore,
  onSubmitGomokuCell,
}: Props) {
  const getStoneTone = (cell: GomokuCell) => {
    if (cell.side === 'player') return 'bg-[#121214] ring-1 ring-[#4a4a55]'
    if (cell.side === 'bot') return 'bg-[#f2ede1] ring-1 ring-[#c9c2b2]'
    return ''
  }
  // Garis papan digambar dari sisi petak supaya potongan tepi tetap rapi tanpa gambar tambahan.
  const getGridTone = (cell: GomokuCell) => {
    const isLastRow = cell.row === size - 1
    const isLastColumn = cell.column === size - 1
    return `${isLastColumn ? '' : 'border-r'} ${isLastRow ? '' : 'border-b'}`
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
        <div className="grid aspect-square w-full max-w-full rounded-lg bg-[#c9a06a] p-[6px]" style={gridStyle}>
          {cells.map((cell) => (
            <button
              key={cell.index}
              type="button"
              disabled={!cell.isPlayable}
              aria-label={`Titik ${cell.row + 1}-${cell.column + 1}`}
              onClick={() => onSubmitGomokuCell(cell.index)}
              className={`flex items-center justify-center border-[#8d6c44] ${getGridTone(cell)}`}
            >
              {cell.side ? (
                <span
                  className={`block h-[82%] w-[82%] rounded-full ${getStoneTone(cell)} ${
                    cell.isWinning ? 'ring-2 ring-[#e0452a]' : ''
                  } ${cell.isLast && !cell.isWinning ? 'ring-2 ring-[#f0b429]' : ''}`}
                />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
