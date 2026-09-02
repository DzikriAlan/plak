'use client'

import { useEffect, useMemo, useState } from 'react'
import type { DotsAndBoxesBox, DotsAndBoxesLine } from '../types/dotsAndBoxesTypes'
import {
  DOTS_AND_BOXES_CELL_TOTAL,
  DOTS_AND_BOXES_DOT_TOTAL,
  DOTS_AND_BOXES_ROW_LINE_TOTAL,
  getDotsAndBoxesBoxColumn,
  getDotsAndBoxesBoxRow,
} from '@/shared/lib/dotsAndBoxesEngine'
import { useGameRoomsStates } from '@/features/game-rooms/states/gameRoomsStates'
import { useGameRoomsControllers } from '@/features/game-rooms/controllers/gameRoomsControllers'
import GameRoomsInvite from '@/features/game-rooms/components/GameRoomsInvite'
import GameTurnStatus from '@/shared/components/reusable/GameTurnStatus'
import GameExitConfirm from '@/shared/components/reusable/GameExitConfirm'
import DotsAndBoxesHeader from './DotsAndBoxesHeader'
import DotsAndBoxesBoard from './DotsAndBoxesBoard'
import DotsAndBoxesResult from './DotsAndBoxesResult'

interface Props {
  code: string
}

