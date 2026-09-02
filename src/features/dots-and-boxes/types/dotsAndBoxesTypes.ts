export type DotsAndBoxesSide = 'player' | 'bot'

export type DotsAndBoxesLine = {
  index: number
  row: number
  column: number
  isRow: boolean
  side: string
  isPlayable: boolean
  isLast: boolean
}

export type DotsAndBoxesBox = {
  index: number
  row: number
  column: number
  side: string
  label: string
}

export interface DataDotsAndBoxesGame {
  lines: DotsAndBoxesLine[]
  boxes: DotsAndBoxesBox[]
  dotTotal: number
  turn: DotsAndBoxesSide
  moveTotal: number
  playerScore: number
  botScore: number
  isFinished: boolean
  winner: string
}

export interface DotsAndBoxesGame {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataDotsAndBoxesGame | null
}
