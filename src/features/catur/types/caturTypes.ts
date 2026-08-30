export type CaturColor = 'w' | 'b'

export type CaturPiece = {
  type: string
  color: CaturColor
}

export type CaturCell = {
  square: string
  piece: CaturPiece | null
  isDark: boolean
  isSelected: boolean
  isTarget: boolean
  isCapture: boolean
  isLastMove: boolean
  isCheck: boolean
}

export type CaturPromotion = {
  from: string
  to: string
}

export interface DataCaturGame {
  board: CaturCell[]
  turn: CaturColor
  selected: string | null
  lastMove: CaturPromotion | null
  moveTotal: number
  capturedByPlayer: string[]
  capturedByEngine: string[]
  pendingPromotion: CaturPromotion | null
  isCheck: boolean
  isFinished: boolean
  resultTitle: string
  resultSubtitle: string
  fen: string
}

export interface CaturGame {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataCaturGame | null
}
