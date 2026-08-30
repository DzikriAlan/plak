import { create } from 'zustand'
import type {
  ColorSortBottle,
  ColorSortLevel,
  ColorSortMove,
  ColorSortPour,
  ColorSortProgress,
  ColorSortSegment,
  DataColorSortLevel,
} from '../types/colorSortTypes'

interface ColorSortStore {
  colorSortLevel: ColorSortLevel
  colorSortProgress: ColorSortProgress
  selectedBottle: number | null
  activePour: ColorSortPour | null
  moveHistory: ColorSortMove[]
  isLevelCleared: boolean
  setColorSortProgress: (progress: Partial<NonNullable<ColorSortProgress['data']>>) => void
  setColorSortInit: () => void
  setColorSortLevel: (level: number) => void
  setSelectedBottle: (bottleId: number | null) => void
  setColorSortPour: (bottleId: number) => void
  setColorSortPourDone: () => void
  setColorSortUndo: () => void
  setColorSortShuffle: () => void
  setColorSortAddBottle: () => void
  setColorSortNextLevel: () => void
  setColorSortRestart: () => void
}

const CAPACITY = 4
const MAX_COLOR = 12
const BOOSTER_PRICE = 100
const STORAGE_KEY = 'color-sort-progress'

export const useColorSortStates = create<ColorSortStore>((set, get) => {
  const getRandomInt = (max: number) => Math.floor(Math.random() * max)

  const getLevelConfig = (level: number) => {
    const colorTotal = Math.min(MAX_COLOR, 3 + Math.floor((level - 1) / 2))
    const emptyTotal = level >= 60 ? 1 : 2
    const hiddenBottleTotal = level < 25 ? 0 : Math.min(colorTotal, 1 + Math.floor((level - 25) / 5))
    return {
      capacity: CAPACITY,
      colorTotal,
      emptyTotal,
      hiddenBottleTotal,
      bottleTotal: colorTotal + emptyTotal,
    }
  }

  const getSolvedBoard = (colorTotal: number, emptyTotal: number) => {
    const board: number[][] = []
    for (let color = 0; color < colorTotal; color += 1) {
      board.push(new Array(CAPACITY).fill(color))
    }
    for (let empty = 0; empty < emptyTotal; empty += 1) board.push([])
    return board
  }

  const getTopRun = (bottle: number[]) => {
    if (!bottle.length) return { colorIndex: -1, length: 0 }
    const colorIndex = bottle[bottle.length - 1]
    let length = 0
    for (let index = bottle.length - 1; index >= 0; index -= 1) {
      if (bottle[index] !== colorIndex) break
      length += 1
    }
    return { colorIndex, length }
  }

  const getIsBoardSolved = (bottles: ColorSortBottle[]) =>
    bottles.every((bottle) => {
      if (!bottle.segments.length) return true
      if (bottle.segments.length !== CAPACITY) return false
      return bottle.segments.every((segment) => segment.colorIndex === bottle.segments[0].colorIndex)
    })

  const getScrambledBoard = (colorTotal: number, emptyTotal: number) => {
    const board = getSolvedBoard(colorTotal, emptyTotal)
    const totalStep = 80 + colorTotal * 30

    for (let step = 0; step < totalStep; step += 1) {
      const sourceCandidates = board.map((bottle, index) => ({ bottle, index })).filter((item) => item.bottle.length)
      if (!sourceCandidates.length) break
      const source = sourceCandidates[getRandomInt(sourceCandidates.length)]
      const run = getTopRun(source.bottle)
      const amountCandidates: number[] = []
      for (let amount = 1; amount <= run.length; amount += 1) {
        const isPartialRun = amount < run.length
        const isEmptying = amount === source.bottle.length
        if (isPartialRun || isEmptying) amountCandidates.push(amount)
      }
      if (!amountCandidates.length) continue
      const amount = amountCandidates[getRandomInt(amountCandidates.length)]
      const targetCandidates = board
        .map((bottle, index) => ({ bottle, index }))
        .filter((item) => {
          if (item.index === source.index) return false
          if (CAPACITY - item.bottle.length < amount) return false
          if (!item.bottle.length) return true
          return item.bottle[item.bottle.length - 1] !== run.colorIndex
        })
      if (!targetCandidates.length) continue
      const target = targetCandidates[getRandomInt(targetCandidates.length)]
      for (let unit = 0; unit < amount; unit += 1) {
        source.bottle.pop()
        target.bottle.push(run.colorIndex)
      }
    }

    return board
  }

  const getHiddenBoard = (board: number[][], hiddenBottleTotal: number) => {
    const filledIndexes = board
      .map((bottle, index) => ({ bottle, index }))
      .filter((item) => item.bottle.length > 1 && item.bottle.some((colorIndex) => colorIndex !== item.bottle[0]))
    const shuffled = filledIndexes.sort(() => Math.random() - 0.5).slice(0, hiddenBottleTotal)
    const hiddenIndexes = new Set(shuffled.map((item) => item.index))

    return board.map<ColorSortBottle>((bottle, index) => ({
      id: index,
      segments: bottle.map<ColorSortSegment>((colorIndex, segmentIndex) => ({
        colorIndex,
        isHidden: hiddenIndexes.has(index) && segmentIndex !== bottle.length - 1,
      })),
    }))
  }

  const getGeneratedLevel = (level: number) => {
    const config = getLevelConfig(level)
    let bottles: ColorSortBottle[] = []
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const board = getScrambledBoard(config.colorTotal, config.emptyTotal)
      bottles = getHiddenBoard(board, config.hiddenBottleTotal)
      if (!getIsBoardSolved(bottles)) break
    }

    const data: DataColorSortLevel = {
      level,
      capacity: CAPACITY,
      colorTotal: config.colorTotal,
      bottleTotal: bottles.length,
      hiddenTotal: config.hiddenBottleTotal,
      bottles,
    }
    return data
  }

  const getStoredProgress = () => {
    const fallback = { level: 1, coin: 560, undoLeft: 3, shuffleLeft: 3, addBottleLeft: 2, bestMoves: {} }
    if (typeof window === 'undefined') return fallback
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return fallback
      return { ...fallback, ...JSON.parse(raw) }
    } catch {
      return fallback
    }
  }

  const updateStoredProgress = (progress: NonNullable<ColorSortProgress['data']>) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      return
    }
  }

  const getClonedBottles = (bottles: ColorSortBottle[]) =>
    bottles.map((bottle) => ({ id: bottle.id, segments: bottle.segments.map((segment) => ({ ...segment })) }))

  const getBoosterPaidProgress = (key: 'undoLeft' | 'shuffleLeft' | 'addBottleLeft') => {
    const progress = get().colorSortProgress.data
    if (!progress) return null
    if (progress[key] > 0) return { ...progress, [key]: progress[key] - 1 }
    if (progress.coin >= BOOSTER_PRICE) return { ...progress, coin: progress.coin - BOOSTER_PRICE }
    return null
  }

  return {
    colorSortLevel: {
      status: 'loading',
      statusTitle: 'Menyiapkan level',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },
    colorSortProgress: {
      status: 'loading',
      statusTitle: 'Menyiapkan progres',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },
    selectedBottle: null,
    activePour: null,
    moveHistory: [],
    isLevelCleared: false,

    setColorSortProgress: (progress) =>
      set((state) => {
        const current = state.colorSortProgress.data ?? getStoredProgress()
        const next = { ...current, ...progress }
        updateStoredProgress(next)
        return {
          colorSortProgress: { ...state.colorSortProgress, status: 'success', data: next },
        }
      }),

    setColorSortInit: () => {
      const stored = getStoredProgress()
      get().setColorSortLevel(stored.level)
    },

    setColorSortLevel: (level) => {
      const stored = get().colorSortProgress.data ?? getStoredProgress()
      const next = { ...stored, level }
      updateStoredProgress(next)
      set({
        colorSortLevel: {
          status: 'success',
          statusTitle: '',
          statusSubtitle: '',
          data: getGeneratedLevel(level),
        },
        colorSortProgress: {
          status: 'success',
          statusTitle: '',
          statusSubtitle: '',
          data: next,
        },
        selectedBottle: null,
        activePour: null,
        moveHistory: [],
        isLevelCleared: false,
      })
    },

    setSelectedBottle: (bottleId) => set({ selectedBottle: bottleId }),

    setColorSortPour: (bottleId) => {
      const state = get()
      const data = state.colorSortLevel.data
      if (!data || state.activePour || state.isLevelCleared) return

      const selected = state.selectedBottle
      if (selected === null) {
        const source = data.bottles.find((bottle) => bottle.id === bottleId)
        if (!source || !source.segments.length) return
        set({ selectedBottle: bottleId })
        return
      }
      if (selected === bottleId) {
        set({ selectedBottle: null })
        return
      }

      const source = data.bottles.find((bottle) => bottle.id === selected)
      const target = data.bottles.find((bottle) => bottle.id === bottleId)
      if (!source || !target) return

      const sourceColors = source.segments.map((segment) => segment.colorIndex)
      const run = getTopRun(sourceColors)
      const freeSpace = data.capacity - target.segments.length
      const isTargetMatch =
        !target.segments.length || target.segments[target.segments.length - 1].colorIndex === run.colorIndex

      if (!run.length || !freeSpace || !isTargetMatch) {
        const isSelectable = !!target.segments.length
        set({ selectedBottle: isSelectable ? bottleId : null })
        return
      }

      set({
        selectedBottle: null,
        activePour: {
          from: source.id,
          to: target.id,
          amount: Math.min(run.length, freeSpace),
          colorIndex: run.colorIndex,
          startedAt: Date.now(),
        },
      })
    },

    setColorSortPourDone: () => {
      const state = get()
      const pour = state.activePour
      const data = state.colorSortLevel.data
      if (!pour || !data) return

      const bottles = getClonedBottles(data.bottles)
      const source = bottles.find((bottle) => bottle.id === pour.from)
      const target = bottles.find((bottle) => bottle.id === pour.to)
      if (!source || !target) return

      for (let unit = 0; unit < pour.amount; unit += 1) {
        source.segments.pop()
        target.segments.push({ colorIndex: pour.colorIndex, isHidden: false })
      }

      const revealedAt: number[] = []
      const topSegment = source.segments[source.segments.length - 1]
      if (topSegment && topSegment.isHidden) {
        topSegment.isHidden = false
        revealedAt.push(source.segments.length - 1)
      }

      const isCleared = getIsBoardSolved(bottles)
      const progress = state.colorSortProgress.data

      if (isCleared && progress) {
        const getBestMoves = () => {
          const moveTotal = state.moveHistory.length + 1
          const previous = progress.bestMoves[String(data.level)] ?? 0
          if (previous && previous <= moveTotal) return progress.bestMoves
          return { ...progress.bestMoves, [String(data.level)]: moveTotal }
        }

        const rewarded = {
          ...progress,
          coin: progress.coin + 25 + data.level * 2,
          bestMoves: getBestMoves(),
        }
        updateStoredProgress(rewarded)
        set((prev) => ({ colorSortProgress: { ...prev.colorSortProgress, data: rewarded } }))
      }

      set((prev) => ({
        colorSortLevel: { ...prev.colorSortLevel, data: { ...data, bottles } },
        activePour: null,
        isLevelCleared: isCleared,
        moveHistory: [
          ...prev.moveHistory,
          { from: pour.from, to: pour.to, amount: pour.amount, colorIndex: pour.colorIndex, revealedAt },
        ],
      }))
    },

    setColorSortUndo: () => {
      const state = get()
      const data = state.colorSortLevel.data
      const lastMove = state.moveHistory[state.moveHistory.length - 1]
      if (!data || !lastMove || state.activePour || state.isLevelCleared) return

      const paid = getBoosterPaidProgress('undoLeft')
      if (!paid) return

      const bottles = getClonedBottles(data.bottles)
      const source = bottles.find((bottle) => bottle.id === lastMove.from)
      const target = bottles.find((bottle) => bottle.id === lastMove.to)
      if (!source || !target) return

      lastMove.revealedAt.forEach((index) => {
        if (source.segments[index]) source.segments[index].isHidden = true
      })
      for (let unit = 0; unit < lastMove.amount; unit += 1) {
        target.segments.pop()
        source.segments.push({ colorIndex: lastMove.colorIndex, isHidden: false })
      }

      updateStoredProgress(paid)
      set((prev) => ({
        colorSortLevel: { ...prev.colorSortLevel, data: { ...data, bottles } },
        colorSortProgress: { ...prev.colorSortProgress, data: paid },
        moveHistory: prev.moveHistory.slice(0, -1),
        selectedBottle: null,
      }))
    },

    setColorSortShuffle: () => {
      const state = get()
      const data = state.colorSortLevel.data
      if (!data || state.activePour || state.isLevelCleared) return

      const paid = getBoosterPaidProgress('shuffleLeft')
      if (!paid) return

      updateStoredProgress(paid)
      set((prev) => ({
        colorSortLevel: { ...prev.colorSortLevel, data: getGeneratedLevel(data.level) },
        colorSortProgress: { ...prev.colorSortProgress, data: paid },
        moveHistory: [],
        selectedBottle: null,
      }))
    },

    setColorSortAddBottle: () => {
      const state = get()
      const data = state.colorSortLevel.data
      if (!data || state.activePour || state.isLevelCleared) return

      const paid = getBoosterPaidProgress('addBottleLeft')
      if (!paid) return

      const bottles = [...getClonedBottles(data.bottles), { id: data.bottles.length, segments: [] }]
      updateStoredProgress(paid)
      set((prev) => ({
        colorSortLevel: {
          ...prev.colorSortLevel,
          data: { ...data, bottles, bottleTotal: bottles.length },
        },
        colorSortProgress: { ...prev.colorSortProgress, data: paid },
        selectedBottle: null,
      }))
    },

    setColorSortNextLevel: () => {
      const data = get().colorSortLevel.data
      get().setColorSortLevel((data?.level ?? 1) + 1)
    },

    setColorSortRestart: () => {
      const data = get().colorSortLevel.data
      get().setColorSortLevel(data?.level ?? 1)
    },
  }
})
