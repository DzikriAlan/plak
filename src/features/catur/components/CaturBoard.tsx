'use client'

import type { CaturCell } from '../types/caturTypes'

interface Props {
  board: CaturCell[]
  isLocked: boolean
  onSubmitCaturSquare: (square: string) => void
}

const PIECE_GLYPH: Record<string, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}
const LIGHT_SQUARE = '#e8d39a'
const DARK_SQUARE = '#b77a49'
const HIGHLIGHT = '#f4ead7'

export default function CaturBoard({ board, isLocked, onSubmitCaturSquare }: Props) {
  const getSquareStyle = (cell: CaturCell) => {
    const base = cell.isDark ? DARK_SQUARE : LIGHT_SQUARE
    const grain = cell.isDark
      ? 'rgba(92,54,22,0.14), rgba(92,54,22,0) 42%, rgba(255,255,255,0.04) 58%, rgba(92,54,22,0.09)'
      : 'rgba(135,97,52,0.08), rgba(135,97,52,0) 42%, rgba(255,255,255,0.16) 58%, rgba(135,97,52,0.08)'
    return {
      backgroundColor: cell.isCheck ? '#d05a4a' : base,
      backgroundImage: `repeating-linear-gradient(90deg, ${grain})`,
      backgroundSize: '100% 18px',
    }
  }
  const getPieceTone = (color: string) =>
    color === 'w'
      ? 'text-[#f8f4ee] [text-shadow:0_1px_0_#7f6142,0_2px_3px_rgba(0,0,0,0.6),0_0_1px_rgba(0,0,0,0.8)]'
      : 'text-[#1c120e] [text-shadow:0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(0,0,0,0.7)]'

  return (
    <div className="w-full max-w-[560px] rounded-[18px] bg-[#815d38] p-[8px] shadow-[0_0_0_2px_rgba(54,36,22,0.8),0_18px_30px_rgba(0,0,0,0.5)] sm:p-[10px]">
      <div
        style={{ containerType: 'inline-size' }}
        className="mx-auto grid aspect-square w-full max-w-[520px] grid-cols-8 overflow-hidden rounded-[12px] ring-1 ring-[#563e2d]"
      >
        {board.map((cell) => (
          <button
            key={cell.square}
            type="button"
            disabled={isLocked}
            aria-label={`Kotak ${cell.square}`}
            onClick={() => onSubmitCaturSquare(cell.square)}
            style={getSquareStyle(cell)}
            className="relative flex items-center justify-center"
          >
            {cell.isSelected || cell.isLastMove ? (
              <span
                className="pointer-events-none absolute inset-0 border-[3px]"
                style={{ borderColor: HIGHLIGHT, opacity: cell.isSelected ? 1 : 0.6 }}
              />
            ) : null}
            {cell.isTarget && !cell.isCapture ? (
              <span className="pointer-events-none absolute aspect-square h-[26%] rounded-full bg-[#382b20]/45" />
            ) : null}
            {cell.isTarget && cell.isCapture ? (
              <span className="pointer-events-none absolute inset-[7%] rounded-full border-[4px] border-[#382b20]/45" />
            ) : null}
            {cell.piece ? (
              <span
                style={{ fontSize: 'clamp(2.2rem, 4.9vw, 4.8rem)' }}
                className={`relative select-none translate-y-[-1px] leading-none ${getPieceTone(cell.piece.color)}`}
              >
                {PIECE_GLYPH[cell.piece.type]}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
