import { create } from 'zustand'
import type { DataStoreCatalog, StoreCatalog, StoreCategory } from '../types/storeTypes'
import { STORE_GAMES } from '../static/storeGames'

interface StoreStore {
  storeCatalog: StoreCatalog
  setStoreCategory: (categoryId: string) => void
  setStoreHistoryInit: () => void
  setStoreHistory: (gameId: string) => void
  setStoreReset: () => void
}

const HISTORY_KEY = 'waitplay-history'
const HISTORY_TOTAL = 8

export const useStoreStates = create<StoreStore>((set, get) => {
  // Riwayat disimpan di peramban pemain, jadi hanya dibaca setelah halaman terpasang.
  const getStoredHistory = () => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
      return []
    }
  }

  const updateStoredHistory = (historyIds: string[]) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(historyIds))
    } catch {
      return
    }
  }

  const getCategories = (): StoreCategory[] => {
    const counter = new Map<string, StoreCategory>()
    STORE_GAMES.forEach((game) => {
      const holder = counter.get(game.category)
      if (holder) {
        holder.total += 1
        return
      }
      counter.set(game.category, { id: game.category, label: game.categoryLabel, total: 1 })
    })
    return [{ id: 'all', label: 'All', total: STORE_GAMES.length }, ...Array.from(counter.values())]
  }

  const getCatalog = (activeCategory: string, historyIds: string[]): DataStoreCatalog => ({
    games: STORE_GAMES,
    categories: getCategories(),
    activeCategory,
    historyIds,
  })

  const updateCatalog = (activeCategory: string, historyIds: string[]) =>
    set({
      storeCatalog: {
        status: 'success',
        statusTitle: '',
        statusSubtitle: '',
        data: getCatalog(activeCategory, historyIds),
      },
    })

  return {
    // Katalog statis, jadi langsung terisi supaya kartu game ikut ter-render di HTML server.
    storeCatalog: {
      status: 'success',
      statusTitle: '',
      statusSubtitle: '',
      data: getCatalog('all', []),
    },

    setStoreCategory: (categoryId) => {
      const data = get().storeCatalog.data
      if (!data) return
      updateCatalog(categoryId, data.historyIds)
    },

    setStoreHistoryInit: () => {
      const data = get().storeCatalog.data
      updateCatalog(data?.activeCategory ?? 'all', getStoredHistory())
    },

    setStoreHistory: (gameId) => {
      const data = get().storeCatalog.data
      const historyIds = [gameId, ...(data?.historyIds ?? []).filter((id) => id !== gameId)].slice(0, HISTORY_TOTAL)
      updateStoredHistory(historyIds)
      updateCatalog(data?.activeCategory ?? 'all', historyIds)
    },

    setStoreReset: () => updateCatalog('all', get().storeCatalog.data?.historyIds ?? []),
  }
})
