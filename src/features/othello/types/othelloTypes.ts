export type OthelloSide = 'player' | 'bot'

export type OthelloCell = {
  index: number
  row: number
  column: number
  side: string
  isPlayable: boolean
  isLast: boolean
}

export interface DataOthelloGame {
  cells: OthelloCell[]
  size: number
  turn: OthelloSide
  moveTotal: number
  playerScore: number
  botScore: number
  isFinished: boolean
  winner: string
}

export interface OthelloGame {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataOthelloGame | null
}
