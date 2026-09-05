import { create } from 'zustand'
import type { PayloadGetUsersSearch, UsersMe, UsersSearch } from '../types/usersTypes'

interface UsersStore {
  payloadGetUsersSearch: PayloadGetUsersSearch
  usersMe: UsersMe
  usersSearch: UsersSearch
  setGetUsersSearch: (payload: Partial<PayloadGetUsersSearch>) => void
  setUsersMe: (state: Partial<UsersMe>) => void
  setUsersSearch: (state: Partial<UsersSearch>) => void
}

const emptyState = {
  status: 'loading',
  statusTitle: 'Something went wrong',
  statusSubtitle: 'Please try again later.',
  data: null,
}

export const useUsersStates = create<UsersStore>((set) => ({
  payloadGetUsersSearch: { email: '' },
  usersMe: { ...emptyState },
  usersSearch: { ...emptyState },

  setGetUsersSearch: (payload) =>
    set((state) => ({ payloadGetUsersSearch: { ...state.payloadGetUsersSearch, ...payload } })),

  setUsersMe: (next) => set((state) => ({ usersMe: { ...state.usersMe, ...next } })),

  setUsersSearch: (next) => set((state) => ({ usersSearch: { ...state.usersSearch, ...next } })),
}))
