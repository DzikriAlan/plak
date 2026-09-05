import { create } from 'zustand'
import type { Presence } from '../types/presenceTypes'

interface PresenceStore {
  presence: Presence
  setPresence: (state: Partial<Presence>) => void
}

export const usePresenceStates = create<PresenceStore>((set) => ({
  presence: {
    status: 'loading',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: null,
  },

  setPresence: (next) => set((state) => ({ presence: { ...state.presence, ...next } })),
}))
