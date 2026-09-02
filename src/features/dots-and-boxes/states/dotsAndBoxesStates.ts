import { create } from 'zustand'
import {
  DOTS_AND_BOXES_BOX_TOTAL,
  DOTS_AND_BOXES_CELL_TOTAL,
  DOTS_AND_BOXES_DOT_TOTAL,
  DOTS_AND_BOXES_ROW_LINE_TOTAL,
  getDotsAndBoxesBestLine,
  getDotsAndBoxesBoxColumn,
  getDotsAndBoxesBoxRow,
  getDotsAndBoxesIsMoveAllowed,
  getDotsAndBoxesNewLines,
  getDotsAndBoxesNewOwners,
  getDotsAndBoxesResolvedMove,
} from '@/shared/lib/dotsAndBoxesEngine'
import type {
  DataDotsAndBoxesGame,
  DotsAndBoxesBox,
  DotsAndBoxesGame,
  DotsAndBoxesLine,
  DotsAndBoxesSide,
} from '../types/dotsAndBoxesTypes'

interface DotsAndBoxesStore {
  dotsAndBoxesGame: DotsAndBoxesGame
  setDotsAndBoxesInit: () => void
  setDotsAndBoxesLine: (lineIndex: number) => void
  setDotsAndBoxesBot: () => void
  setDotsAndBoxesRestart: () => void
}

// Kursi tuan rumah dipakai pemain dan kursi tamu dipakai bot supaya aturannya sama dengan ruangan.
const PLAYER_SEAT = 'p1'
const BOT_SEAT = 'p2'

export const useDotsAndBoxesStates = create<DotsAndBoxesStore>((set) => {
  let lines: string[] = []
  let owners: string[] = []
  let turn: DotsAndBoxesSide = 'player'
  let moveTotal = 0
  let winner = ''
  let isFinished = false

  const getSide = (seat: string): string => (seat === PLAYER_SEAT ? 'player' : seat === BOT_SEAT ? 'bot' : '')

  const getLine = (seat: string, index: number): DotsAndBoxesLine => {
    const isRow = index < DOTS_AND_BOXES_ROW_LINE_TOTAL
    const offset = isRow ? index : index - DOTS_AND_BOXES_ROW_LINE_TOTAL
    const span = isRow ? DOTS_AND_BOXES_CELL_TOTAL : DOTS_AND_BOXES_DOT_TOTAL
    return {
      index,
      row: Math.floor(offset / span),
      column: offset % span,
      isRow,
      side: getSide(seat),
      isPlayable: !seat && turn === 'player' && !isFinished,
      isLast: false,
    }
  }

  const getBox = (seat: string, index: number): DotsAndBoxesBox => ({
    index,
    row: getDotsAndBoxesBoxRow(index),
    column: getDotsAndBoxesBoxColumn(index),
    side: getSide(seat),
    label: seat === PLAYER_SEAT ? 'A' : seat === BOT_SEAT ? 'B' : '',
  })

  const getSeatTotal = (seat: string) => owners.filter((owner) => owner === seat).length

  const getData = (): DataDotsAndBoxesGame => ({
    lines: lines.map((seat, index) => getLine(seat, index)),
    boxes: owners.map((seat, index) => getBox(seat, index)),
    dotTotal: DOTS_AND_BOXES_DOT_TOTAL,
    turn,
    moveTotal,
    playerScore: getSeatTotal(PLAYER_SEAT),
    botScore: getSeatTotal(BOT_SEAT),
    isFinished,
    winner,
  })

  const updateGame = () =>
    set({ dotsAndBoxesGame: { status: 'success', statusTitle: '', statusSubtitle: '', data: getData() } })

  const updateNewGame = () => {
    lines = getDotsAndBoxesNewLines()
    owners = getDotsAndBoxesNewOwners()
    turn = 'player'
    moveTotal = 0
    winner = ''
    isFinished = false
    updateGame()
  }

  const updateAppliedMove = (side: DotsAndBoxesSide, lineIndex: number) => {
    if (isFinished || turn !== side) return
    if (!getDotsAndBoxesIsMoveAllowed(lines, lineIndex)) return

    const seat = side === 'player' ? PLAYER_SEAT : BOT_SEAT
    const resolved = getDotsAndBoxesResolvedMove(lines, owners, seat, lineIndex, moveTotal)
    lines = resolved.lines
    owners = resolved.owners
    turn = resolved.turn === PLAYER_SEAT ? 'player' : 'bot'
    moveTotal = resolved.moveTotal
    isFinished = resolved.isFinished
    winner = resolved.isFinished ? (resolved.winner === 'draw' ? 'draw' : getSide(resolved.winner)) : ''
    updateGame()
  }

  return {
    dotsAndBoxesGame: {
      status: 'loading',
      statusTitle: 'Menyiapkan papan',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },

    setDotsAndBoxesInit: () => updateNewGame(),
    setDotsAndBoxesRestart: () => updateNewGame(),

    setDotsAndBoxesLine: (lineIndex) => updateAppliedMove('player', lineIndex),

    setDotsAndBoxesBot: () => {
      if (owners.length !== DOTS_AND_BOXES_BOX_TOTAL) return
      const lineIndex = getDotsAndBoxesBestLine(lines, owners)
      if (lineIndex < 0) return
      updateAppliedMove('bot', lineIndex)
    },
  }
})
