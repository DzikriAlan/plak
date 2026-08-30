import { create } from 'zustand'
import type {
  AnimalMatchingGame,
  AnimalMatchingPoint,
  AnimalMatchingTile,
  DataAnimalMatchingGame,
} from '../types/animalMatchingTypes'

interface AnimalMatchingStore {
  animalMatchingGame: AnimalMatchingGame
  setAnimalMatchingInit: () => void
  setAnimalMatchingSelect: (tileId: number) => void
  setAnimalMatchingHint: () => void
  setAnimalMatchingShuffle: () => void
  setAnimalMatchingNextLevel: () => void
  setAnimalMatchingRestart: () => void
}

const ANIMALS = ['🐤', '🦁', '🐵', '🦒', '🐬', '🐟', '🐗', '🐮', '🐻', '🐭', '🐷', '🐯', '🦊', '🐰', '🐑', '🐘', '🦏', '🦔', '🐴', '🦜']
const EMPTY = ''

export const useAnimalMatchingStates = create<AnimalMatchingStore>((set, get) => {
  let grid: string[][] = []
  let level = 1
  let selected: AnimalMatchingPoint | null = null
  let hinted: AnimalMatchingPoint[] = []
  let path: AnimalMatchingPoint[] = []

  const getShuffled = <Item,>(items: Item[]) => {
    const copy = [...items]
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1))
      const holder = copy[index]
      copy[index] = copy[swap]
      copy[swap] = holder
    }
    return copy
  }

  const getLayout = (levelNumber: number) => {
    const colTotal = Math.min(8, 4 + Math.floor((levelNumber - 1) / 2))
    const rowTotal = Math.min(10, 4 + Math.floor(levelNumber / 2))
    const iconTotal = Math.min(ANIMALS.length, 4 + Math.floor(levelNumber / 2))
    return { colTotal, rowTotal: rowTotal % 2 === 0 || colTotal % 2 === 0 ? rowTotal : rowTotal + 1, iconTotal }
  }

  const getFilledGrid = (levelNumber: number) => {
    const layout = getLayout(levelNumber)
    const cellTotal = layout.rowTotal * layout.colTotal
    const pairTotal = Math.floor(cellTotal / 2)
    const icons: string[] = []
    for (let index = 0; index < pairTotal; index += 1) {
      const icon = ANIMALS[index % layout.iconTotal]
      icons.push(icon, icon)
    }
    while (icons.length < cellTotal) icons.push(EMPTY)

    const shuffled = getShuffled(icons)
    const next: string[][] = []
    for (let row = 0; row < layout.rowTotal; row += 1) {
      next.push(shuffled.slice(row * layout.colTotal, row * layout.colTotal + layout.colTotal))
    }
    return { grid: next, layout }
  }

  const getCell = (row: number, col: number) => {
    if (row < 0 || col < 0 || row >= grid.length || col >= (grid[0]?.length ?? 0)) return EMPTY
    return grid[row][col]
  }

  const getIsLineClear = (from: AnimalMatchingPoint, to: AnimalMatchingPoint) => {
    if (from.row !== to.row && from.col !== to.col) return false
    if (from.row === to.row) {
      const start = Math.min(from.col, to.col) + 1
      const end = Math.max(from.col, to.col)
      for (let col = start; col < end; col += 1) if (getCell(from.row, col) !== EMPTY) return false
      return true
    }
    const start = Math.min(from.row, to.row) + 1
    const end = Math.max(from.row, to.row)
    for (let row = start; row < end; row += 1) if (getCell(row, from.col) !== EMPTY) return false
    return true
  }

  const getPath = (from: AnimalMatchingPoint, to: AnimalMatchingPoint): AnimalMatchingPoint[] | null => {
    const getIsFree = (point: AnimalMatchingPoint) =>
      point.row < 0 ||
      point.col < 0 ||
      point.row >= grid.length ||
      point.col >= (grid[0]?.length ?? 0) ||
      getCell(point.row, point.col) === EMPTY

    if (getIsLineClear(from, to)) return [from, to]

    const corners = [
      { row: from.row, col: to.col },
      { row: to.row, col: from.col },
    ]
    for (const corner of corners) {
      if (!getIsFree(corner)) continue
      if (getIsLineClear(from, corner) && getIsLineClear(corner, to)) return [from, corner, to]
    }

    const rowTotal = grid.length
    const colTotal = grid[0]?.length ?? 0
    for (let row = -1; row <= rowTotal; row += 1) {
      const first = { row, col: from.col }
      const second = { row, col: to.col }
      if (!getIsFree(first) || !getIsFree(second)) continue
      if (getIsLineClear(from, first) && getIsLineClear(first, second) && getIsLineClear(second, to)) {
        return [from, first, second, to]
      }
    }
    for (let col = -1; col <= colTotal; col += 1) {
      const first = { row: from.row, col }
      const second = { row: to.row, col }
      if (!getIsFree(first) || !getIsFree(second)) continue
      if (getIsLineClear(from, first) && getIsLineClear(first, second) && getIsLineClear(second, to)) {
        return [from, first, second, to]
      }
    }
    return null
  }

  const getFilledPoints = () => {
    const points: AnimalMatchingPoint[] = []
    grid.forEach((cells, row) =>
      cells.forEach((icon, col) => {
        if (icon !== EMPTY) points.push({ row, col })
      }),
    )
    return points
  }

  const getAvailablePair = () => {
    const points = getFilledPoints()
    for (let left = 0; left < points.length; left += 1) {
      for (let right = left + 1; right < points.length; right += 1) {
        const a = points[left]
        const b = points[right]
        if (getCell(a.row, a.col) !== getCell(b.row, b.col)) continue
        if (getPath(a, b)) return [a, b]
      }
    }
    return null
  }

  const updateShuffledGrid = () => {
    const points = getFilledPoints()
    const icons = getShuffled(points.map((point) => getCell(point.row, point.col)))
    points.forEach((point, index) => {
      grid[point.row][point.col] = icons[index]
    })
  }

  const getTiles = (): AnimalMatchingTile[] => {
    const tiles: AnimalMatchingTile[] = []
    grid.forEach((cells, row) =>
      cells.forEach((icon, col) => {
        tiles.push({
          id: row * (grid[0]?.length ?? 0) + col,
          row,
          col,
          icon,
          isEmpty: icon === EMPTY,
          isSelected: !!selected && selected.row === row && selected.col === col,
          isHinted: hinted.some((point) => point.row === row && point.col === col),
        })
      }),
    )
    return tiles
  }

  const getData = (): DataAnimalMatchingGame => {
    const remainingTotal = getFilledPoints().length
    return {
      tiles: getTiles(),
      rowTotal: grid.length,
      colTotal: grid[0]?.length ?? 0,
      level,
      remainingTotal,
      selectedId: selected ? selected.row * (grid[0]?.length ?? 0) + selected.col : null,
      path,
      isCleared: remainingTotal === 0,
    }
  }

  const updateGame = () =>
    set({
      animalMatchingGame: { status: 'success', statusTitle: '', statusSubtitle: '', data: getData() },
    })

  const updateNewLevel = (levelNumber: number) => {
    const filled = getFilledGrid(levelNumber)
    grid = filled.grid
    level = levelNumber
    selected = null
    hinted = []
    path = []
    if (!getAvailablePair()) updateShuffledGrid()
    updateGame()
  }

  return {
    animalMatchingGame: {
      status: 'loading',
      statusTitle: 'Menyiapkan papan',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },

    setAnimalMatchingInit: () => updateNewLevel(1),
    setAnimalMatchingRestart: () => updateNewLevel(level),
    setAnimalMatchingNextLevel: () => updateNewLevel(level + 1),

    setAnimalMatchingSelect: (tileId) => {
      const data = get().animalMatchingGame.data
      if (!data) return

      const colTotal = grid[0]?.length ?? 0
      const point = { row: Math.floor(tileId / colTotal), col: tileId % colTotal }
      if (getCell(point.row, point.col) === EMPTY) return

      hinted = []
      if (!selected) {
        selected = point
        path = []
        updateGame()
        return
      }
      if (selected.row === point.row && selected.col === point.col) {
        selected = null
        path = []
        updateGame()
        return
      }
      if (getCell(selected.row, selected.col) !== getCell(point.row, point.col)) {
        selected = point
        path = []
        updateGame()
        return
      }

      const found = getPath(selected, point)
      if (!found) {
        selected = point
        path = []
        updateGame()
        return
      }

      grid[selected.row][selected.col] = EMPTY
      grid[point.row][point.col] = EMPTY
      path = found
      selected = null
      if (getFilledPoints().length && !getAvailablePair()) updateShuffledGrid()
      updateGame()
    },

    setAnimalMatchingHint: () => {
      const pair = getAvailablePair()
      hinted = pair ?? []
      updateGame()
    },

    setAnimalMatchingShuffle: () => {
      updateShuffledGrid()
      selected = null
      hinted = []
      path = []
      if (!getAvailablePair()) updateShuffledGrid()
      updateGame()
    },
  }
})
