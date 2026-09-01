'use client'

import { useLayoutEffect, useRef } from 'react'
import type { ChessCell, ChessPromotion } from '../types/chessTypes'
import ChessPiece from './ChessPiece'

interface Props {
  board: ChessCell[]
  lastMove: ChessPromotion | null
  isLocked: boolean
  onSubmitChessSquare: (square: string) => void
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

export default function ChessBoard({ board, lastMove, isLocked, onSubmitChessSquare }: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const playedRef = useRef('')
  const boardSize = 'max-w-[min(100%,calc(100dvh-22rem))]'
  const label = 'flex items-center justify-center text-[9px] font-bold text-[#eeeed2]/85 sm:text-[11px]'

  // Geser bidak dari petak asal ke petak tujuan (teknik FLIP) agar tidak terasa meloncat.
  // Pakai layout effect supaya posisi awal terpasang sebelum browser melukis, baik untuk
  // langkah pemain maupun langkah lawan yang datang dari pesan worker engine.
  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid || !lastMove) return
    const key = `${lastMove.from}${lastMove.to}`
    if (playedRef.current === key) return
    playedRef.current = key

    const piece = grid.querySelector<HTMLElement>(`[data-square="${lastMove.to}"] [data-piece]`)
    const square = piece?.parentElement
    if (!piece || !square) return

    const cell = grid.clientWidth / 8
    const fileGap = FILES.indexOf(lastMove.from[0]) - FILES.indexOf(lastMove.to[0])
    const rankGap = Number(lastMove.to[1]) - Number(lastMove.from[1])

    square.style.zIndex = '20'
    piece.style.transition = 'none'
    piece.style.transform = `translate(${fileGap * cell}px, ${rankGap * cell}px)`
    void piece.offsetWidth // paksa reflow agar posisi asal ikut terpakai
    piece.style.transition = 'transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1)'
    piece.style.transform = 'translate(0px, 0px)'

    const clearLift = () => {
      square.style.zIndex = ''
    }
    piece.addEventListener('transitionend', clearLift, { once: true })

    return () => {
      piece.removeEventListener('transitionend', clearLift)
      clearLift()
    }
  }, [lastMove])

  const getSquareTone = (cell: ChessCell) => {
    if (cell.isCheck) return 'bg-[#d0453a]'
    if (cell.isSelected) return 'bg-[#b9ca43]'
    if (cell.isLastMove) return cell.isDark ? 'bg-[#a4ad4b]' : 'bg-[#cdd26a]'
    return cell.isDark ? 'bg-[#769656]' : 'bg-[#eeeed2]'
  }

  return (
    <div className={`w-full ${boardSize} rounded-2xl bg-[#8ca66a] p-1.5 sm:p-2.5`}>
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

        <div
          ref={gridRef}
          className="grid aspect-square w-full grid-cols-8 grid-rows-[repeat(8,minmax(0,1fr))] overflow-hidden rounded-lg"
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
                <span className="pointer-events-none absolute aspect-square h-[28%] rounded-full bg-[#3b3b32]/30" />
              ) : null}
              {cell.isTarget && cell.isCapture ? (
                <span className="pointer-events-none absolute inset-[6%] rounded-full border-[5px] border-[#3b3b32]/30" />
              ) : null}
              {cell.piece ? (
                <span data-piece className="relative block h-[88%] w-[88%] will-change-transform">
                  <ChessPiece type={cell.piece.type} color={cell.piece.color} />
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
