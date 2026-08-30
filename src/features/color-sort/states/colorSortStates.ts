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
  activePours: ColorSortPour[]
  moveHistory: ColorSortMove[]
  isLevelCleared: boolean
  setColorSortProgress: (progress: Partial<NonNullable<ColorSortProgress['data']>>) => void
  setColorSortInit: () => void
  setColorSortLevel: (level: number) => void
  setSelectedBottle: (bottleId: number | null) => void
  setColorSortPour: (bottleId: number) => void
  setColorSortPourDone: (pourId: number) => void
  setColorSortUndo: () => void
  setColorSortShuffle: () => void
  setColorSortAddBottle: () => void
  setColorSortNextLevel: () => void
  setColorSortRestart: () => void
}

const CAPACITY = 4
const MAX_COLOR = 9
const MAX_PER_ROW = 6
const BOTTLE_UNIT_HEIGHT = 0.445
const BOTTLE_FIXED_HEIGHT = 0.72
const ROW_GAP = 0.9
const BOOSTER_PRICE = 100
const STORAGE_KEY = 'color-sort-progress'

export const useColorSortStates = create<ColorSortStore>((set, get) => {
  let pourSequence = 0

  const getRandomInt = (max: number) => Math.floor(Math.random() * max)

  const getLevelConfig = (level: number) => {
    const giantTotal = level >= 30 ? 1 : 0
    const colorTotal = Math.min(MAX_COLOR - giantTotal, 3 + Math.floor((level - 1) / 2))
    const emptyTotal = level >= 60 ? 1 : 2
    const hiddenBottleTotal = level < 25 ? 0 : Math.min(colorTotal, 1 + Math.floor((level - 25) / 5))
    const normalTotal = colorTotal + emptyTotal
    const perRow = normalTotal <= MAX_PER_ROW ? normalTotal : Math.ceil(normalTotal / Math.ceil(normalTotal / MAX_PER_ROW))
    const rowTotal = Math.ceil(normalTotal / perRow)
    const normalHeight = BOTTLE_FIXED_HEIGHT + CAPACITY * BOTTLE_UNIT_HEIGHT
    const boardHeight = rowTotal * normalHeight + (rowTotal - 1) * ROW_GAP
    const giantSlotTotal = Math.floor((boardHeight - BOTTLE_FIXED_HEIGHT) / BOTTLE_UNIT_HEIGHT)
    const giantCapacity = Math.max(CAPACITY, Math.floor(giantSlotTotal / CAPACITY) * CAPACITY)
    return { colorTotal, emptyTotal, hiddenBottleTotal, giantTotal, giantCapacity }
  }

  const getSolvedBoard = (colorTotal: number, emptyTotal: number, giantTotal: number, giantCapacity: number) => {
    const board: Array<{ capacity: number; isGiant: boolean; units: number[] }> = []
    for (let color = 0; color < colorTotal; color += 1) {
      board.push({ capacity: CAPACITY, isGiant: false, units: new Array(CAPACITY).fill(color) })
    }
    for (let empty = 0; empty < emptyTotal; empty += 1) {
      board.push({ capacity: CAPACITY, isGiant: false, units: [] })
    }
    const shuffled = board.sort(() => Math.random() - 0.5)
    // Botol raksasa memakai warna khusus miliknya sendiri dan harus terisi penuh oleh warna itu.
    if (giantTotal) {
      shuffled.push({ capacity: giantCapacity, isGiant: true, units: new Array(giantCapacity).fill(colorTotal) })
    }
    return shuffled
  }

  const getTopRun = (units: number[]) => {
    if (!units.length) return { colorIndex: -1, length: 0 }
    const colorIndex = units[units.length - 1]
    let length = 0
    for (let index = units.length - 1; index >= 0; index -= 1) {
      if (units[index] !== colorIndex) break
      length += 1
    }
    return { colorIndex, length }
  }

  const getIsBoardSolved = (bottles: ColorSortBottle[]) =>
    bottles.every((bottle) => {
      if (bottle.isGiant) {
        if (bottle.segments.length !== bottle.capacity) return false
        return bottle.segments.every((segment) => segment.colorIndex === bottle.segments[0].colorIndex)
      }
      if (!bottle.segments.length) return true
      if (bottle.segments.length !== bottle.capacity) return false
      return bottle.segments.every((segment) => segment.colorIndex === bottle.segments[0].colorIndex)
    })

  const getScrambledBoard = (colorTotal: number, emptyTotal: number, giantTotal: number, giantCapacity: number) => {
    const board = getSolvedBoard(colorTotal, emptyTotal, giantTotal, giantCapacity)
    const totalStep = 90 + colorTotal * 30

    for (let step = 0; step < totalStep; step += 1) {
      const sourceCandidates = board
        .map((item, index) => ({ item, index }))
        .filter((entry) => entry.item.units.length)
      if (!sourceCandidates.length) break
      const source = sourceCandidates[getRandomInt(sourceCandidates.length)]
      const run = getTopRun(source.item.units)

      const amountCandidates: number[] = []
      for (let amount = 1; amount <= run.length; amount += 1) {
        const isPartialRun = amount < run.length
        const isEmptying = amount === source.item.units.length
        if (isPartialRun || isEmptying) amountCandidates.push(amount)
      }
      if (!amountCandidates.length) continue
      const amount = amountCandidates[getRandomInt(amountCandidates.length)]

      const targetCandidates = board
        .map((item, index) => ({ item, index }))
        .filter((entry) => {
          if (entry.index === source.index) return false
          if (entry.item.capacity - entry.item.units.length < amount) return false
          if (!entry.item.units.length) return true
          return entry.item.units[entry.item.units.length - 1] !== run.colorIndex
        })
      if (!targetCandidates.length) continue
      const target = targetCandidates[getRandomInt(targetCandidates.length)]
      for (let unit = 0; unit < amount; unit += 1) {
        source.item.units.pop()
        target.item.units.push(run.colorIndex)
      }
    }

    return board
  }

  const getHiddenBoard = (
    board: Array<{ capacity: number; isGiant: boolean; units: number[] }>,
    hiddenBottleTotal: number,
  ) => {
    const mixedIndexes = board
      .map((item, index) => ({ item, index }))
      .filter(
        (entry) =>
          !entry.item.isGiant &&
          entry.item.units.length > 1 &&
          entry.item.units.some((unit) => unit !== entry.item.units[0]),
      )
    const hiddenIndexes = new Set(
      mixedIndexes
        .sort(() => Math.random() - 0.5)
        .slice(0, hiddenBottleTotal)
        .map((entry) => entry.index),
    )

    return board.map<ColorSortBottle>((item, index) => ({
      id: index,
      capacity: item.capacity,
      isGiant: item.isGiant,
      segments: item.units.map<ColorSortSegment>((colorIndex, segmentIndex) => ({
        colorIndex,
        isHidden: hiddenIndexes.has(index) && segmentIndex !== item.units.length - 1,
      })),
    }))
  }

  const getGeneratedLevel = (level: number) => {
    const config = getLevelConfig(level)
    let bottles: ColorSortBottle[] = []
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const board = getScrambledBoard(config.colorTotal, config.emptyTotal, config.giantTotal, config.giantCapacity)
      bottles = getHiddenBoard(board, config.hiddenBottleTotal)
      if (!getIsBoardSolved(bottles)) break
    }

    const data: DataColorSortLevel = {
      level,
      capacity: CAPACITY,
      giantCapacity: config.giantTotal ? config.giantCapacity : 0,
      colorTotal: config.colorTotal,
      bottleTotal: bottles.length,
      hiddenTotal: config.hiddenBottleTotal,
      giantTotal: config.giantTotal,
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
    bottles.map((bottle) => ({
      id: bottle.id,
      capacity: bottle.capacity,
      isGiant: bottle.isGiant,
      segments: bottle.segments.map((segment) => ({ ...segment })),
    }))

  const getLockedBottles = (pours: ColorSortPour[]) => {
    const locked = new Set<number>()
    pours.forEach((pour) => {
      locked.add(pour.from)
      locked.add(pour.to)
    })
    return locked
  }

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
      statusTitle: 'Preparing level',
      statusSubtitle: 'Please wait a moment.',
      data: null,
    },
    colorSortProgress: {
      status: 'loading',
      statusTitle: 'Preparing progress',
      statusSubtitle: 'Please wait a moment.',
      data: null,
    },
    selectedBottle: null,
    activePours: [],
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
        activePours: [],
        moveHistory: [],
        isLevelCleared: false,
      })
    },

    setSelectedBottle: (bottleId) => set({ selectedBottle: bottleId }),

    setColorSortPour: (bottleId) => {
      const state = get()
      const data = state.colorSortLevel.data
      if (!data || state.isLevelCleared) return

      const locked = getLockedBottles(state.activePours)
      if (locked.has(bottleId)) return

      const selected = state.selectedBottle
      if (selected === null) {
        const source = data.bottles.find((bottle) => bottle.id === bottleId)
        if (!source || source.isGiant || !source.segments.length) return
        set({ selectedBottle: bottleId })
        return
      }
      if (selected === bottleId) {
        set({ selectedBottle: null })
        return
      }

      const source = data.bottles.find((bottle) => bottle.id === selected)
      const target = data.bottles.find((bottle) => bottle.id === bottleId)
      if (!source || !target || locked.has(source.id)) {
        set({ selectedBottle: null })
        return
      }

      const sourceColors = source.segments.map((segment) => segment.colorIndex)
      const run = getTopRun(sourceColors)
      const freeSpace = target.capacity - target.segments.length
      const isTargetMatch =
        !target.segments.length || target.segments[target.segments.length - 1].colorIndex === run.colorIndex
      const isGiantPour = target.isGiant
      const isPourAllowed = isGiantPour
        ? run.length >= CAPACITY && freeSpace >= CAPACITY
        : !!run.length && !!freeSpace && isTargetMatch

      if (!isPourAllowed) {
        const isSelectable = !!target.segments.length && !target.isGiant
        set({ selectedBottle: isSelectable ? bottleId : null })
        return
      }

      pourSequence += 1
      set((prev) => ({
        selectedBottle: null,
        activePours: [
          ...prev.activePours,
          {
            id: pourSequence,
            from: source.id,
            to: target.id,
            amount: isGiantPour ? CAPACITY : Math.min(run.length, freeSpace),
            colorIndex: run.colorIndex,
            startedAt: Date.now(),
          },
        ],
      }))
    },

    setColorSortPourDone: (pourId) => {
      const state = get()
      const pour = state.activePours.find((item) => item.id === pourId)
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
        activePours: prev.activePours.filter((item) => item.id !== pourId),
        isLevelCleared: isCleared,
        moveHistory: [
          ...prev.moveHistory,
          { id: pour.id, from: pour.from, to: pour.to, amount: pour.amount, colorIndex: pour.colorIndex, revealedAt },
        ],
      }))
    },

    setColorSortUndo: () => {
      const state = get()
      const data = state.colorSortLevel.data
      const lastMove = state.moveHistory[state.moveHistory.length - 1]
      if (!data || !lastMove || state.activePours.length || state.isLevelCleared) return

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
      if (!data || state.activePours.length || state.isLevelCleared) return

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
      if (!data || state.activePours.length || state.isLevelCleared) return

      const paid = getBoosterPaidProgress('addBottleLeft')
      if (!paid) return

      const bottles = [
        ...getClonedBottles(data.bottles),
        { id: data.bottles.length, capacity: CAPACITY, isGiant: false, segments: [] },
      ]
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
