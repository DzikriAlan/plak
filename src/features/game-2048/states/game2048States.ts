import { create } from 'zustand'
import type { DataGame2048Game, Game2048Direction, Game2048Game, Game2048Tile } from '../types/game2048Types'

interface Game2048Store {
  game2048Game: Game2048Game
  setGame2048Init: () => void
  setGame2048Slide: (direction: Game2048Direction) => void
  setGame2048Restart: () => void
}

const SIZE = 4
const CELL_TOTAL = SIZE * SIZE
const WIN_VALUE = 2048
const BEST_KEY = 'waitplay-2048-best'

export const useGame2048States = create<Game2048Store>((set) => {
  let cells: number[] = []
  let score = 0
  let bestScore = 0
  let moveTotal = 0
  let isWon = false
  let isOver = false

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

  // Satu baris digeser ke kiri: angka dirapatkan, lalu pasangan yang sama digabung sekali saja.
  const getSlidLine = (line: number[]) => {
    const packed = line.filter((value) => value > 0)
    const merged: number[] = []
    let gain = 0
    for (let step = 0; step < packed.length; step += 1) {
      if (packed[step] === packed[step + 1]) {
        const value = packed[step] * 2
        merged.push(value)
        gain += value
        step += 1
        continue
      }
      merged.push(packed[step])
    }
    while (merged.length < SIZE) merged.push(0)
    return { line: merged, gain }
  }

  // Setiap arah dibaca sebagai empat baris yang selalu digeser ke kiri, jadi aturannya cukup satu.
  const getLineIndexes = (direction: Game2048Direction, line: number) =>
    Array.from({ length: SIZE }, (_, step) => {
      if (direction === 'left') return line * SIZE + step
      if (direction === 'right') return line * SIZE + (SIZE - 1 - step)
      if (direction === 'up') return step * SIZE + line
      return (SIZE - 1 - step) * SIZE + line
    })

  const getSlidCells = (source: number[], direction: Game2048Direction) => {
    const next = [...source]
    let gain = 0
    for (let line = 0; line < SIZE; line += 1) {
      const indexes = getLineIndexes(direction, line)
      const resolved = getSlidLine(indexes.map((index) => source[index]))
      gain += resolved.gain
      indexes.forEach((index, step) => {
        next[index] = resolved.line[step]
      })
    }
    return { cells: next, gain }
  }

  const getIsMoveAvailable = (source: number[]) => {
    if (source.some((value) => !value)) return true
    const directions: Game2048Direction[] = ['up', 'down', 'left', 'right']
    return directions.some((direction) => getSlidCells(source, direction).cells.some((value, index) => value !== source[index]))
  }

  const postSpawnedTile = () => {
    const empty = cells.map((value, index) => ({ value, index })).filter((cell) => !cell.value)
    if (!empty.length) return
    // Angka empat sesekali muncul supaya papan tidak selalu berisi dua.
    const picked = empty[Math.floor(Math.random() * empty.length)]
    cells[picked.index] = Math.random() < 0.9 ? 2 : 4
  }

  const getData = (): DataGame2048Game => {
    const getTile = (value: number, index: number): Game2048Tile => ({
      index,
      row: Math.floor(index / SIZE),
      column: index % SIZE,
      value,
      label: value ? String(value) : '',
    })

    return {
      tiles: cells.map((value, index) => getTile(value, index)),
      size: SIZE,
      score,
      bestScore,
      moveTotal,
      topValue: cells.reduce((top, value) => Math.max(top, value), 0),
      isWon,
      isOver,
    }
  }

  const updateGame = () =>
    set({ game2048Game: { status: 'success', statusTitle: '', statusSubtitle: '', data: getData() } })

  const updateNewGame = () => {
    cells = new Array<number>(CELL_TOTAL).fill(0)
    score = 0
    moveTotal = 0
    isWon = false
    isOver = false
    bestScore = Math.max(bestScore, getStoredBest())
    postSpawnedTile()
    postSpawnedTile()
    updateGame()
  }

  return {
    game2048Game: {
      status: 'loading',
      statusTitle: 'Menyiapkan papan',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },

    setGame2048Init: () => updateNewGame(),
    setGame2048Restart: () => updateNewGame(),

    setGame2048Slide: (direction) => {
      if (isOver) return
      const resolved = getSlidCells(cells, direction)
      // Geseran yang tidak mengubah apa pun tidak dihitung sebagai langkah.
      if (resolved.cells.every((value, index) => value === cells[index])) return

      cells = resolved.cells
      score += resolved.gain
      moveTotal += 1
      bestScore = Math.max(bestScore, score)
      updateStoredBest(bestScore)
      postSpawnedTile()
      if (cells.some((value) => value >= WIN_VALUE)) isWon = true
      isOver = !getIsMoveAvailable(cells)
      updateGame()
    },
  }
})
