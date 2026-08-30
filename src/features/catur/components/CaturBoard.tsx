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
const LIGHT_SQUARE = '#f0d9b5'
const DARK_SQUARE = '#b58863'
const HIGHLIGHT = '#7c3aed'

export default function CaturBoard({ board, isLocked, onSubmitCaturSquare }: Props) {
  const getSquareStyle = (cell: CaturCell) => {
    const base = cell.isDark ? DARK_SQUARE : LIGHT_SQUARE
    const grain = cell.isDark
      ? 'rgba(90,55,25,0.16), rgba(90,55,25,0) 42%, rgba(255,255,255,0.07) 58%, rgba(90,55,25,0.12)'
      : 'rgba(150,110,60,0.14), rgba(150,110,60,0) 40%, rgba(255,255,255,0.16) 60%, rgba(150,110,60,0.1)'
    return {
      backgroundColor: cell.isCheck ? '#d05a4a' : base,
      backgroundImage: `repeating-linear-gradient(94deg, ${grain})`,
      backgroundSize: '100% 14px',
    }
  }
  const getPieceTone = (color: string) =>
    color === 'w'
      ? 'text-[#fffaf0] [text-shadow:0_1px_0_#6b4a2f,0_0_2px_#6b4a2f,0_2px_3px_rgba(0,0,0,0.45)]'
      : 'text-[#241a12] [text-shadow:0_1px_0_rgba(255,250,240,0.45),0_0_2px_rgba(255,250,240,0.35),0_2px_3px_rgba(0,0,0,0.4)]'

  return (
    <div className="w-full max-w-[min(100%,72dvh)] rounded-md bg-[#8a5f3c] p-[6px] shadow-[0_6px_24px_rgba(0,0,0,0.55)] sm:p-[10px]">
      <div
        style={{ containerType: 'inline-size' }}
        className="grid aspect-square w-full grid-cols-8 overflow-hidden rounded-[3px] ring-1 ring-[#5d3f27]"
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
              <span className="pointer-events-none absolute aspect-square h-[26%] rounded-full bg-[#3b2b1f]/40" />
            ) : null}
            {cell.isTarget && cell.isCapture ? (
              <span className="pointer-events-none absolute inset-[6%] rounded-full border-[4px] border-[#3b2b1f]/40" />
            ) : null}
            {cell.piece ? (
              <span
                // 10cqw = 80% dari satu kotak (kotak = 12.5cqw), jadi bidak selalu proporsional.
                style={{ fontSize: '10cqw' }}
                className={`relative select-none text-[min(9.5vw,6.2dvh,50px)] leading-none ${getPieceTone(
                  cell.piece.color,
                )}`}
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
