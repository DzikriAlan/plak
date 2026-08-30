export type ChessColor = 'w' | 'b'

export type ChessPiece = {
  type: string
  color: ChessColor
}

export type ChessCell = {
  square: string
  piece: ChessPiece | null
  isDark: boolean
  isSelected: boolean
  isTarget: boolean
  isCapture: boolean
  isLastMove: boolean
  isCheck: boolean
}

export type ChessPromotion = {
  from: string
  to: string
}

export interface DataChessGame {
  board: ChessCell[]
  turn: ChessColor
  selected: string | null
  lastMove: ChessPromotion | null
  moveTotal: number
  capturedByPlayer: string[]
  capturedByEngine: string[]
  pendingPromotion: ChessPromotion | null
  isCheck: boolean
  isFinished: boolean
  resultTitle: string
  resultSubtitle: string
  fen: string
}

export interface ChessGame {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataChessGame | null
}
