'use client'

import { useEffect, useMemo, useState } from 'react'
import type { AnimalMatchingTile } from '../types/animalMatchingTypes'
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
    startLevel: 0,
    startTotal: 0,
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const getProgress = (tiles: AnimalMatchingTile[], startTotal: number) => {
      if (!startTotal) return 0
      const remaining = tiles.filter((tile) => !tile.isEmpty).length
      return Math.round(((startTotal - remaining) / startTotal) * 100)
    }

    const game = animalMatchingGame.data
    const tiles = game?.tiles ?? []

    return {
      data: tiles,
      isLoading: animalMatchingGame.status === 'loading',
      isError: animalMatchingGame.status === 'error',
      isEmpty: animalMatchingGame.status === 'success' && !tiles.length,
      emptyTitle: 'Papan tidak tersedia',
      emptySubtitle: 'Muat ulang halaman untuk memulai permainan.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: tiles.length, totalItem: tiles.length },
      rowTotal: game?.rowTotal ?? 0,
      colTotal: game?.colTotal ?? 0,
      level: game?.level ?? 1,
      remainingTotal: game?.remainingTotal ?? 0,
      progress: getProgress(tiles, filters.startTotal),
      isCleared: !!game?.isCleared,
    }
  }, [animalMatchingGame, filters])
  const submitAnimalMatchingTile = (tileId: number) => {
    setAnimalMatchingSelect(tileId)
  }
  const submitAnimalMatchingNextLevel = () => {
    setAnimalMatchingNextLevel()
  }
  const loadAnimalMatchingHint = () => {
    setAnimalMatchingHint()
  }
  const editAnimalMatchingShuffle = () => {
    setAnimalMatchingShuffle()
  }
  const clearAnimalMatchingLevel = () => {
    setAnimalMatchingRestart()
  }

  useEffect(() => {
    setAnimalMatchingInit()
  }, [setAnimalMatchingInit])
  useEffect(() => {
    const game = animalMatchingGame.data
    if (!game || !game.remainingTotal) return
    // Papan membesar tiap beberapa level, jadi patokan progres direset per level.
    setFilters((prev) =>
      prev.startLevel === game.level ? prev : { ...prev, startLevel: game.level, startTotal: game.remainingTotal },
    )
  }, [animalMatchingGame])

  return (
    <div className="flex h-[100dvh] w-full items-stretch justify-center overflow-hidden bg-[#0a0a0b] p-3 sm:p-5">
      <div className="flex h-full w-full max-w-[520px] flex-col gap-3">
        <AnimalMatchingHeader level={data.level} remainingTotal={data.remainingTotal} progress={data.progress} />

        <main className="flex min-h-0 flex-1 items-center justify-center">
          {data.isLoading ? (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">Menyiapkan papan…</p>
          ) : (
            <AnimalMatchingBoard
              tiles={data.data}
              rowTotal={data.rowTotal}
              colTotal={data.colTotal}
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
            Petunjuk
          </button>
          <button
            type="button"
            onClick={editAnimalMatchingShuffle}
            className="rounded-xl border border-[#3a3a42] py-2 text-[12px] font-medium text-[#f2ede1] transition-colors hover:border-[#f2ede1]"
          >
            Acak
          </button>
          <button
            type="button"
            onClick={clearAnimalMatchingLevel}
            className="rounded-xl bg-[#f2ede1] py-2 text-[12px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
          >
            Ulang
          </button>
        </footer>
      </div>

      {data.isCleared ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Level selesai</p>
            <p className="mt-2 text-3xl font-black uppercase leading-none text-[#f2ede1]">Level {data.level}</p>
            <p className="mt-2 text-[13px] font-medium text-[#9aa3b2]">Semua hewan berhasil dipasangkan.</p>
            <button
              type="button"
              onClick={submitAnimalMatchingNextLevel}
              className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
            >
              Level berikutnya
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
