import { create } from 'zustand'
import id from '../locales/id.json'
import en from '../locales/en.json'

export type LocaleCode = 'id' | 'en'

export type LocaleText = typeof id.waitplay

interface LocaleStore {
  activeLocale: LocaleCode
  text: LocaleText
  setLocaleInit: () => void
  setLocale: (locale: LocaleCode) => void
}

const STORAGE_KEY = 'waitplay-locale'
const DICTIONARY: Record<LocaleCode, LocaleText> = { id: id.waitplay, en: en.waitplay as LocaleText }

export const useLocaleStates = create<LocaleStore>((set) => {
  // Bahasa Indonesia jadi bawaan, pilihan pemain baru dibaca setelah halaman terpasang.
  const getStoredLocale = (): LocaleCode => {
    if (typeof window === 'undefined') return 'id'
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw === 'en' ? 'en' : 'id'
    } catch {
      return 'id'
    }
  }

  const updateStoredLocale = (locale: LocaleCode) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      return
    }
  }

  return {
    activeLocale: 'id',
    text: DICTIONARY.id,

    setLocaleInit: () => {
      const locale = getStoredLocale()
      set({ activeLocale: locale, text: DICTIONARY[locale] })
    },

    setLocale: (locale) => {
      updateStoredLocale(locale)
      set({ activeLocale: locale, text: DICTIONARY[locale] })
    },
  }
})