export default function DotsAndBoxesRoomPlay({ code }: Props) {
  const { gameRooms, setGetGameRooms } = useGameRoomsStates()
  const { storeGameRoomsJoin, storeGameRoomsMove, storeGameRoomsLeave } = useGameRoomsControllers()
  const [filters, setFilters] = useState({
    isExitOpen: false,
    isSoundOn: true,
    isCopied: false,
    inviteUrl: '',
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const room = gameRooms.data
    const lines = room?.lines ?? []
    const owners = room?.owners ?? []
    const seat = room?.seat ?? ''
    const rivalSeat = seat === 'p1' ? 'p2' : 'p1'
    const isPlaying = room?.status === 'playing'
    const isMyTurn = isPlaying && !!seat && room?.turn === seat

    // Kursi sendiri selalu digambar sebagai pemain supaya kedua layar memakai warna yang sama.
    const getSide = (owner: string) => {
      if (!owner) return ''
      return owner === seat ? 'player' : 'bot'
    }
    const getLine = (owner: string, index: number): DotsAndBoxesLine => {
      const isRow = index < DOTS_AND_BOXES_ROW_LINE_TOTAL
      const offset = isRow ? index : index - DOTS_AND_BOXES_ROW_LINE_TOTAL
      const span = isRow ? DOTS_AND_BOXES_CELL_TOTAL : DOTS_AND_BOXES_DOT_TOTAL
      return {
        index,
        row: Math.floor(offset / span),
        column: offset % span,
        isRow,
        side: getSide(owner),
        isPlayable: !owner && isMyTurn,
        isLast: room?.lastLine === index,
      }
    }
    const getBox = (owner: string, index: number): DotsAndBoxesBox => ({
      index,
      row: getDotsAndBoxesBoxRow(index),
      column: getDotsAndBoxesBoxColumn(index),
      side: getSide(owner),
      label: owner ? (owner === seat ? 'A' : 'B') : '',
    })
    const getSeatTotal = (target: string) => owners.filter((owner) => owner === target).length
    const getResultLabel = (winner: string) => {
      if (room?.leftSeat && room.leftSeat !== seat) return 'Lawan keluar, kamu menang'
      if (room?.leftSeat && room.leftSeat === seat) return 'Kamu keluar dari permainan'
      if (!winner) return ''
      if (winner === 'draw') return 'Seri'
      return winner === seat ? 'Kamu menang' : 'Lawan menang'
    }

    const ownScore = getSeatTotal(seat)
    const rivalScore = getSeatTotal(rivalSeat)

    return {
      isExitOpen: filters.isExitOpen,
      data: lines,
      isLoading: gameRooms.status === 'loading' && !room,
      isError: gameRooms.status === 'error',
      isEmpty: gameRooms.status === 'empty',
      emptyTitle: 'Ruangan tidak ditemukan',
      emptySubtitle: 'Periksa kembali tautan undangan yang kamu terima.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: lines.length, totalItem: lines.length },
      lines: lines.map((owner, index) => getLine(owner, index)),
      boxes: owners.map((owner, index) => getBox(owner, index)),
      dotTotal: lines.length ? DOTS_AND_BOXES_DOT_TOTAL : 0,
      turn: isMyTurn ? 'player' : 'bot',
      // Penanda besar dipakai supaya pemain tahu kenapa garis belum bisa disentuh.
      statusLabel: !seat
        ? 'Ruangan penuh, kamu menonton'
        : isMyTurn
          ? 'Giliranmu, tarik garis'
          : (room?.rivalOnlineTotal ?? 0) > 0
            ? 'Menunggu langkah lawan'
            : 'Menunggu lawan tersambung',
      isWaiting: isPlaying && !isMyTurn,
      seat,
      code,
      inviteUrl: filters.inviteUrl,
      isCopied: filters.isCopied,
      playerTotal: room?.playerTotal ?? 0,
      seatTotal: room?.seatTotal ?? 2,
      isLobbyOpen: !!room && room.status === 'lobby',
      scoreLabel: `${ownScore} : ${rivalScore}`,
      ownScore,
      rivalScore,
      moveTotal: room?.moveTotal ?? 0,
      isFinished: room?.status === 'finished',
      isLeftByRival: !!room?.leftSeat && room.leftSeat !== seat,
      resultLabel: getResultLabel(room?.winner ?? ''),
      isSoundOn: filters.isSoundOn,
    }
  }, [gameRooms, filters, code])
  const submitDotsAndBoxesLine = (lineIndex: number) => {
    const room = gameRooms.data
    if (!room || room.turn !== room.seat) return
    storeGameRoomsMove.mutate({ code, token: room.token, lineIndex })
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
  const editDotsAndBoxesSound = () => {
    setFilters((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }))
  }
  const clearDotsAndBoxesRoom = () => {
    window.location.href = data.isLeftByRival ? '/' : '/dots-and-boxes'
  }

  const loadDotsAndBoxesExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: true }))
  }
  const clearDotsAndBoxesExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: false }))
  }
  const submitDotsAndBoxesExit = () => {
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
    setFilters((prev) => ({ ...prev, inviteUrl: `${window.location.origin}/dots-and-boxes/${code}` }))
    setGetGameRooms({ code, token })
    storeGameRoomsJoin.mutate({ code, token, name: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, setGetGameRooms])
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
        <DotsAndBoxesHeader
          onLoadDotsAndBoxesExit={loadDotsAndBoxesExit}
          isSoundOn={data.isSoundOn}
          onEditDotsAndBoxesSound={editDotsAndBoxesSound}
        />

        <GameTurnStatus label={data.statusLabel} isWaiting={data.isWaiting} />

        <main className="flex min-h-0 flex-1 items-stretch justify-center">
          {data.isLoading || !data.dotTotal ? (
            <p className="self-center text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">
              Menyiapkan ruangan…
            </p>
          ) : (
            <DotsAndBoxesBoard
              lines={data.lines}
              boxes={data.boxes}
              dotTotal={data.dotTotal}
              turn={data.turn}
              playerLabel="Kotak Kamu"
              botLabel="Kotak Lawan"
              playerScore={data.ownScore}
              botScore={data.rivalScore}
              onSubmitDotsAndBoxesLine={submitDotsAndBoxesLine}
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
        <DotsAndBoxesResult
          resultLabel={data.resultLabel}
          rivalLabel="Kotak lawan"
          playerScore={data.ownScore}
          botScore={data.rivalScore}
          moveTotal={data.moveTotal}
          onClearDotsAndBoxesGame={clearDotsAndBoxesRoom}
        />
      ) : null}
      {data.isExitOpen ? (
        <GameExitConfirm
          title="Keluar dari permainan?"
          subtitle="Sesi ini akan diakhiri untuk kamu dan lawanmu."
          cancelLabel="Batal"
          confirmLabel="Keluar"
          isConfirmLoading={storeGameRoomsLeave.isPending}
          onClearGameExit={clearDotsAndBoxesExit}
          onSubmitGameExit={submitDotsAndBoxesExit}
        />
      ) : null}
    </div>
  )
}
