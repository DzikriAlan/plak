export type StoreMode = 'solo' | 'bot' | 'online'

export type StoreGame = {
  id: string
  name: string
  category: string
  categoryLabel: string
  durationValue: string
  playerValue: string
  path: string
  tone: string
  accent: string
  mode: StoreMode
  modeLabel: string
  isAvailable: boolean
}

export type StoreCategory = {
  id: string
  label: string
  total: number
}

export interface DataStoreCatalog {
  games: StoreGame[]
  categories: StoreCategory[]
  activeCategory: string
  historyIds: string[]
}

export interface StoreCatalog {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataStoreCatalog | null
}
