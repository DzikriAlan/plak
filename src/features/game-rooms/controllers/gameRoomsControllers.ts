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
      // Papan ramalan yang terlanjur dipasang harus dibatalkan, jadi keadaan ruangan ditarik ulang
      // supaya pemain tidak terlihat sudah jalan padahal langkahnya ditolak server.
      streamAtRef.current = 0
      queryClient.invalidateQueries({ queryKey: ['gameRooms'] })
    },
  })

  // Langganan hanya dibuat ulang saat kode atau kursinya benar-benar berubah, bukan tiap render.
  const streamCode = payloadGetGameRooms.code
  const streamToken = payloadGetGameRooms.token

  useEffect(() => {
    // Aliran baru dibuka setelah kursi diketahui supaya tampilan tidak tertimpa data penonton.
    if (!streamCode || !streamToken) return

    // Pesan aliran memakai selubung yang sama dengan balasan REST, jadi isinya dibuka lebih dulu.
    const getStreamedRoom = (event: MessageEvent<string>) => {
      try {
        const body = JSON.parse(event.data)
        return body?.success ? body.data : null
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
    stream.onerror = () => {
      // Aliran yang putus tidak boleh lagi menahan hasil penarikan, jadi penanda kabarnya dinolkan.
      streamAtRef.current = 0
      setIsStreaming(false)
    }

    return () => {
      stream.close()
      streamRef.current = null
      streamAtRef.current = 0
      setIsStreaming(false)
    }
  }, [streamCode, streamToken, setGameRooms])
  useEffect(() => {
    if (fetchGameRooms.isPending) return
    if (fetchGameRooms.isError) {
      setGameRooms({ status: 'error' })
      return
    }
    // Selama aliran masih mengirim kabar, hasil penarikan diabaikan karena bisa saja sudah basi
    // dan membuat tampilan seperti jumlah pemain berpindah-pindah sendiri.
    if (Date.now() - streamAtRef.current < STREAM_SILENCE) return

    const data = fetchGameRooms.data ?? null
    setGameRooms({ status: data ? 'success' : 'empty', data })
    // Waktu penarikan ikut disimak supaya hasil yang isinya sama tetap diperiksa ulang; tanpa itu
    // hasil yang sempat dilewati saat aliran ramai tidak pernah dipakai lagi dan tampilan membeku.
  }, [
    fetchGameRooms.data,
    fetchGameRooms.dataUpdatedAt,
    fetchGameRooms.isError,
    fetchGameRooms.isPending,
    setGameRooms,
  ])

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
