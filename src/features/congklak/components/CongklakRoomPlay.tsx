'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CongklakHole } from '../types/congklakTypes'
import { useGameRoomsStates } from '@/features/game-rooms/states/gameRoomsStates'
import { useGameRoomsControllers } from '@/features/game-rooms/controllers/gameRoomsControllers'
import GameRoomsInvite from '@/features/game-rooms/components/GameRoomsInvite'
import CongklakHeader from './CongklakHeader'
import CongklakBoard from './CongklakBoard'
import CongklakResult from './CongklakResult'

const HOLE_TOTAL = 7
const HOST_STORE = 7
const GUEST_STORE = 15

interface Props {
  code: string
}

export default function CongklakRoomPlay({ code }: Props) {
  const { gameRooms, setGetGameRooms } = useGameRoomsStates()
  const { storeGameRoomsJoin, storeGameRoomsMove } = useGameRoomsControllers()
  const [filters, setFilters] = useState({
    isSoundOn: true,
    isCopied: false,
    inviteUrl: '',
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const room = gameRooms.data
    const board = room?.board ?? []
    const seat = room?.seat ?? ''
    const isHostSeat = seat !== 'p2'

    const getHole = (index: number, isOwn: boolean, isPlayable: boolean): CongklakHole => ({
      index,
      seedTotal: board[index] ?? 0,
      side: isOwn ? 'player' : 'bot',
      isStore: index === HOST_STORE || index === GUEST_STORE,
      isPlayable,
      isActive: false,
    })
    const getSideHoles = (start: number, isOwn: boolean, isTurn: boolean) =>
      Array.from({ length: HOLE_TOTAL }, (_, step) =>
        getHole(start + step, isOwn, isOwn && isTurn && (board[start + step] ?? 0) > 0),
      )

    const isPlaying = room?.status === 'playing'
    const isMyTurn = isPlaying && !!seat && room?.turn === seat
    const ownStart = isHostSeat ? 0 : HOST_STORE + 1
    const rivalStart = isHostSeat ? HOST_STORE + 1 : 0
    const ownStoreIndex = isHostSeat ? HOST_STORE : GUEST_STORE
    const rivalStoreIndex = isHostSeat ? GUEST_STORE : HOST_STORE
    const ownScore = board[ownStoreIndex] ?? 0
    const rivalScore = board[rivalStoreIndex] ?? 0

    const getResultLabel = (winner: string) => {
      if (!winner) return ''
      if (winner === 'draw') return 'Seri'
      return winner === seat ? 'Kamu menang' : 'Lawan menang'
    }

    return {
      data: board,
      isLoading: gameRooms.status === 'loading' && !room,
      isError: gameRooms.status === 'error',
      isEmpty: gameRooms.status === 'empty',
      emptyTitle: 'Ruangan tidak ditemukan',
      emptySubtitle: 'Periksa kembali tautan undangan yang kamu terima.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: board.length, totalItem: board.length },
      playerHoles: getSideHoles(ownStart, true, isMyTurn),
      botHoles: getSideHoles(rivalStart, false, false),
      playerStore: getHole(ownStoreIndex, true, false),
      botStore: getHole(rivalStoreIndex, false, false),
      turn: isMyTurn ? 'player' : 'bot',
      seat,
      code,
      inviteUrl: filters.inviteUrl,
      isCopied: filters.isCopied,
      playerTotal: room?.playerTotal ?? 0,
      seatTotal: room?.seatTotal ?? 2,
      isLobbyOpen: !!room && room.status === 'lobby',
      isSeatMissing: !!room && !seat,
      scoreLabel: `${ownScore} : ${rivalScore}`,
      ownScore,
      rivalScore,
      moveTotal: room?.moveTotal ?? 0,
      isFinished: room?.status === 'finished',
      resultLabel: getResultLabel(room?.winner ?? ''),
      isSoundOn: filters.isSoundOn,
    }
  }, [gameRooms, filters, code])
  const submitCongklakHole = (holeIndex: number) => {
    const room = gameRooms.data
    if (!room || room.turn !== room.seat) return
    storeGameRoomsMove.mutate({ code, token: room.token, holeIndex })
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
  const editCongklakSound = () => {
    setFilters((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }))
  }
  const clearCongklakRoom = () => {
    window.location.href = '/congklak'
  }

  useEffect(() => {
    // Kursi disimpan per ruangan supaya pemain tetap di kursinya saat halaman dimuat ulang.
    const getStoredToken = () => {
      try {
        return window.localStorage.getItem(`game-room-${code}`) ?? ''
      } catch {
        return ''
      }
    }

    const token = getStoredToken()
    setFilters((prev) => ({ ...prev, inviteUrl: `${window.location.origin}/congklak/${code}` }))
    setGetGameRooms({ code, token })
    storeGameRoomsJoin.mutate({ code, token, name: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, setGetGameRooms])
  useEffect(() => {
    const token = gameRooms.data?.token
    if (!token) return
    try {
      window.localStorage.setItem(`game-room-${code}`, token)
    } catch {
      return
    }
  }, [gameRooms.data?.token, code])

  return (
    <div className="flex h-[100dvh] w-full touch-none items-stretch justify-center overflow-hidden overscroll-none bg-[#0a0a0b] p-2 sm:p-4">
      <div className="flex h-full w-full max-w-[480px] flex-col gap-3">
        <CongklakHeader isSoundOn={data.isSoundOn} onEditCongklakSound={editCongklakSound} />

        <main className="flex min-h-0 flex-1 items-stretch justify-center">
          {data.isLoading ? (
            <p className="self-center text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">
              Menyiapkan ruangan…
            </p>
          ) : (
            <CongklakBoard
              playerHoles={data.playerHoles}
              botHoles={data.botHoles}
              playerStore={data.playerStore}
              botStore={data.botStore}
              turn={data.turn}
              playerLabel="Rumah Kamu"
              botLabel="Rumah Lawan"
              onSubmitCongklakHole={submitCongklakHole}
            />
          )}
        </main>

        <footer className="grid shrink-0 grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Langkah</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.moveTotal}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Skor</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.scoreLabel}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Ruangan</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.code}</span>
          </div>
        </footer>
      </div>

      {data.isLobbyOpen ? (
        <GameRoomsInvite
          code={data.code}
          inviteUrl={data.inviteUrl}
          playerTotal={data.playerTotal}
          seatTotal={data.seatTotal}
          isCopied={data.isCopied}
          onSubmitGameRoomsInvite={submitGameRoomsInvite}
        />
      ) : null}

      {data.isFinished ? (
        <CongklakResult
          resultLabel={data.resultLabel}
          playerScore={data.ownScore}
          botScore={data.rivalScore}
          moveTotal={data.moveTotal}
          onClearCongklakGame={clearCongklakRoom}
        />
      ) : null}
    </div>
  )
}
