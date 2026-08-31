import { create } from 'zustand'
import type {
  DataMazeRunnerGame,
  MazeRunnerCell,
  MazeRunnerDirection,
  MazeRunnerGame,
  MazeRunnerPoint,
} from '../types/mazeRunnerTypes'

interface MazeRunnerStore {
  mazeRunnerGame: MazeRunnerGame
  setMazeRunnerInit: () => void
  setMazeRunnerMove: (direction: MazeRunnerDirection) => void
  setMazeRunnerRun: (direction: MazeRunnerDirection) => void
  setMazeRunnerHint: () => void
  setMazeRunnerNextLevel: () => void
  setMazeRunnerRestart: () => void
}

const BASE_COL = 11
const BASE_ROW = 17
const MAX_COL = 15
const MAX_ROW = 23
const HINT_TOTAL = 3
const TIME_LIMIT = 300
const STEP_LIMIT = 64

export const useMazeRunnerStates = create<MazeRunnerStore>((set, get) => {
  const getRandomInt = (max: number) => Math.floor(Math.random() * max)

  const getLevelConfig = (level: number) => {
    const colTotal = Math.min(MAX_COL, BASE_COL + Math.floor((level - 1) / 3) * 2)
    const rowTotal = Math.min(MAX_ROW, BASE_ROW + Math.floor((level - 1) / 3) * 2)
    return { colTotal, rowTotal }
  }

  const getCellIndex = (point: MazeRunnerPoint, colTotal: number) => point.row * colTotal + point.col

  const getNeighbor = (point: MazeRunnerPoint, direction: MazeRunnerDirection) => {
    if (direction === 'up') return { row: point.row - 1, col: point.col }
    if (direction === 'down') return { row: point.row + 1, col: point.col }
    if (direction === 'left') return { row: point.row, col: point.col - 1 }
    return { row: point.row, col: point.col + 1 }
  }

  const getIsInside = (point: MazeRunnerPoint, rowTotal: number, colTotal: number) =>
    point.row >= 0 && point.col >= 0 && point.row < rowTotal && point.col < colTotal

  const getIsSideOpen = (cell: MazeRunnerCell, direction: MazeRunnerDirection) => {
    if (direction === 'up') return cell.isTopOpen
    if (direction === 'down') return cell.isBottomOpen
    if (direction === 'left') return cell.isLeftOpen
    return cell.isRightOpen
  }

  const updateOpenedSide = (cell: MazeRunnerCell, direction: MazeRunnerDirection) => {
    if (direction === 'up') cell.isTopOpen = true
    if (direction === 'down') cell.isBottomOpen = true
    if (direction === 'left') cell.isLeftOpen = true
    if (direction === 'right') cell.isRightOpen = true
  }

  // Labirin sempurna memakai depth first search supaya selalu ada tepat satu jalur ke sekolah.
  const getCarvedCells = (rowTotal: number, colTotal: number) => {
    const cells: MazeRunnerCell[] = []
    for (let row = 0; row < rowTotal; row += 1) {
      for (let col = 0; col < colTotal; col += 1) {
        cells.push({
          id: row * colTotal + col,
          row,
          col,
          isTopOpen: false,
          isRightOpen: false,
          isBottomOpen: false,
          isLeftOpen: false,
        })
      }
    }

    const visited = new Set<number>([0])
    const stack: MazeRunnerPoint[] = [{ row: 0, col: 0 }]
    const directions: MazeRunnerDirection[] = ['up', 'right', 'down', 'left']

    while (stack.length) {
      const current = stack[stack.length - 1]
      const options = directions.filter((direction) => {
        const next = getNeighbor(current, direction)
        if (!getIsInside(next, rowTotal, colTotal)) return false
        return !visited.has(getCellIndex(next, colTotal))
      })
      if (!options.length) {
        stack.pop()
        continue
      }
      const direction = options[getRandomInt(options.length)]
      const next = getNeighbor(current, direction)
      const opposite: Record<MazeRunnerDirection, MazeRunnerDirection> = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      }
      updateOpenedSide(cells[getCellIndex(current, colTotal)], direction)
      updateOpenedSide(cells[getCellIndex(next, colTotal)], opposite[direction])
      visited.add(getCellIndex(next, colTotal))
      stack.push(next)
    }

    return cells
  }

  const getSolvedPath = (
    cells: MazeRunnerCell[],
    rowTotal: number,
    colTotal: number,
    from: MazeRunnerPoint,
    to: MazeRunnerPoint,
  ) => {
    const directions: MazeRunnerDirection[] = ['up', 'right', 'down', 'left']
    const cameFrom = new Map<number, number>()
    const queue: MazeRunnerPoint[] = [from]
    const seen = new Set<number>([getCellIndex(from, colTotal)])

    while (queue.length) {
      const current = queue.shift() as MazeRunnerPoint
      if (current.row === to.row && current.col === to.col) break
      directions.forEach((direction) => {
        const next = getNeighbor(current, direction)
        if (!getIsInside(next, rowTotal, colTotal)) return
        const nextIndex = getCellIndex(next, colTotal)
        if (seen.has(nextIndex)) return
        if (!getIsSideOpen(cells[getCellIndex(current, colTotal)], direction)) return
        seen.add(nextIndex)
        cameFrom.set(nextIndex, getCellIndex(current, colTotal))
        queue.push(next)
      })
    }

    const targetIndex = getCellIndex(to, colTotal)
    if (!seen.has(targetIndex)) return []
    const path: MazeRunnerPoint[] = []
    let cursor = targetIndex
    while (cursor !== getCellIndex(from, colTotal)) {
      path.unshift({ row: Math.floor(cursor / colTotal), col: cursor % colTotal })
      cursor = cameFrom.get(cursor) as number
    }
    path.unshift({ row: from.row, col: from.col })
    return path
  }

  const getGeneratedGame = (level: number): DataMazeRunnerGame => {
    const config = getLevelConfig(level)
    const cells = getCarvedCells(config.rowTotal, config.colTotal)
    const player = { row: 0, col: 0 }
    const goal = { row: config.rowTotal - 1, col: config.colTotal - 1 }

    return {
      cells,
      rowTotal: config.rowTotal,
      colTotal: config.colTotal,
      level,
      player,
      goal,
      hintPath: [],
      hintTotal: HINT_TOTAL,
      hintUsed: 0,
      moveTotal: 0,
      timeLimit: TIME_LIMIT,
      isCleared: false,
    }
  }

  const getMovedGame = (game: DataMazeRunnerGame, direction: MazeRunnerDirection) => {
    const next = getNeighbor(game.player, direction)
    if (!getIsInside(next, game.rowTotal, game.colTotal)) return null
    if (!getIsSideOpen(game.cells[getCellIndex(game.player, game.colTotal)], direction)) return null

    return {
      ...game,
      player: next,
      moveTotal: game.moveTotal + 1,
      hintPath: [],
      isCleared: next.row === game.goal.row && next.col === game.goal.col,
    }
  }

  return {
    mazeRunnerGame: {
      status: 'loading',
      statusTitle: 'Menyiapkan labirin',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },

    setMazeRunnerInit: () =>
      set({
        mazeRunnerGame: {
          status: 'success',
          statusTitle: '',
          statusSubtitle: '',
          data: getGeneratedGame(1),
        },
      }),

    setMazeRunnerMove: (direction) => {
      const game = get().mazeRunnerGame.data
      if (!game || game.isCleared) return
      const moved = getMovedGame(game, direction)
      if (!moved) return
      set((prev) => ({ mazeRunnerGame: { ...prev.mazeRunnerGame, data: moved } }))
    },

    // Usapan layar membuat pemain berlari lurus sampai bertemu tembok atau persimpangan.
    setMazeRunnerRun: (direction) => {
      const game = get().mazeRunnerGame.data
      if (!game || game.isCleared) return

      const getBranchTotal = (point: MazeRunnerPoint) => {
        const cell = game.cells[getCellIndex(point, game.colTotal)]
        const directions: MazeRunnerDirection[] = ['up', 'right', 'down', 'left']
        return directions.filter((side) => getIsSideOpen(cell, side)).length
      }

      let current = game
      for (let step = 0; step < STEP_LIMIT; step += 1) {
        const moved = getMovedGame(current, direction)
        if (!moved) break
        current = moved
        if (current.isCleared) break
        if (getBranchTotal(current.player) > 2) break
      }
      if (current === game) return
      set((prev) => ({ mazeRunnerGame: { ...prev.mazeRunnerGame, data: current } }))
    },

    setMazeRunnerHint: () => {
      const game = get().mazeRunnerGame.data
      if (!game || game.isCleared || game.hintUsed >= game.hintTotal) return
      const hintPath = getSolvedPath(game.cells, game.rowTotal, game.colTotal, game.player, game.goal)
      if (!hintPath.length) return
      set((prev) => ({
        mazeRunnerGame: {
          ...prev.mazeRunnerGame,
          data: { ...game, hintPath, hintUsed: game.hintUsed + 1 },
        },
      }))
    },

    setMazeRunnerNextLevel: () => {
      const game = get().mazeRunnerGame.data
      set((prev) => ({
        mazeRunnerGame: { ...prev.mazeRunnerGame, data: getGeneratedGame((game?.level ?? 1) + 1) },
      }))
    },

    setMazeRunnerRestart: () => {
      const game = get().mazeRunnerGame.data
      set((prev) => ({
        mazeRunnerGame: { ...prev.mazeRunnerGame, data: getGeneratedGame(game?.level ?? 1) },
      }))
    },
  }
})
