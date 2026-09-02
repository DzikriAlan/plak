import type { RubikTurnKey } from '@/shared/lib/rubikEngine'

export type RubikTurn = {
  id: number
  turn: RubikTurnKey
  isPrime: boolean
}

export interface DataRubikGame {
  facelets: string[]
  turn: RubikTurn | null
  moveTotal: number
  scrambleTotal: number
  isScrambling: boolean
  isSolved: boolean
}

export interface RubikGame {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataRubikGame | null
}
