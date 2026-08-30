'use client'

import type { CaturCell } from '../types/caturTypes'
import CaturPiece from './CaturPiece'

interface Props {
  board: CaturCell[]
  isLocked: boolean
  onSubmitCaturSquare: (square: string) => void
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

export default function CaturBoard({ board, isLocked, onSubmitCaturSquare }: Props) {
  const label = 'flex items-center justify-center text-[9px] font-bold text-[#eeeed2]/85 sm:text-[11px]'

  const getSquareTone = (cell: CaturCell) => {
    if (cell.isCheck) return 'bg-[#d0453a]'
    if (cell.isSelected) return 'bg-[#b9ca43]'
    if (cell.isLastMove) return cell.isDark ? 'bg-[#a4ad4b]' : 'bg-[#cdd26a]'
    return cell.isDark ? 'bg-[#769656]' : 'bg-[#eeeed2]'
  }

  return (
    <div className="w-full max-w-[min(100%,72dvh)] rounded-2xl bg-[#8ca66a] p-1.5 sm:p-2.5">
      <div className="grid grid-cols-[1.1rem_1fr_1.1rem] grid-rows-[1.1rem_auto_1.1rem] sm:grid-cols-[1.4rem_1fr_1.4rem] sm:grid-rows-[1.4rem_auto_1.4rem]">
        <span />
        <div className="grid grid-cols-8">
          {FILES.map((file) => (
            <span key={`top-${file}`} className={label}>
              {file}
            </span>
          ))}
        </div>
        <span />

        <div className="grid grid-rows-8">
          {RANKS.map((rank) => (
            <span key={`left-${rank}`} className={label}>
              {rank}
            </span>
          ))}
        </div>

        <div className="grid aspect-square w-full grid-cols-8 grid-rows-[repeat(8,minmax(0,1fr))] overflow-hidden rounded-lg">
          {board.map((cell) => (
            <button
              key={cell.square}
              type="button"
              disabled={isLocked}
              aria-label={`Kotak ${cell.square}`}
              onClick={() => onSubmitCaturSquare(cell.square)}
              className={`relative flex items-center justify-center ${getSquareTone(cell)}`}
            >
              {cell.isTarget && !cell.isCapture ? (
                <span className="pointer-events-none absolute aspect-square h-[28%] rounded-full bg-[#3b3b32]/30" />
              ) : null}
              {cell.isTarget && cell.isCapture ? (
                <span className="pointer-events-none absolute inset-[6%] rounded-full border-[5px] border-[#3b3b32]/30" />
              ) : null}
              {cell.piece ? (
                <span className="relative block h-[88%] w-[88%]">
                  <CaturPiece type={cell.piece.type} color={cell.piece.color} />
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="grid grid-rows-8">
          {RANKS.map((rank) => (
            <span key={`right-${rank}`} className={label}>
              {rank}
            </span>
          ))}
        </div>

        <span />
        <div className="grid grid-cols-8">
          {FILES.map((file) => (
            <span key={`bottom-${file}`} className={label}>
              {file}
            </span>
          ))}
        </div>
        <span />
      </div>
    </div>
  )
}
