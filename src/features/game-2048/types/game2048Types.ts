export type Game2048Direction = 'up' | 'down' | 'left' | 'right'

export type Game2048Tile = {
  index: number
  row: number
  column: number
  value: number
  label: string
}

export interface DataGame2048Game {
  tiles: Game2048Tile[]
  size: number
  score: number
  bestScore: number
  moveTotal: number
  topValue: number
  isWon: boolean
  isOver: boolean
}

export interface Game2048Game {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataGame2048Game | null
}
