import { create } from 'zustand'
import {
  getRubikIsSolved,
  getRubikScramble,
  getRubikSolvedFacelets,
  getRubikTurnedFacelets,
} from '@/shared/lib/rubikEngine'
import type { RubikTurnKey } from '@/shared/lib/rubikEngine'
import type { DataRubikGame, RubikGame, RubikTurn } from '../types/rubikTypes'

interface RubikStore {
  rubikGame: RubikGame
  setRubikInit: () => void
  setRubikTurn: (turn: RubikTurnKey, isPrime: boolean) => void
  setRubikScramble: () => void
  setRubikRestart: () => void
}

const SCRAMBLE_TOTAL = 22

export const useRubikStates = create<RubikStore>((set) => {
  let facelets: string[] = []
  let turn: RubikTurn | null = null
  let moveTotal = 0
  let scrambleTotal = 0
  let isScrambling = false

  const getData = (): DataRubikGame => ({
    facelets,
    turn,
    moveTotal,
    scrambleTotal,
    isScrambling,
    // Kubus baru memang sudah rapi, jadi status selesai hanya berarti setelah diacak.
    isSolved: getRubikIsSolved(facelets),
  })

  const updateGame = () =>
    set({ rubikGame: { status: 'success', statusTitle: '', statusSubtitle: '', data: getData() } })

  const updateNewGame = () => {
    facelets = getRubikSolvedFacelets()
    turn = null
    moveTotal = 0
    scrambleTotal = 0
    isScrambling = false
    updateGame()
  }

  return {
    rubikGame: {
      status: 'loading',
      statusTitle: 'Menyiapkan kubus',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },

    setRubikInit: () => updateNewGame(),
    setRubikRestart: () => updateNewGame(),

    setRubikTurn: (next, isPrime) => {
      facelets = getRubikTurnedFacelets(facelets, next, isPrime)
      moveTotal += 1
      // Nomor putaran dipakai papan tiga dimensi untuk memutar lapisan yang baru saja berubah.
      turn = { id: moveTotal, turn: next, isPrime }
      isScrambling = false
      updateGame()
    },

    setRubikScramble: () => {
      const moves = getRubikScramble(SCRAMBLE_TOTAL)
      facelets = moves.reduce((acc, move) => getRubikTurnedFacelets(acc, move.turn, move.isPrime), getRubikSolvedFacelets())
      turn = null
      moveTotal = 0
      scrambleTotal = moves.length
      isScrambling = true
      updateGame()
    },
  }
})
