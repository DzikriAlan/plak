import { create } from 'zustand'
import type { DataStoreCatalog, StoreCatalog, StoreCategory } from '../types/storeTypes'
import { STORE_GAMES } from '../static/storeGames'

interface StoreStore {
  storeCatalog: StoreCatalog
  setStoreCategory: (categoryId: string) => void
  setStoreReset: () => void
}

export const useStoreStates = create<StoreStore>((set, get) => {
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
    return [{ id: 'all', label: 'Semua', total: STORE_GAMES.length }, ...Array.from(counter.values())]
  }

  const getCatalog = (activeCategory: string): DataStoreCatalog => ({
    games: STORE_GAMES,
    categories: getCategories(),
    activeCategory,
  })

  const updateCatalog = (activeCategory: string) =>
    set({
      storeCatalog: {
        status: 'success',
        statusTitle: '',
        statusSubtitle: '',
        data: getCatalog(activeCategory),
      },
    })

  return {
    // Katalog statis, jadi langsung terisi supaya kartu game ikut ter-render di HTML server.
    storeCatalog: {
      status: 'success',
      statusTitle: '',
      statusSubtitle: '',
      data: getCatalog('all'),
    },

    setStoreCategory: (categoryId) => {
      const data = get().storeCatalog.data
      if (!data) return
      updateCatalog(categoryId)
    },

    setStoreReset: () => updateCatalog('all'),
  }
})
