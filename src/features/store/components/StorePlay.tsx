'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StoreGame } from '../types/storeTypes'
import { useStoreStates } from '../states/storeStates'
import StoreHeader from './StoreHeader'
import StoreFilter from './StoreFilter'
import StoreCard from './StoreCard'

export default function StorePlay() {
  const { storeCatalog, setStoreCategory, setStoreReset } = useStoreStates()
  const railRef = useRef<HTMLDivElement | null>(null)
  const [filters, setFilters] = useState({
    activeRail: {
      isScrollable: false,
      isEnd: false,
    },
    pagination: {
      currentPage: 1,
      perPage: 0,
      totalItem: 0,
      totalPage: 1,
    },
  })
  const data = useMemo(() => {
    const getCategoryGames = (games: StoreGame[], activeCategory: string) =>
      games.filter((game) => activeCategory === 'all' || game.category === activeCategory)

    const catalog = storeCatalog.data
    const activeCategory = catalog?.activeCategory ?? 'all'
    const games = getCategoryGames(catalog?.games ?? [], activeCategory)

    return {
      data: games,
      isLoading: storeCatalog.status === 'loading',
      isError: storeCatalog.status === 'error',
      isEmpty: storeCatalog.status === 'success' && !games.length,
      emptyTitle: 'Game tidak ketemu',
      emptySubtitle: 'Belum ada game di kategori ini. Pilih kategori Semua.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: games.length, totalItem: games.length },
      categories: catalog?.categories ?? [],
      activeCategory,
      isScrollable: filters.activeRail.isScrollable,
      isRailEnd: filters.activeRail.isEnd,
    }
  }, [storeCatalog, filters])
  const loadStoreRail = useCallback(() => {
    const rail = railRef.current
    if (!rail) return

    const getRailState = (element: HTMLDivElement) => {
      const room = element.scrollWidth - element.clientWidth
      if (room <= 4) return { isScrollable: false, isEnd: false }
      return { isScrollable: true, isEnd: element.scrollLeft >= room - 4 }
    }

    setFilters((prev) => ({ ...prev, activeRail: getRailState(rail) }))
  }, [])
  const editStoreCategory = (categoryId: string) => {
    setStoreCategory(categoryId)
    railRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }
  const clearStoreFilter = () => {
    setStoreReset()
  }
  const loadStoreRailNext = () => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: data.isRailEnd ? -rail.scrollWidth : rail.clientWidth * 0.8, behavior: 'smooth' })
  }

  useEffect(() => {
    loadStoreRail()
    const rail = railRef.current
    if (!rail) return
    const observer = new ResizeObserver(loadStoreRail)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [loadStoreRail, data.data.length])

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0a0a0b] text-[#f2ede1]">
      <div className="mx-auto flex h-full w-full max-w-[1280px] flex-col gap-4 px-5 py-6 sm:gap-6 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <StoreHeader />

        <StoreFilter
          categories={data.categories}
          activeCategory={data.activeCategory}
          onEditStoreCategory={editStoreCategory}
        />

        {data.isEmpty ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-[#26262b] bg-[#121214] px-6 text-center">
            <p className="text-base font-black uppercase tracking-tight text-[#f2ede1]">{data.emptyTitle}</p>
            <p className="text-[13px] font-medium text-[#9aa3b2]">{data.emptySubtitle}</p>
            <button
              type="button"
              onClick={clearStoreFilter}
              className="mt-3 rounded-full border border-[#f2ede1] px-4 py-2 text-[12px] font-medium text-[#f2ede1] transition-colors hover:bg-[#f2ede1] hover:text-[#0a0a0b]"
            >
              Lihat semua game
            </button>
          </div>
        ) : (
          <section className="relative flex min-h-0 flex-1 flex-col">
            <div
              ref={railRef}
              onScroll={loadStoreRail}
              className="flex min-h-0 flex-1 snap-x snap-mandatory items-stretch gap-4 max-h-[460px] overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] lg:gap-5 [&::-webkit-scrollbar]:hidden"
            >
              {data.data.map((game) => (
                <div
                  key={game.id}
                  className="h-full w-[calc(100vw-3.5rem)] max-w-[320px] shrink-0 snap-start sm:w-[300px] lg:w-[310px]"
                >
                  <StoreCard game={game} />
                </div>
              ))}
            </div>

            {data.isScrollable ? (
              <button
                type="button"
                onClick={loadStoreRailNext}
                aria-label={data.isRailEnd ? 'Kembali ke awal daftar' : 'Geser daftar game'}
                className="absolute -right-7 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#3a3a42] bg-[#0a0a0b] text-[#f2ede1] transition-colors hover:border-[#f2ede1] lg:flex"
              >
                <svg
                  viewBox="0 0 16 16"
                  className={`h-4 w-4 transition-transform ${data.isRailEnd ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}

          </section>
        )}
      </div>
    </div>
  )
}
