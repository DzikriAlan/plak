'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CongklakHole } from '../types/congklakTypes'
import { getCongklakResolvedMove } from '@/shared/lib/congklakEngine'
import { useGameRoomsStates } from '@/features/game-rooms/states/gameRoomsStates'
import { useGameRoomsControllers } from '@/features/game-rooms/controllers/gameRoomsControllers'
import GameRoomsInvite from '@/features/game-rooms/components/GameRoomsInvite'
import GameTurnStatus from '@/shared/components/reusable/GameTurnStatus'
import GameExitConfirm from '@/shared/components/reusable/GameExitConfirm'
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
  const { storeGameRoomsJoin, storeGameRoomsMove, storeGameRoomsLeave } = useGameRoomsControllers()
  const [filters, setFilters] = useState({
    isExitOpen: false,
    isSoundOn: true,
    displayBoard: [] as number[],
    animatedMove: 0,
    isCopied: false,
    inviteUrl: '',
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const room = gameRooms.data
    // Papan yang dilihat pemain berasal dari tahapan animasi supaya biji terlihat ditaburkan.
    const board = filters.displayBoard.length ? filters.displayBoard : room?.board ?? []
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
      if (room?.leftSeat && room.leftSeat !== seat) return 'Lawan keluar, kamu menang'
      if (room?.leftSeat && room.leftSeat === seat) return 'Kamu keluar dari permainan'
      if (!winner) return ''
      if (winner === 'draw') return 'Seri'
      return winner === seat ? 'Kamu menang' : 'Lawan menang'
    }

    return {
      isExitOpen: filters.isExitOpen,
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
      // Penanda besar dipakai supaya pemain tahu kenapa lubang belum bisa disentuh.
      statusLabel: isMyTurn ? 'Giliranmu, pilih lubang' : 'Menunggu langkah lawan',
      isWaiting: isPlaying && !isMyTurn,
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
      leftSeat: room?.leftSeat ?? '',
      isLeftByRival: !!room?.leftSeat && room.leftSeat !== seat,
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
    window.location.href = data.isLeftByRival ? '/' : '/congklak'
  }

  const loadCongklakExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: true }))
  }
  const clearCongklakExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: false }))
  }
  const submitCongklakExit = () => {
    // Keluar mengakhiri sesi untuk kedua pemain, jadi server dikabari lebih dulu.
    const room = gameRooms.data
    if (room?.token) storeGameRoomsLeave.mutate({ code, token: room.token })
    window.location.href = '/'
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
    setFilters((prev) => ({ ...prev, inviteUrl: `${window.location.origin}/congklak/${code}` }))
    setGetGameRooms({ code, token })
    storeGameRoomsJoin.mutate({ code, token, name: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, setGetGameRooms])
  useEffect(() => {
    const room = gameRooms.data
    if (!room) return

    // Papan disamakan tanpa animasi saat pertama dibuka atau saat tidak ada langkah baru.
    const getIsSameBoard = (left: number[], right: number[]) =>
      left.length === right.length && left.every((seed, index) => seed === right[index])
    const previous = filters.displayBoard
    const isNewMove = room.moveTotal > filters.animatedMove && room.lastHole >= 0 && previous.length === room.board.length

    if (!isNewMove) {
      if (!getIsSameBoard(previous, room.board)) {
        setFilters((prev) => ({ ...prev, displayBoard: room.board, animatedMove: room.moveTotal }))
      }
      return
    }

    const side = room.lastSeat === 'p1' ? 'host' : 'guest'
    const resolved = getCongklakResolvedMove(previous, side, room.lastHole, 0)
    const frames = resolved.frames
    if (!getIsSameBoard(resolved.board, room.board)) {
      setFilters((prev) => ({ ...prev, displayBoard: room.board, animatedMove: room.moveTotal }))
      return
    }

    // Tempo menaburkan biji dijaga tetap terbaca, tetapi langkah panjang dipercepat.
    const stepDelay = Math.min(150, Math.max(60, Math.round(1400 / Math.max(frames.length, 1))))
    let step = 0
    const timer = window.setInterval(() => {
      step += 1
      if (step >= frames.length) {
        window.clearInterval(timer)
        setFilters((prev) => ({ ...prev, displayBoard: room.board, animatedMove: room.moveTotal }))
        return
      }
      setFilters((prev) => ({ ...prev, displayBoard: frames[step] }))
    }, stepDelay)

    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameRooms.data?.moveTotal, gameRooms.data?.board])
  useEffect(() => {
    // Sesi yang ditutup lawan tidak bisa dilanjutkan, jadi pemain diantar kembali ke beranda.
    if (!data.isLeftByRival) return
    const timer = window.setTimeout(() => {
      window.location.href = '/'
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [data.isLeftByRival])
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
    <div className="flex h-[100dvh] w-full touch-none items-stretch justify-center overflow-hidden overscroll-none bg-[#0a0a0b] p-2 sm:p-4">
      <div className="flex h-full w-full max-w-[480px] flex-col gap-3">
        <CongklakHeader onLoadCongklakExit={loadCongklakExit} isSoundOn={data.isSoundOn} onEditCongklakSound={editCongklakSound} />

        <GameTurnStatus label={data.statusLabel} isWaiting={data.isWaiting} />

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
          rivalLabel="Rumah lawan"
          playerScore={data.ownScore}
          botScore={data.rivalScore}
          moveTotal={data.moveTotal}
          onClearCongklakGame={clearCongklakRoom}
        />
      ) : null}
      {data.isExitOpen ? (
        <GameExitConfirm
          title="Keluar dari permainan?"
          subtitle="Sesi ini akan diakhiri untuk kamu dan lawanmu."
          cancelLabel="Batal"
          confirmLabel="Keluar"
          isConfirmLoading={storeGameRoomsLeave.isPending}
          onClearGameExit={clearCongklakExit}
          onSubmitGameExit={submitCongklakExit}
        />
      ) : null}

    </div>
  )
}
