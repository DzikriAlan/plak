import { create } from 'zustand'
import type { GameInvites } from '../types/gameInvitesTypes'

interface GameInvitesStore {
  gameInvites: GameInvites
  setGameInvites: (state: Partial<GameInvites>) => void
}

export const useGameInvitesStates = create<GameInvitesStore>((set) => ({
  gameInvites: {
    status: 'loading',
    statusTitle: 'Something went wrong',
    statusSubtitle: 'Please try again later.',
    data: null,
  },

  setGameInvites: (next) => set((state) => ({ gameInvites: { ...state.gameInvites, ...next } })),
}))
