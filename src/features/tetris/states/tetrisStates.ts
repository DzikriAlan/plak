import { create } from 'zustand'
import type { DataTetrisGame, TetrisCell, TetrisGame, TetrisPieceKey } from '../types/tetrisTypes'

interface TetrisStore {
  tetrisGame: TetrisGame
  setTetrisInit: () => void
  setTetrisShift: (step: number) => void
  setTetrisRotate: () => void
  setTetrisSoftDrop: () => void
  setTetrisHardDrop: () => void
  setTetrisStep: () => void
  setTetrisRestart: () => void
}

const COLUMN_TOTAL = 10
const ROW_TOTAL = 20
const PREVIEW_SIZE = 4
const LINES_PER_LEVEL = 10
const BASE_DELAY = 800
const MIN_DELAY = 120
const LINE_SCORES = [0, 100, 300, 500, 800]
const BEST_KEY = 'waitplay-tetris-best'

// Setiap balok ditulis sebagai empat titik pada kisi empat kali empat supaya perputarannya
// bisa dihitung dengan rumus yang sama untuk semua bentuk.
const PIECES: Record<TetrisPieceKey, { tone: string; cells: number[][] }> = {
  I: { tone: '#2ec4b6', cells: [[0, 1], [1, 1], [2, 1], [3, 1]] },
  O: { tone: '#f0b429', cells: [[1, 1], [2, 1], [1, 2], [2, 2]] },
  T: { tone: '#8b5cf6', cells: [[1, 1], [0, 2], [1, 2], [2, 2]] },
  S: { tone: '#2f8f46', cells: [[1, 1], [2, 1], [0, 2], [1, 2]] },
  Z: { tone: '#e0452a', cells: [[0, 1], [1, 1], [1, 2], [2, 2]] },
  J: { tone: '#3b6fd4', cells: [[0, 1], [0, 2], [1, 2], [2, 2]] },
  L: { tone: '#e8862c', cells: [[2, 1], [0, 2], [1, 2], [2, 2]] },
}
const PIECE_KEYS = Object.keys(PIECES) as TetrisPieceKey[]

type TetrisPiece = { key: TetrisPieceKey; rotation: number; row: number; column: number }

