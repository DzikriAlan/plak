'use client'

import { useEffect, useMemo, useState } from 'react'
import type { UnoCard, UnoColor } from '../types/unoTypes'
import { useGameRoomsStates } from '@/features/game-rooms/states/gameRoomsStates'
import { useGameRoomsControllers } from '@/features/game-rooms/controllers/gameRoomsControllers'
import GameRoomsInvite from '@/features/game-rooms/components/GameRoomsInvite'
import GameTurnStatus from '@/shared/components/reusable/GameTurnStatus'
import GameExitConfirm from '@/shared/components/reusable/GameExitConfirm'
import UnoHeader from './UnoHeader'
import UnoBoard from './UnoBoard'
import UnoHand from './UnoHand'

const OPPONENT_TONE = ['bg-[#ffd23f]', 'bg-[#7c3aed]', 'bg-[#23a94a]']
const COLOR_CHOICES: Array<{ color: UnoColor; label: string; tone: string }> = [
  { color: 'red', label: 'Merah', tone: 'bg-[#e8202a]' },
  { color: 'yellow', label: 'Kuning', tone: 'bg-[#f7c600]' },
  { color: 'green', label: 'Hijau', tone: 'bg-[#23a94a]' },
  { color: 'blue', label: 'Biru', tone: 'bg-[#2f5ce0]' },
]

interface Props {
  code: string
}

