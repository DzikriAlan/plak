export type AnimalMatchingTile = {
  id: number
  row: number
  col: number
  icon: string
  isEmpty: boolean
  isSelected: boolean
  isHinted: boolean
}

export type AnimalMatchingPoint = {
  row: number
  col: number
}

export interface DataAnimalMatchingGame {
  tiles: AnimalMatchingTile[]
  rowTotal: number
  colTotal: number
  level: number
  remainingTotal: number
  timeLimit: number
  selectedId: number | null
  path: AnimalMatchingPoint[]
  isCleared: boolean
}

export interface AnimalMatchingGame {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataAnimalMatchingGame | null
}
