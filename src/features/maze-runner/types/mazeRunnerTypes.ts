export type MazeRunnerDirection = 'up' | 'right' | 'down' | 'left'

export type MazeRunnerPoint = {
  row: number
  col: number
}

export type MazeRunnerCell = {
  id: number
  row: number
  col: number
  isTopOpen: boolean
  isRightOpen: boolean
  isBottomOpen: boolean
  isLeftOpen: boolean
}

export interface DataMazeRunnerGame {
  cells: MazeRunnerCell[]
  rowTotal: number
  colTotal: number
  level: number
  player: MazeRunnerPoint
  goal: MazeRunnerPoint
  hintPath: MazeRunnerPoint[]
  hintTotal: number
  hintUsed: number
  moveTotal: number
  timeLimit: number
  isCleared: boolean
}

export interface MazeRunnerGame {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataMazeRunnerGame | null
}
