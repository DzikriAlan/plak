import { create } from 'zustand'
import {
  OTHELLO_SIZE,
  getOthelloBestMove,
  getOthelloColumn,
  getOthelloFlips,
  getOthelloIsMoveAllowed,
  getOthelloLegalMoves,
  getOthelloNewCells,
  getOthelloResolvedMove,
  getOthelloRow,
  getOthelloSeatTotal,
} from '@/shared/lib/othelloEngine'
import type { DataOthelloGame, OthelloCell, OthelloGame, OthelloSide } from '../types/othelloTypes'

interface OthelloStore {
  othelloGame: OthelloGame
  setOthelloInit: () => void
  setOthelloCell: (cellIndex: number) => void
  setOthelloBot: () => void
  setOthelloRestart: () => void
}

// Kursi tuan rumah dipakai pemain dan kursi tamu dipakai bot supaya aturannya sama dengan ruangan.
const PLAYER_SEAT = 'p1'
const BOT_SEAT = 'p2'

export const useOthelloStates = create<OthelloStore>((set) => {
  let cells: string[] = []
  let turn: OthelloSide = 'player'
  let moveTotal = 0
  let lastCell = -1
  let winner = ''
  let isFinished = false

  const getSide = (seat: string) => (seat === PLAYER_SEAT ? 'player' : seat === BOT_SEAT ? 'bot' : '')

  const getCell = (seat: string, index: number, legalMoves: number[]): OthelloCell => ({
    index,
    row: getOthelloRow(index),
    column: getOthelloColumn(index),
    side: getSide(seat),
    isPlayable: turn === 'player' && !isFinished && legalMoves.includes(index),
    isLast: lastCell === index,
  })

  const getData = (): DataOthelloGame => {
    const legalMoves = turn === 'player' && !isFinished ? getOthelloLegalMoves(cells, PLAYER_SEAT) : []
    return {
      cells: cells.map((seat, index) => getCell(seat, index, legalMoves)),
      size: OTHELLO_SIZE,
      turn,
      moveTotal,
      playerScore: getOthelloSeatTotal(cells, PLAYER_SEAT),
      botScore: getOthelloSeatTotal(cells, BOT_SEAT),
      isFinished,
      winner,
    }
  }

  const updateGame = () =>
    set({ othelloGame: { status: 'success', statusTitle: '', statusSubtitle: '', data: getData() } })

  const updateNewGame = () => {
    cells = getOthelloNewCells()
    turn = 'player'
    moveTotal = 0
    lastCell = -1
    winner = ''
    isFinished = false
    updateGame()
  }

  const updateAppliedMove = (side: OthelloSide, cellIndex: number) => {
    if (isFinished || turn !== side) return
    const seat = side === 'player' ? PLAYER_SEAT : BOT_SEAT
    if (!getOthelloIsMoveAllowed(cells, seat, cellIndex)) return

    const resolved = getOthelloResolvedMove(cells, seat, cellIndex, moveTotal)
    cells = resolved.cells
    turn = resolved.turn === PLAYER_SEAT ? 'player' : 'bot'
    moveTotal = resolved.moveTotal
    lastCell = cellIndex
    isFinished = resolved.isFinished
    winner = resolved.isFinished ? (resolved.winner === 'draw' ? 'draw' : getSide(resolved.winner)) : ''
    updateGame()
  }

  return {
    othelloGame: {
      status: 'loading',
      statusTitle: 'Menyiapkan papan',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },

    setOthelloInit: () => updateNewGame(),
    setOthelloRestart: () => updateNewGame(),

    setOthelloCell: (cellIndex) => {
      // Petak yang tidak menjepit bidak lawan tidak pernah menjadi langkah sah.
      if (!getOthelloFlips(cells, PLAYER_SEAT, cellIndex).length) return
      updateAppliedMove('player', cellIndex)
    },

    setOthelloBot: () => {
      const cellIndex = getOthelloBestMove(cells, BOT_SEAT)
      if (cellIndex < 0) return
      updateAppliedMove('bot', cellIndex)
    },
  }
})