export const useTetrisStates = create<TetrisStore>((set) => {
  let cells: string[] = []
  let piece: TetrisPiece | null = null
  let nextKey: TetrisPieceKey = 'I'
  let score = 0
  let bestScore = 0
  let lineTotal = 0
  let isOver = false

  const getRandomKey = () => PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)]

  // Perputaran searah jarum jam pada kisi empat kali empat: (x, y) menjadi (3 - y, x).
  const getRotatedCells = (key: TetrisPieceKey, rotation: number) => {
    let shape = PIECES[key].cells
    for (let turn = 0; turn < ((rotation % 4) + 4) % 4; turn += 1) {
      shape = shape.map(([x, y]) => [PREVIEW_SIZE - 1 - y, x])
    }
    return shape
  }

  const getPieceCells = (target: TetrisPiece) =>
    getRotatedCells(target.key, target.rotation).map(([x, y]) => ({
      row: target.row + y,
      column: target.column + x,
    }))

  const getIsBlocked = (target: TetrisPiece) =>
    getPieceCells(target).some(({ row, column }) => {
      if (column < 0 || column >= COLUMN_TOTAL || row >= ROW_TOTAL) return true
      if (row < 0) return false
      return !!cells[row * COLUMN_TOTAL + column]
    })

  const getGhostPiece = (target: TetrisPiece) => {
    let ghost = { ...target }
    while (!getIsBlocked({ ...ghost, row: ghost.row + 1 })) ghost = { ...ghost, row: ghost.row + 1 }
    return ghost
  }

  const getStoredBest = () => {
    if (typeof window === 'undefined') return 0
    try {
      return Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0
    } catch {
      return 0
    }
  }

  const updateStoredBest = (value: number) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(BEST_KEY, String(value))
    } catch {
      return
    }
  }

  const getLevel = () => Math.floor(lineTotal / LINES_PER_LEVEL) + 1

  const getData = (): DataTetrisGame => {
    const active = piece ? getPieceCells(piece) : []
    const ghost = piece && !isOver ? getPieceCells(getGhostPiece(piece)) : []
    const activeKeys = new Set(active.map(({ row, column }) => row * COLUMN_TOTAL + column))
    const ghostKeys = new Set(ghost.map(({ row, column }) => row * COLUMN_TOTAL + column))
    const tone = piece ? PIECES[piece.key].tone : ''

    const getCell = (index: number): TetrisCell => ({
      index,
      row: Math.floor(index / COLUMN_TOTAL),
      column: index % COLUMN_TOTAL,
      tone: activeKeys.has(index) ? tone : cells[index],
      isGhost: !activeKeys.has(index) && !cells[index] && ghostKeys.has(index),
      isActive: activeKeys.has(index),
    })

    const previewCells = getRotatedCells(nextKey, 0)
    return {
      cells: Array.from({ length: COLUMN_TOTAL * ROW_TOTAL }, (_, index) => getCell(index)),
      preview: Array.from({ length: PREVIEW_SIZE * PREVIEW_SIZE }, (_, index) => ({
        index,
        tone: previewCells.some(([x, y]) => y * PREVIEW_SIZE + x === index) ? PIECES[nextKey].tone : '',
      })),
      columnTotal: COLUMN_TOTAL,
      rowTotal: ROW_TOTAL,
      score,
      bestScore,
      lineTotal,
      level: getLevel(),
      // Balok jatuh makin cepat setiap sepuluh baris yang berhasil dibersihkan.
      stepDelay: Math.max(MIN_DELAY, BASE_DELAY - (getLevel() - 1) * 70),
      isOver,
    }
  }

  const updateGame = () =>
    set({ tetrisGame: { status: 'success', statusTitle: '', statusSubtitle: '', data: getData() } })

  const postSpawnedPiece = () => {
    const key = nextKey
    nextKey = getRandomKey()
    const spawned: TetrisPiece = { key, rotation: 0, row: -1, column: 3 }
    // Meja penuh bila balok baru tidak punya ruang sama sekali di barisan teratas.
    if (getIsBlocked(spawned)) {
      piece = null
      isOver = true
      bestScore = Math.max(bestScore, score)
      updateStoredBest(bestScore)
      return
    }
    piece = spawned
  }

  const postClearedLines = () => {
    const kept: string[] = []
    let cleared = 0
    for (let row = 0; row < ROW_TOTAL; row += 1) {
      const line = cells.slice(row * COLUMN_TOTAL, row * COLUMN_TOTAL + COLUMN_TOTAL)
      if (line.every((cell) => !!cell)) {
        cleared += 1
        continue
      }
      kept.push(...line)
    }
    if (!cleared) return
    cells = [...new Array<string>(cleared * COLUMN_TOTAL).fill(''), ...kept]
    score += LINE_SCORES[cleared] * getLevel()
    lineTotal += cleared
  }

  const postLockedPiece = () => {
    if (!piece) return
    const locked = getPieceCells(piece)
    locked.forEach(({ row, column }) => {
      if (row < 0) return
      cells[row * COLUMN_TOTAL + column] = PIECES[piece!.key].tone
    })
    postClearedLines()
    bestScore = Math.max(bestScore, score)

    // Balok yang terkunci sebagian di atas langit-langit berarti tumpukan sudah melewati papan.
    if (locked.some(({ row }) => row < 0)) {
      piece = null
      isOver = true
      updateStoredBest(bestScore)
      return
    }
    postSpawnedPiece()
  }

  const updateNewGame = () => {
    cells = new Array<string>(COLUMN_TOTAL * ROW_TOTAL).fill('')
    score = 0
    lineTotal = 0
    isOver = false
    bestScore = Math.max(bestScore, getStoredBest())
    nextKey = getRandomKey()
    postSpawnedPiece()
    updateGame()
  }

  const updateMovedPiece = (rowStep: number, columnStep: number) => {
    if (!piece || isOver) return false
    const moved = { ...piece, row: piece.row + rowStep, column: piece.column + columnStep }
    if (getIsBlocked(moved)) return false
    piece = moved
    updateGame()
    return true
  }

  return {
    tetrisGame: {
      status: 'loading',
      statusTitle: 'Menyiapkan papan',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },

    setTetrisInit: () => updateNewGame(),
    setTetrisRestart: () => updateNewGame(),

    setTetrisShift: (step) => {
      updateMovedPiece(0, step)
    },

    setTetrisRotate: () => {
      if (!piece || isOver) return
      const turned = { ...piece, rotation: piece.rotation + 1 }
      // Balok yang mentok setelah diputar digeser sedikit ke samping, seperti tendangan dinding.
      const kicks = [0, -1, 1, -2, 2]
      const found = kicks.map((kick) => ({ ...turned, column: turned.column + kick })).find((option) => !getIsBlocked(option))
      if (!found) return
      piece = found
      updateGame()
    },

    setTetrisSoftDrop: () => {
      if (!piece || isOver) return
      if (updateMovedPiece(1, 0)) {
        score += 1
        updateGame()
        return
      }
      postLockedPiece()
      updateGame()
    },

    setTetrisHardDrop: () => {
      if (!piece || isOver) return
      const ghost = getGhostPiece(piece)
      score += Math.max(0, ghost.row - piece.row) * 2
      piece = ghost
      postLockedPiece()
      updateGame()
    },

    setTetrisStep: () => {
      if (!piece || isOver) return
      if (updateMovedPiece(1, 0)) return
      postLockedPiece()
      updateGame()
    },
  }
})
