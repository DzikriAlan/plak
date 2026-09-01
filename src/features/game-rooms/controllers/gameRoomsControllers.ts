import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useGameRoomsStates } from '../states/gameRoomsStates'
import {
  getGameRooms,
  getGameRoomsStream,
  postGameRooms,
  postGameRoomsJoin,
  postGameRoomsMove,
  postGameRoomsLeave,
  postGameRoomsSeats,
  postGameRoomsStart,
} from '../services/gameRoomsServices'
import type {
  PayloadPostGameRooms,
  PayloadPostGameRoomsJoin,
  PayloadPostGameRoomsMove,
  PayloadPostGameRoomsLeave,
  PayloadPostGameRoomsSeats,
  PayloadPostGameRoomsStart,
} from '../types/gameRoomsTypes'

const POLL_WAITING = 400
const POLL_OWN_TURN = 1200
const POLL_LOBBY = 700
const POLL_FINISHED = 4000
// Aliran bisa saja tersambung tetapi tidak mengirim apa pun, misalnya ketika aplikasi berjalan di
// banyak instans, jadi penarikan cadangan hanya dilonggarkan selama pesan aliran memang berdatangan.
const POLL_STREAMING = 1500
const STREAM_SILENCE = 2500

export const useGameRoomsControllers = () => {
  const queryClient = useQueryClient()
  const streamRef = useRef<EventSource | null>(null)
  const streamAtRef = useRef(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const {
    gameRooms,
    payloadGetGameRooms,
    setGameRooms,
    setGameRoomsJoin,
    setGameRoomsMove,
    setGameRoomsLeave,
    setGameRoomsSeats,
    setGameRoomsStart,
    setGetGameRooms,
  } = useGameRoomsStates()

  // Penarikan dipercepat saat menunggu lawan dan dilonggarkan saat giliran sendiri.
  const getPollInterval = () => {
    const room = gameRooms.data
    const isStreamAlive = isStreaming && Date.now() - streamAtRef.current < STREAM_SILENCE
    if (isStreamAlive) return POLL_STREAMING
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

  const storeGameRoomsSeats = useMutation({
    mutationFn: (payload: PayloadPostGameRoomsSeats) => postGameRoomsSeats(payload),
    onMutate: () => {
      setGameRoomsSeats({ status: 'loading' })
    },
    onSuccess: (data) => {
      setGameRoomsSeats({ status: data ? 'success' : 'empty', data: data ?? null })
      setGameRooms({ status: 'success', data: data ?? null })
      queryClient.invalidateQueries({ queryKey: ['gameRooms'] })
    },
    onError: () => {
      setGameRoomsSeats({ status: 'error' })
    },
  })

  const storeGameRoomsLeave = useMutation({
    mutationFn: (payload: PayloadPostGameRoomsLeave) => postGameRoomsLeave(payload),
    onMutate: () => {
      setGameRoomsLeave({ status: 'loading' })
    },
    onSuccess: (data) => {
      setGameRoomsLeave({ status: data ? 'success' : 'empty', data: data ?? null })
      setGameRooms({ status: 'success', data: data ?? null })
      queryClient.invalidateQueries({ queryKey: ['gameRooms'] })
    },
    onError: () => {
      setGameRoomsLeave({ status: 'error' })
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

  // Langganan hanya dibuat ulang saat kode atau kursinya benar-benar berubah, bukan tiap render.
  const streamCode = payloadGetGameRooms.code
  const streamToken = payloadGetGameRooms.token

  useEffect(() => {
    // Aliran baru dibuka setelah kursi diketahui supaya tampilan tidak tertimpa data penonton.
    if (!streamCode || !streamToken) return

    const getStreamedRoom = (event: MessageEvent<string>) => {
      try {
        return JSON.parse(event.data)
      } catch {
        return null
      }
    }

    const stream = getGameRoomsStream({ code: streamCode, token: streamToken })
    if (!stream) return

    streamRef.current = stream
    stream.onopen = () => {
      streamAtRef.current = Date.now()
      setIsStreaming(true)
    }
    stream.onmessage = (event) => {
      const data = getStreamedRoom(event)
      if (!data) return
      streamAtRef.current = Date.now()
      setGameRooms({ status: 'success', data })
    }
    stream.onerror = () => setIsStreaming(false)

    return () => {
      stream.close()
      streamRef.current = null
      setIsStreaming(false)
    }
  }, [streamCode, streamToken, setGameRooms])
  useEffect(() => {
    if (fetchGameRooms.isPending) return
    if (fetchGameRooms.isError) {
      setGameRooms({ status: 'error' })
      return
    }
    const data = fetchGameRooms.data ?? null
    setGameRooms({ status: data ? 'success' : 'empty', data })
  }, [fetchGameRooms.data, fetchGameRooms.isError, fetchGameRooms.isPending, setGameRooms])

  return {
    fetchGameRooms,
    storeGameRooms,
    storeGameRoomsJoin,
    storeGameRoomsStart,
    storeGameRoomsMove,
    storeGameRoomsLeave,
    storeGameRoomsSeats,
  }
}