export default function UnoRoomPlay({ code }: Props) {
  const { gameRooms, setGameRooms, setGetGameRooms } = useGameRoomsStates()
  const { storeGameRoomsJoin, storeGameRoomsStart, storeGameRoomsMove, storeGameRoomsLeave } = useGameRoomsControllers()
  const [filters, setFilters] = useState({
    isExitOpen: false,
    pendingWildCardId: '',
    isCopied: false,
    isSoundOn: true,
    inviteUrl: '',
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const room = gameRooms.data
    const uno = room?.uno ?? null
    const seat = room?.seat ?? ''
    const hand = (uno?.hand ?? []) as UnoCard[]

    const getSeatLabel = (value: string) => `Pemain ${value.replace('p', '')}`
    const getOpponents = () =>
      (uno?.opponents ?? []).map((opponent, index) => ({
        id: index,
        name: getSeatLabel(opponent.seat),
        cardTotal: opponent.cardTotal,
        tone: OPPONENT_TONE[index % OPPONENT_TONE.length],
        isActive: room?.turn === opponent.seat,
      }))
    const getResultLabel = (winner: string) => {
      if (room?.leftSeat && room.leftSeat !== seat) return 'Lawan keluar, permainan diakhiri'
      if (room?.leftSeat && room.leftSeat === seat) return 'Kamu keluar dari permainan'
      if (!winner) return ''
      return winner === seat ? 'Kamu menang!' : `${getSeatLabel(winner)} menang`
    }

    const isPlaying = room?.status === 'playing'
    const isMyTurn = isPlaying && !!seat && room?.turn === seat
    const isHost = !!seat && seat === room?.hostSeat

    return {
      isExitOpen: filters.isExitOpen,
      data: hand.map((card) => ({ card })),
      isLoading: gameRooms.status === 'loading' && !room,
      isError: gameRooms.status === 'error',
      isEmpty: gameRooms.status === 'empty',
      emptyTitle: 'Ruangan tidak ditemukan',
      emptySubtitle: 'Periksa kembali tautan undangan yang kamu terima.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: hand.length, totalItem: hand.length },
      code,
      seat,
      seatLabel: seat ? getSeatLabel(seat) : 'Penonton',
      turnLabel: isMyTurn ? 'Giliranmu' : 'Giliran lawan',
      // Penanda besar dipakai supaya pemain tahu kenapa kartu belum bisa dibuang.
      statusLabel: isMyTurn ? 'Giliranmu, buang kartu' : 'Menunggu langkah lawan',
      isWaiting: isPlaying && !isMyTurn,
      opponents: getOpponents(),
      topCard: (uno?.topCard ?? null) as UnoCard | null,
      activeColor: (uno?.activeColor ?? 'red') as UnoColor,
      lastAction: uno?.lastAction ?? '',
      drawTotal: uno?.drawTotal ?? 0,
      cardTotal: hand.length,
      hasCalledUno: uno?.hasCalledUno ?? false,
      isDrawDisabled: !isMyTurn || !!uno?.hasDrawnThisTurn || storeGameRoomsMove.isPending,
      isPassVisible: isMyTurn && !!uno?.hasDrawnThisTurn,
      isUnoVisible: isPlaying && hand.length === 2,
      isColorPickerOpen: !!filters.pendingWildCardId,
      isLobbyOpen: !!room && room.status === 'lobby',
      isStartVisible: isHost,
      isStartDisabled: (room?.playerTotal ?? 0) < 2 || storeGameRoomsStart.isPending,
      playerTotal: room?.playerTotal ?? 0,
      seatTotal: room?.seatTotal ?? 4,
      inviteUrl: filters.inviteUrl,
      isCopied: filters.isCopied,
      isSoundOn: filters.isSoundOn,
      isFinished: room?.status === 'finished',
      leftSeat: room?.leftSeat ?? '',
      isLeftByRival: !!room?.leftSeat && room.leftSeat !== seat,
      resultLabel: getResultLabel(room?.winner ?? ''),
      isMyTurn,
    }
  }, [gameRooms, filters, code, storeGameRoomsMove.isPending, storeGameRoomsStart.isPending])
  const submitUnoCard = (cardId: string) => {
    const room = gameRooms.data
    if (!room || !data.isMyTurn) return

    const getCard = (id: string) => (room.uno?.hand ?? []).find((item) => item.id === id)
    const card = getCard(cardId)
    if (!card) return

    if (card.value === 'wild' || card.value === 'wild4') {
      setFilters((prev) => ({ ...prev, pendingWildCardId: cardId }))
      return
    }
    const getPredictedRoom = () => ({
      ...room,
      uno: room.uno ? { ...room.uno, hand: room.uno.hand.filter((item) => item.id !== cardId) } : room.uno,
    })

    setGameRooms({ status: 'success', data: getPredictedRoom() })
    storeGameRoomsMove.mutate({ code, token: room.token, action: 'play', cardId })
  }
  const submitUnoColor = (color: UnoColor) => {
    const room = gameRooms.data
    if (!room || !filters.pendingWildCardId) return
    storeGameRoomsMove.mutate({
      code,
      token: room.token,
      action: 'play',
      cardId: filters.pendingWildCardId,
      color,
    })
    setFilters((prev) => ({ ...prev, pendingWildCardId: '' }))
  }
  const submitUnoCall = () => {
    const room = gameRooms.data
    if (!room) return
    storeGameRoomsMove.mutate({ code, token: room.token, action: 'uno' })
  }
  const loadUnoDraw = () => {
    const room = gameRooms.data
    if (!room || data.isDrawDisabled) return
    storeGameRoomsMove.mutate({ code, token: room.token, action: 'draw' })
  }
  const loadUnoPass = () => {
    const room = gameRooms.data
    if (!room) return
    storeGameRoomsMove.mutate({ code, token: room.token, action: 'pass' })
  }
  const submitGameRoomsStart = () => {
    const room = gameRooms.data
    if (!room) return
    storeGameRoomsStart.mutate({ code, token: room.token })
  }
  const submitGameRoomsInvite = () => {
    const loadCopiedInvite = async () => {
      try {
        await navigator.clipboard.writeText(filters.inviteUrl)
        setFilters((prev) => ({ ...prev, isCopied: true }))
      } catch {
        setFilters((prev) => ({ ...prev, isCopied: false }))
      }
    }
    loadCopiedInvite()
  }
  const editUnoSound = () => {
    setFilters((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }))
  }
  const clearUnoRoom = () => {
    window.location.href = '/uno'
  }

  const loadUnoExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: true }))
  }
  const clearUnoExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: false }))
  }
  const submitUnoExit = () => {
    // Keluar mengakhiri sesi untuk kedua pemain, jadi server dikabari lebih dulu.
    const room = gameRooms.data
    if (room?.token) storeGameRoomsLeave.mutate({ code, token: room.token })
    window.location.href = '/uno'
  }
  useEffect(() => {
    // Kursi disimpan per tab supaya dua tab di peramban yang sama tetap dapat kursi berbeda.
    const getStoredToken = () => {
      try {
        return window.sessionStorage.getItem(`game-room-${code}`) ?? ''
      } catch {
        return ''
      }
    }

    const token = getStoredToken()
    setFilters((prev) => ({ ...prev, inviteUrl: `${window.location.origin}/uno/${code}` }))
    setGetGameRooms({ code, token })
    storeGameRoomsJoin.mutate({ code, token, name: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, setGetGameRooms])
  useEffect(() => {
    const token = gameRooms.data?.token
    if (!token) return
    try {
      window.sessionStorage.setItem(`game-room-${code}`, token)
    } catch {
      return
    }
  }, [gameRooms.data?.token, code])

  return (
    <div className="flex h-[100dvh] w-full items-stretch justify-center overflow-hidden bg-[#0a0a0b] p-2 sm:p-4">
      <div className="flex h-full w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border border-[#26262b] bg-[#0f0f11]">
        <UnoHeader
          onLoadUnoExit={loadUnoExit}
          roomCode={data.code}
          turnName={data.turnLabel}
          isCopied={data.isCopied}
          isSoundOn={data.isSoundOn}
          onLoadUnoRoomCode={submitGameRoomsInvite}
          onEditUnoSound={editUnoSound}
        />

        <GameTurnStatus label={data.statusLabel} isWaiting={data.isWaiting} className="mx-3 mt-2" />

        {data.isLoading ? (
          <div className="flex flex-1 items-center justify-center text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">
            Menyiapkan meja…
          </div>
        ) : (
          <UnoBoard
            opponents={data.opponents}
            topCard={data.topCard}
            activeColor={data.activeColor}
            lastAction={data.lastAction}
            drawTotal={data.drawTotal}
            isDrawDisabled={data.isDrawDisabled}
            onLoadUnoDraw={loadUnoDraw}
          />
        )}

        <UnoHand
          cards={data.data}
          cardTotal={data.cardTotal}
          isDrawDisabled={data.isDrawDisabled}
          isPassVisible={data.isPassVisible}
          isUnoVisible={data.isUnoVisible}
          hasCalledUno={data.hasCalledUno}
          onSubmitUnoCard={submitUnoCard}
          onLoadUnoDraw={loadUnoDraw}
          onLoadUnoPass={loadUnoPass}
          onSubmitUnoCall={submitUnoCall}
        />
      </div>

      {data.isLobbyOpen ? (
        <GameRoomsInvite
          code={data.code}
          inviteUrl={data.inviteUrl}
          playerTotal={data.playerTotal}
          seatTotal={data.seatTotal}
          isCopied={data.isCopied}
          isStartVisible={data.isStartVisible}
          isStartDisabled={data.isStartDisabled}
          onSubmitGameRoomsInvite={submitGameRoomsInvite}
          onSubmitGameRoomsStart={submitGameRoomsStart}
        />
      ) : null}

      {data.isColorPickerOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-xl border border-[#26262b] bg-[#121214] p-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Pilih warna</p>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {COLOR_CHOICES.map((choice) => (
                <button
                  key={choice.color}
                  type="button"
                  aria-label={choice.label}
                  onClick={() => submitUnoColor(choice.color)}
                  className={`h-12 rounded-xl transition-opacity active:opacity-80 ${choice.tone}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {data.isFinished ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Permainan selesai</p>
            <p className="mt-2 text-2xl font-black uppercase leading-none text-[#f2ede1]">{data.resultLabel}</p>
            <button
              type="button"
              onClick={clearUnoRoom}
              className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
            >
              Kembali
            </button>
          </div>
        </div>
      ) : null}
      {data.isExitOpen ? (
        <GameExitConfirm
          title="Keluar dari permainan?"
          subtitle="Sesi ini akan diakhiri untuk kamu dan lawanmu."
          cancelLabel="Batal"
          confirmLabel="Keluar"
          isConfirmLoading={storeGameRoomsLeave.isPending}
          onClearGameExit={clearUnoExit}
          onSubmitGameExit={submitUnoExit}
        />
      ) : null}

    </div>
  )
}
