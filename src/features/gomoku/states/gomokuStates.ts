import { create } from 'zustand'
import {
  GOMOKU_SIZE,
  getGomokuBestMove,
  getGomokuColumn,
  getGomokuIsMoveAllowed,
  getGomokuNewCells,
  getGomokuResolvedMove,
  getGomokuRow,
} from '@/shared/lib/gomokuEngine'
import type { DataGomokuGame, GomokuCell, GomokuGame, GomokuSide } from '../types/gomokuTypes'

interface GomokuStore {
  gomokuGame: GomokuGame
  setGomokuInit: () => void
  setGomokuCell: (cellIndex: number) => void
  setGomokuBot: () => void
  setGomokuRestart: () => void
}

// Kursi tuan rumah dipakai pemain dan kursi tamu dipakai bot supaya aturannya sama dengan ruangan.
const PLAYER_SEAT = 'p1'
const BOT_SEAT = 'p2'

export const useGomokuStates = create<GomokuStore>((set) => {
  let cells: string[] = []
  let turn: GomokuSide = 'player'
  let moveTotal = 0
  let lastCell = -1
  let winningLine: number[] = []
  let winner = ''
  let isFinished = false

  const getSide = (seat: string) => (seat === PLAYER_SEAT ? 'player' : seat === BOT_SEAT ? 'bot' : '')

  const getCell = (seat: string, index: number): GomokuCell => ({
    index,
    row: getGomokuRow(index),
    column: getGomokuColumn(index),
    side: getSide(seat),
    isPlayable: turn === 'player' && !isFinished && !seat,
    isLast: lastCell === index,
    isWinning: winningLine.includes(index),
  })

  const getSeatTotal = (seat: string) => cells.filter((owner) => owner === seat).length

  const getData = (): DataGomokuGame => ({
    cells: cells.map((seat, index) => getCell(seat, index)),
    size: GOMOKU_SIZE,
    turn,
    moveTotal,
    playerScore: getSeatTotal(PLAYER_SEAT),
    botScore: getSeatTotal(BOT_SEAT),
    isFinished,
    winner,
  })

  const updateGame = () =>
    set({ gomokuGame: { status: 'success', statusTitle: '', statusSubtitle: '', data: getData() } })

  const updateNewGame = () => {
    cells = getGomokuNewCells()
    turn = 'player'
    moveTotal = 0
    lastCell = -1
    winningLine = []
    winner = ''
    isFinished = false
    updateGame()
  }

  const updateAppliedMove = (side: GomokuSide, cellIndex: number) => {
    if (isFinished || turn !== side) return
    if (!getGomokuIsMoveAllowed(cells, cellIndex)) return

    const seat = side === 'player' ? PLAYER_SEAT : BOT_SEAT
    const resolved = getGomokuResolvedMove(cells, seat, cellIndex, moveTotal)
    cells = resolved.cells
    turn = resolved.turn === PLAYER_SEAT ? 'player' : 'bot'
    moveTotal = resolved.moveTotal
    lastCell = cellIndex
    winningLine = resolved.winningLine
    isFinished = resolved.isFinished
    winner = resolved.isFinished ? (resolved.winner === 'draw' ? 'draw' : getSide(resolved.winner)) : ''
    updateGame()
  }

  return {
    gomokuGame: {
      status: 'loading',
      statusTitle: 'Menyiapkan papan',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },

    setGomokuInit: () => updateNewGame(),
    setGomokuRestart: () => updateNewGame(),

    setGomokuCell: (cellIndex) => updateAppliedMove('player', cellIndex),

    setGomokuBot: () => {
      const cellIndex = getGomokuBestMove(cells, BOT_SEAT)
      if (cellIndex < 0) return
      updateAppliedMove('bot', cellIndex)
    },
  }
})
