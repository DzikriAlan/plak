export type TetrisPieceKey = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export type TetrisCell = {
  index: number
  row: number
  column: number
  tone: string
  isGhost: boolean
  isActive: boolean
}

export type TetrisPreviewCell = {
  index: number
  tone: string
}

export interface DataTetrisGame {
  cells: TetrisCell[]
  preview: TetrisPreviewCell[]
  columnTotal: number
  rowTotal: number
  score: number
  bestScore: number
  lineTotal: number
  level: number
  stepDelay: number
  isOver: boolean
}

export interface TetrisGame {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataTetrisGame | null
}
