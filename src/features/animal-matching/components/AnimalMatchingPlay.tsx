'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAnimalMatchingStates } from '../states/animalMatchingStates'
import AnimalMatchingHeader from './AnimalMatchingHeader'
import AnimalMatchingBoard from './AnimalMatchingBoard'

export default function AnimalMatchingPlay() {
  const {
    animalMatchingGame,
    setAnimalMatchingInit,
    setAnimalMatchingSelect,
    setAnimalMatchingHint,
    setAnimalMatchingShuffle,
    setAnimalMatchingNextLevel,
    setAnimalMatchingRestart,
  } = useAnimalMatchingStates()
  const [filters, setFilters] = useState({
    activeLevel: 0,
    secondsLeft: 0,
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const game = animalMatchingGame.data
    const tiles = game?.tiles ?? []

    return {
      data: tiles,
      isLoading: animalMatchingGame.status === 'loading',
      isError: animalMatchingGame.status === 'error',
      isEmpty: animalMatchingGame.status === 'success' && !tiles.length,
      emptyTitle: 'Board unavailable',
      emptySubtitle: 'Reload the page to start a new game.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: tiles.length, totalItem: tiles.length },
      rowTotal: game?.rowTotal ?? 0,
      colTotal: game?.colTotal ?? 0,
      level: game?.level ?? 1,
      remainingTotal: game?.remainingTotal ?? 0,
      timeLimit: game?.timeLimit ?? 0,
      secondsLeft: filters.secondsLeft,
      path: game?.path ?? [],
      rowCount: game?.rowTotal ?? 0,
      isCleared: !!game?.isCleared,
      isTimeUp: !!game && !game.isCleared && filters.activeLevel === game.level && filters.secondsLeft <= 0,
    }
  }, [animalMatchingGame, filters])
  const submitAnimalMatchingTile = (tileId: number) => {
    setAnimalMatchingSelect(tileId)
  }
  const submitAnimalMatchingNextLevel = () => {
    setFilters((prev) => ({ ...prev, activeLevel: 0, secondsLeft: 0 }))
    setAnimalMatchingNextLevel()
  }
  const loadAnimalMatchingHint = () => {
    setAnimalMatchingHint()
  }
  const editAnimalMatchingShuffle = () => {
    setAnimalMatchingShuffle()
  }
  const clearAnimalMatchingLevel = () => {
    setFilters((prev) => ({ ...prev, activeLevel: 0, secondsLeft: 0 }))
    setAnimalMatchingRestart()
  }

  useEffect(() => {
    setAnimalMatchingInit()
  }, [setAnimalMatchingInit])
  useEffect(() => {
    const game = animalMatchingGame.data
    if (!game) return
    // Waktu direset tiap level berganti maupun saat level diulang.
    setFilters((prev) =>
      prev.activeLevel === game.level && prev.secondsLeft > 0
        ? prev
        : { ...prev, activeLevel: game.level, secondsLeft: game.timeLimit },
    )
  }, [animalMatchingGame])
  useEffect(() => {
    if (data.isCleared || data.isTimeUp || !data.secondsLeft) return
    const timer = window.setInterval(() => {
      setFilters((prev) => ({ ...prev, secondsLeft: Math.max(0, prev.secondsLeft - 1) }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [data.isCleared, data.isTimeUp, data.secondsLeft])

  return (
    <div className="flex h-[100dvh] w-full items-stretch justify-center overflow-hidden bg-[#0a0a0b] p-3 sm:p-5">
      <div className="flex h-full w-full max-w-[480px] flex-col gap-3">
        <AnimalMatchingHeader
          level={data.level}
          remainingTotal={data.remainingTotal}
          secondsLeft={data.secondsLeft}
          timeLimit={data.timeLimit}
        />

        <main className="flex min-h-0 flex-1 items-center justify-center">
          {data.isLoading ? (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">Preparing board…</p>
          ) : (
            <AnimalMatchingBoard
              tiles={data.data}
              rowTotal={data.rowTotal}
              colTotal={data.colTotal}
              path={data.path}
              onSubmitAnimalMatchingTile={submitAnimalMatchingTile}
            />
          )}
        </main>

        <footer className="grid shrink-0 grid-cols-3 gap-2">
          <button
            type="button"
            onClick={loadAnimalMatchingHint}
            className="rounded-xl border border-[#3a3a42] py-2 text-[12px] font-medium text-[#f2ede1] transition-colors hover:border-[#f2ede1]"
          >
            Hint
          </button>
          <button
            type="button"
            onClick={editAnimalMatchingShuffle}
            className="rounded-xl border border-[#3a3a42] py-2 text-[12px] font-medium text-[#f2ede1] transition-colors hover:border-[#f2ede1]"
          >
            Shuffle
          </button>
          <button
            type="button"
            onClick={clearAnimalMatchingLevel}
            className="rounded-xl bg-[#f2ede1] py-2 text-[12px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
          >
            Restart
          </button>
        </footer>
      </div>

      {data.isTimeUp ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Time&rsquo;s up</p>
            <p className="mt-2 text-3xl font-black uppercase leading-none text-[#f2ede1]">Level {data.level}</p>
            <p className="mt-2 text-[13px] font-medium text-[#9aa3b2]">
              {data.remainingTotal} tiles left unmatched.
            </p>
            <button
              type="button"
              onClick={clearAnimalMatchingLevel}
              className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      {data.isCleared ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Level complete</p>
            <p className="mt-2 text-3xl font-black uppercase leading-none text-[#f2ede1]">Level {data.level}</p>
            <p className="mt-2 text-[13px] font-medium text-[#9aa3b2]">Every animal has been matched.</p>
            <button
              type="button"
              onClick={submitAnimalMatchingNextLevel}
              className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
            >
              Next level
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
