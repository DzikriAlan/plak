import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useGameRoomsStates } from '../states/gameRoomsStates'
import {
  getGameRooms,
  postGameRooms,
  postGameRoomsJoin,
  postGameRoomsMove,
  postGameRoomsStart,
} from '../services/gameRoomsServices'
import type {
  PayloadPostGameRooms,
  PayloadPostGameRoomsJoin,
  PayloadPostGameRoomsMove,
  PayloadPostGameRoomsStart,
} from '../types/gameRoomsTypes'

const POLL_WAITING = 400
const POLL_OWN_TURN = 1200
const POLL_LOBBY = 700
const POLL_FINISHED = 4000

export const useGameRoomsControllers = () => {
  const queryClient = useQueryClient()
  const {
    gameRooms,
    payloadGetGameRooms,
    setGameRooms,
    setGameRoomsJoin,
    setGameRoomsMove,
    setGameRoomsStart,
    setGetGameRooms,
  } = useGameRoomsStates()

  // Penarikan dipercepat saat menunggu lawan dan dilonggarkan saat giliran sendiri.
  const getPollInterval = () => {
    const room = gameRooms.data
    if (!room) return POLL_LOBBY
    if (room.status === 'finished') return POLL_FINISHED
    if (room.status === 'lobby') return POLL_LOBBY
    return room.turn === room.seat ? POLL_OWN_TURN : POLL_WAITING
  }

  const fetchGameRooms = useQuery({
    queryKey: ['gameRooms', payloadGetGameRooms],
    queryFn: () => getGameRooms(payloadGetGameRooms),
    enabled: !!payloadGetGameRooms.code,
    refetchInterval: getPollInterval(),
    refetchIntervalInBackground: true,
  })

  const storeGameRooms = useMutation({
    mutationFn: (payload: PayloadPostGameRooms) => postGameRooms(payload),
    onMutate: () => {
      setGameRooms({ status: 'loading' })
    },
    onSuccess: (data) => {
      setGameRooms({ status: data ? 'success' : 'empty', data: data ?? null })
      setGetGameRooms({ code: data?.code ?? '', token: data?.token ?? '' })
      queryClient.invalidateQueries({ queryKey: ['gameRooms'] })
    },
    onError: () => {
      setGameRooms({ status: 'error' })
    },
  })

  const storeGameRoomsJoin = useMutation({
    mutationFn: (payload: PayloadPostGameRoomsJoin) => postGameRoomsJoin(payload),
    onMutate: () => {
      setGameRoomsJoin({ status: 'loading' })
    },
    onSuccess: (data) => {
      setGameRoomsJoin({ status: data ? 'success' : 'empty', data: data ?? null })
      setGetGameRooms({ code: data?.code ?? '', token: data?.token ?? '' })
      queryClient.invalidateQueries({ queryKey: ['gameRooms'] })
    },
    onError: () => {
      setGameRoomsJoin({ status: 'error' })
    },
  })

  const storeGameRoomsStart = useMutation({
    mutationFn: (payload: PayloadPostGameRoomsStart) => postGameRoomsStart(payload),
    onMutate: () => {
      setGameRoomsStart({ status: 'loading' })
    },
    onSuccess: (data) => {
      setGameRoomsStart({ status: data ? 'success' : 'empty', data: data ?? null })
      setGameRooms({ status: 'success', data: data ?? null })
      queryClient.invalidateQueries({ queryKey: ['gameRooms'] })
    },
    onError: () => {
      setGameRoomsStart({ status: 'error' })
    },
  })

  const storeGameRoomsMove = useMutation({
    mutationFn: (payload: PayloadPostGameRoomsMove) => postGameRoomsMove(payload),
    onMutate: () => {
      setGameRoomsMove({ status: 'loading' })
    },
    onSuccess: (data) => {
      setGameRoomsMove({ status: data ? 'success' : 'empty', data: data ?? null })
      setGameRooms({ status: 'success', data: data ?? null })
      queryClient.invalidateQueries({ queryKey: ['gameRooms'] })
    },
    onError: () => {
      setGameRoomsMove({ status: 'error' })
    },
  })

  useEffect(() => {
    if (fetchGameRooms.isPending) return
    if (fetchGameRooms.isError) {
      setGameRooms({ status: 'error' })
      return
    }
    const data = fetchGameRooms.data ?? null
    setGameRooms({ status: data ? 'success' : 'empty', data })
  }, [fetchGameRooms.data, fetchGameRooms.isError, fetchGameRooms.isPending, setGameRooms])

  return { fetchGameRooms, storeGameRooms, storeGameRoomsJoin, storeGameRoomsStart, storeGameRoomsMove }
}
