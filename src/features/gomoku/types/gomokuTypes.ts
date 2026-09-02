export type GomokuSide = 'player' | 'bot'

export type GomokuCell = {
  index: number
  row: number
  column: number
  side: string
  isPlayable: boolean
  isLast: boolean
  isWinning: boolean
}

export interface DataGomokuGame {
  cells: GomokuCell[]
  size: number
  turn: GomokuSide
  moveTotal: number
  playerScore: number
  botScore: number
  isFinished: boolean
  winner: string
}

export interface GomokuGame {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataGomokuGame | null
}
