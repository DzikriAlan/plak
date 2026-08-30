'use client'

import { useEffect, useRef } from 'react'
import type { ChessCell, ChessPromotion } from '../types/chessTypes'
import ChessPiece from './ChessPiece'

interface Props {
  board: ChessCell[]
  lastMove: ChessPromotion | null
  isLocked: boolean
  onSubmitChessSquare: (square: string) => void
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

export default function ChessBoard({ board, lastMove, isLocked, onSubmitChessSquare }: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const playedRef = useRef('')

  // Geser bidak dari petak asal ke petak tujuan (teknik FLIP) agar tidak terasa meloncat.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid || !lastMove) return
    const key = `${lastMove.from}${lastMove.to}`
    if (playedRef.current === key) return
    playedRef.current = key

    const getOffset = (from: string, to: string) => {
      const cell = grid.clientWidth / 8
      const fileGap = FILES.indexOf(from[0]) - FILES.indexOf(to[0])
      const rankGap = Number(to[1]) - Number(from[1])
      return { x: fileGap * cell, y: rankGap * cell }
    }

    const piece = grid.querySelector<HTMLElement>(`[data-square="${lastMove.to}"] [data-piece]`)
    if (!piece) return
    const offset = getOffset(lastMove.from, lastMove.to)
    piece.style.transition = 'none'
    piece.style.transform = `translate(${offset.x}px, ${offset.y}px)`
    requestAnimationFrame(() => {
      piece.style.transition = 'transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1)'
      piece.style.transform = 'translate(0px, 0px)'
    })
  }, [lastMove])

  const getSquareTone = (cell: ChessCell) => {
    if (cell.isCheck) return 'bg-[#d0453a]'
    if (cell.isSelected) return 'bg-[#c7b15d]'
    if (cell.isLastMove) return cell.isDark ? 'bg-[#b48b51]' : 'bg-[#d1bf8a]'
    return cell.isDark ? 'bg-[#b77a49]' : 'bg-[#ead7a7]'
  }

  return (
    <div className="w-full max-w-[620px] rounded-[22px] bg-[#8a5f3d] p-[10px] shadow-[0_0_0_3px_rgba(62,41,23,0.9),0_18px_28px_rgba(0,0,0,0.45)] sm:p-[12px]">
      <div
        ref={gridRef}
        className="grid aspect-square w-full grid-cols-8 overflow-hidden rounded-[12px] ring-1 ring-[#5a3a26]"
      >
        {board.map((cell) => (
          <button
            key={cell.square}
            type="button"
            disabled={isLocked}
            data-square={cell.square}
            aria-label={`Square ${cell.square}`}
            onClick={() => onSubmitChessSquare(cell.square)}
            className={`relative flex items-center justify-center ${getSquareTone(cell)}`}
          >
            {cell.isTarget && !cell.isCapture ? (
              <span className="pointer-events-none absolute aspect-square h-[26%] rounded-full bg-[#3d2d22]/35" />
            ) : null}
            {cell.isTarget && cell.isCapture ? (
              <span className="pointer-events-none absolute inset-[8%] rounded-full border-[4px] border-[#3d2d22]/35" />
            ) : null}
            {cell.piece ? (
              <span data-piece className="relative block h-[76%] w-[76%] will-change-transform">
                <ChessPiece type={cell.piece.type} color={cell.piece.color} />
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
