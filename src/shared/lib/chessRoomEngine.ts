import { Chess } from 'chess.js'

export type ChessRoomMove = {
  from: string
  to: string
  promotion?: string
}

export type ChessRoomResolvedMove = {
  fen: string
  lastMove: { from: string; to: string } | null
  turn: 'p1' | 'p2'
  moveTotal: number
  isFinished: boolean
  winner: string
}

export const CHESS_ROOM_START_FEN = new Chess().fen()

// Kursi pertama selalu memegang buah putih supaya giliran mudah dipetakan dari FEN.
export const getChessRoomSeatColor = (seat: string) => (seat === 'p1' ? 'w' : 'b')

const getResult = (chess: Chess) => {
  if (!chess.isGameOver()) return { isFinished: false, winner: '' }
  if (chess.isCheckmate()) return { isFinished: true, winner: chess.turn() === 'w' ? 'p2' : 'p1' }
  return { isFinished: true, winner: 'draw' }
}

export const getChessRoomAppliedMove = (
  fen: string,
  seat: string,
  move: ChessRoomMove,
  moveTotal: number,
): ChessRoomResolvedMove | null => {
  const chess = new Chess(fen)
  if (chess.turn() !== getChessRoomSeatColor(seat)) return null
  if (chess.isGameOver()) return null

  try {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion ?? 'q' })
  } catch {
    return null
  }

  const result = getResult(chess)
  return {
    fen: chess.fen(),
    lastMove: { from: move.from, to: move.to },
    turn: chess.turn() === 'w' ? 'p1' : 'p2',
    moveTotal: moveTotal + 1,
    isFinished: result.isFinished,
    winner: result.winner,
  }
}
