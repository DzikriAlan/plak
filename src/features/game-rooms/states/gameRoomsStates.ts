import { create } from 'zustand'
import type {
  DataGameRooms,
  GameRooms,
  GameRoomsJoin,
  GameRoomsMove,
  GameRoomsStart,
  PayloadGetGameRooms,
  PayloadPostGameRooms,
  PayloadPostGameRoomsJoin,
  PayloadPostGameRoomsMove,
  PayloadPostGameRoomsStart,
} from '../types/gameRoomsTypes'

interface GameRoomsStore {
  payloadPostGameRooms: PayloadPostGameRooms
  payloadGetGameRooms: PayloadGetGameRooms
  payloadPostGameRoomsJoin: PayloadPostGameRoomsJoin
  payloadPostGameRoomsStart: PayloadPostGameRoomsStart
  payloadPostGameRoomsMove: PayloadPostGameRoomsMove
  gameRooms: GameRooms
  gameRoomsJoin: GameRoomsJoin
  gameRoomsStart: GameRoomsStart
  gameRoomsMove: GameRoomsMove
  setPostGameRooms: (payload: Partial<PayloadPostGameRooms>) => void
  setGetGameRooms: (payload: Partial<PayloadGetGameRooms>) => void
  setPostGameRoomsJoin: (payload: Partial<PayloadPostGameRoomsJoin>) => void
  setPostGameRoomsStart: (payload: Partial<PayloadPostGameRoomsStart>) => void
  setPostGameRoomsMove: (payload: Partial<PayloadPostGameRoomsMove>) => void
  setGameRooms: (state: Partial<GameRooms>) => void
  setGameRoomsJoin: (state: Partial<GameRoomsJoin>) => void
  setGameRoomsStart: (state: Partial<GameRoomsStart>) => void
  setGameRoomsMove: (state: Partial<GameRoomsMove>) => void
}

const emptyState = {
  status: 'loading',
  statusTitle: 'Something went wrong',
  statusSubtitle: 'Please try again later.',
  data: null as DataGameRooms | null,
}

export const useGameRoomsStates = create<GameRoomsStore>((set) => ({
  payloadPostGameRooms: { game: '', name: '' },
  payloadGetGameRooms: { code: '', token: '' },
  payloadPostGameRoomsJoin: { code: '', token: '', name: '' },
  payloadPostGameRoomsStart: { code: '', token: '' },
  payloadPostGameRoomsMove: { code: '', token: '' },

  gameRooms: { ...emptyState },
  gameRoomsJoin: { ...emptyState },
  gameRoomsStart: { ...emptyState },
  gameRoomsMove: { ...emptyState },

  setPostGameRooms: (payload) =>
    set((state) => ({ payloadPostGameRooms: { ...state.payloadPostGameRooms, ...payload } })),

  setGetGameRooms: (payload) =>
    set((state) => ({ payloadGetGameRooms: { ...state.payloadGetGameRooms, ...payload } })),

  setPostGameRoomsJoin: (payload) =>
    set((state) => ({ payloadPostGameRoomsJoin: { ...state.payloadPostGameRoomsJoin, ...payload } })),

  setPostGameRoomsStart: (payload) =>
    set((state) => ({ payloadPostGameRoomsStart: { ...state.payloadPostGameRoomsStart, ...payload } })),

  setPostGameRoomsMove: (payload) =>
    set((state) => ({ payloadPostGameRoomsMove: { ...state.payloadPostGameRoomsMove, ...payload } })),

  setGameRooms: (next) => set((state) => ({ gameRooms: { ...state.gameRooms, ...next } })),

  setGameRoomsJoin: (next) => set((state) => ({ gameRoomsJoin: { ...state.gameRoomsJoin, ...next } })),

  setGameRoomsStart: (next) => set((state) => ({ gameRoomsStart: { ...state.gameRoomsStart, ...next } })),

  setGameRoomsMove: (next) => set((state) => ({ gameRoomsMove: { ...state.gameRoomsMove, ...next } })),
}))
