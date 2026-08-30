export type ColorSortSegment = {
  colorIndex: number
  isHidden: boolean
}

export type ColorSortBottle = {
  id: number
  capacity: number
  isGiant: boolean
  segments: ColorSortSegment[]
}

export interface DataColorSortLevel {
  level: number
  capacity: number
  giantCapacity: number
  colorTotal: number
  bottleTotal: number
  hiddenTotal: number
  giantTotal: number
  bottles: ColorSortBottle[]
}

export interface DataColorSortProgress {
  level: number
  coin: number
  undoLeft: number
  shuffleLeft: number
  addBottleLeft: number
  bestMoves: Record<string, number>
}

export interface ColorSortLevel {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataColorSortLevel | null
}

export interface ColorSortProgress {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataColorSortProgress | null
}

export type ColorSortMove = {
  id: number
  from: number
  to: number
  amount: number
  colorIndex: number
  revealedAt: number[]
}

export type ColorSortPour = {
  id: number
  from: number
  to: number
  amount: number
  colorIndex: number
  startedAt: number
}
