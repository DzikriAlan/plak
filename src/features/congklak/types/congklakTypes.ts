export type CongklakSide = 'player' | 'bot'

export type CongklakHole = {
  index: number
  seedTotal: number
  side: CongklakSide
  isStore: boolean
  isPlayable: boolean
  isActive: boolean
}

export interface DataCongklakGame {
  holes: CongklakHole[]
  playerHoles: CongklakHole[]
  botHoles: CongklakHole[]
  playerStore: CongklakHole
  botStore: CongklakHole
  turn: CongklakSide
  moveTotal: number
  undoLeft: number
  handTotal: number
  captureTotal: number
  isSowing: boolean
  isFinished: boolean
  winner: string
}

export interface CongklakGame {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataCongklakGame | null
}
