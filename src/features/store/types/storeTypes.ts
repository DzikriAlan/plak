export type StoreMode = 'solo' | 'bot' | 'online'

export type StoreGame = {
  id: string
  name: string
  tagline: string
  description: string
  category: string
  categoryLabel: string
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
}

export interface StoreCatalog {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataStoreCatalog | null
}
