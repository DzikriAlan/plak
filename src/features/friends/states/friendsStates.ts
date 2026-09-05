import { create } from 'zustand'
import type { Friends, FriendsRequests, PayloadPostFriendsRequests } from '../types/friendsTypes'

interface FriendsStore {
  payloadPostFriendsRequests: PayloadPostFriendsRequests
  friends: Friends
  friendsRequests: FriendsRequests
  setPostFriendsRequests: (payload: Partial<PayloadPostFriendsRequests>) => void
  setFriends: (state: Partial<Friends>) => void
  setFriendsRequests: (state: Partial<FriendsRequests>) => void
}

const emptyState = {
  status: 'loading',
  statusTitle: 'Something went wrong',
  statusSubtitle: 'Please try again later.',
  data: null,
}

export const useFriendsStates = create<FriendsStore>((set) => ({
  payloadPostFriendsRequests: { addresseeId: '' },
  friends: { ...emptyState },
  friendsRequests: { ...emptyState },

  setPostFriendsRequests: (payload) =>
    set((state) => ({ payloadPostFriendsRequests: { ...state.payloadPostFriendsRequests, ...payload } })),

  setFriends: (next) => set((state) => ({ friends: { ...state.friends, ...next } })),

  setFriendsRequests: (next) => set((state) => ({ friendsRequests: { ...state.friendsRequests, ...next } })),
}))
