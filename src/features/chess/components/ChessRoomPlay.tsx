'use client'

import { useEffect, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import type { ChessCell, ChessColor } from '../types/chessTypes'
import { useGameRoomsStates } from '@/features/game-rooms/states/gameRoomsStates'
import { useGameRoomsControllers } from '@/features/game-rooms/controllers/gameRoomsControllers'
import GameRoomsInvite from '@/features/game-rooms/components/GameRoomsInvite'
import ChessRoomHeader from './ChessRoomHeader'
import ChessBoard from './ChessBoard'

interface Props {
  code: string
}

export default function ChessRoomPlay({ code }: Props) {
  const { gameRooms, setGetGameRooms } = useGameRoomsStates()
  const { storeGameRoomsJoin, storeGameRoomsMove } = useGameRoomsControllers()
  const [filters, setFilters] = useState({
    selected: '',
    isCopied: false,
    inviteUrl: '',
    pagination: { currentPage: 1, perPage: 64, totalItem: 64, totalPage: 1 },
  })
  const data = useMemo(() => {
    const room = gameRooms.data
    const fen = room?.fen ?? ''
    const seat = room?.seat ?? ''
    const seatColor: ChessColor = seat === 'p2' ? 'b' : 'w'
    const chess = fen ? new Chess(fen) : new Chess()

    const getTargets = (square: string) => {
      if (!square) return [] as Array<{ to: string; captured?: string }>
      return chess.moves({ square: square as never, verbose: true }) as Array<{ to: string; captured?: string }>
    }
    const getCheckedSquare = () => {
      if (!chess.inCheck()) return ''
      const found = chess
        .board()
        .flat()
        .find((cell) => cell && cell.type === 'k' && cell.color === chess.turn())
      return found ? found.square : ''
    }
    const getBoard = (): ChessCell[] => {
      const targets = new Map(getTargets(filters.selected).map((move) => [move.to, !!move.captured]))
      const checkedSquare = getCheckedSquare()
      const lastMove = room?.lastMove ?? null

      return chess
        .board()
        .flat()
        .map((cell, index) => {
          const file = index % 8
          const rank = Math.floor(index / 8)
          const square = `${'abcdefgh'[file]}${8 - rank}`
          return {
            square,
            piece: cell ? { type: cell.type, color: cell.color as ChessColor } : null,
            isDark: (file + rank) % 2 === 1,
            isSelected: square === filters.selected,
            isTarget: targets.has(square),
            isCapture: targets.get(square) === true,
            isLastMove: !!lastMove && (lastMove.from === square || lastMove.to === square),
            isCheck: square === checkedSquare,
          }
        })
    }
    const getResultLabel = (winner: string) => {
      if (!winner) return ''
      if (winner === 'draw') return 'Seri'
      return winner === seat ? 'Kamu menang' : 'Lawan menang'
    }

    const isPlaying = room?.status === 'playing'
    const isMyTurn = isPlaying && !!seat && room?.turn === seat
    const board = getBoard()

    return {
      data: board,
      isLoading: gameRooms.status === 'loading' && !room,
      isError: gameRooms.status === 'error',
      isEmpty: gameRooms.status === 'empty',
      emptyTitle: 'Ruangan tidak ditemukan',
      emptySubtitle: 'Periksa kembali tautan undangan yang kamu terima.',
      emptyImage: '',
      pagination: filters.pagination,
      code,
      seat,
      seatColor,
      seatLabel: seatColor === 'w' ? 'Putih' : 'Hitam',
      turnLabel: isMyTurn ? 'Giliranmu' : 'Giliran lawan',
      lastMove: room?.lastMove ?? null,
      isFlipped: seatColor === 'b',
      isLocked: !isMyTurn || storeGameRoomsMove.isPending,
      isMyTurn,
      isCheck: chess.inCheck(),
      moveTotal: room?.moveTotal ?? 0,
      inviteUrl: filters.inviteUrl,
      isCopied: filters.isCopied,
      playerTotal: room?.playerTotal ?? 0,
      seatTotal: room?.seatTotal ?? 2,
      isLobbyOpen: !!room && room.status === 'lobby',
      isFinished: room?.status === 'finished',
      resultLabel: getResultLabel(room?.winner ?? ''),
      selected: filters.selected,
    }
  }, [gameRooms, filters, code, storeGameRoomsMove.isPending])
  const submitChessSquare = (square: string) => {
    const room = gameRooms.data
    if (!room || data.isLocked) return

    const getIsTarget = (from: string, to: string) => {
      const chess = new Chess(room.fen)
      const moves = chess.moves({ square: from as never, verbose: true }) as Array<{ to: string }>
      return moves.some((move) => move.to === to)
    }
    const getIsOwnPiece = (target: string) => {
      const chess = new Chess(room.fen)
      const piece = chess.get(target as never)
      return !!piece && piece.color === data.seatColor
    }

    if (filters.selected && getIsTarget(filters.selected, square)) {
      storeGameRoomsMove.mutate({ code, token: room.token, from: filters.selected, to: square, promotion: 'q' })
      setFilters((prev) => ({ ...prev, selected: '' }))
      return
    }
    setFilters((prev) => ({ ...prev, selected: getIsOwnPiece(square) ? square : '' }))
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
  const clearChessRoom = () => {
    window.location.href = '/chess'
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
    setFilters((prev) => ({ ...prev, inviteUrl: `${window.location.origin}/chess/${code}` }))
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
    <div className="flex h-[100dvh] w-full items-stretch justify-center overflow-hidden bg-[#0a0a0b] p-3 sm:p-5">
      <div className="flex h-full w-full max-w-[480px] flex-col gap-3">
        <ChessRoomHeader
          seatLabel={data.seatLabel}
          turnLabel={data.turnLabel}
          moveTotal={data.moveTotal}
          code={data.code}
        />

        <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          {data.isLoading ? (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">Menyiapkan ruangan…</p>
          ) : (
            <ChessBoard
              board={data.data}
              lastMove={data.lastMove}
              isLocked={data.isLocked}
              isFlipped={data.isFlipped}
              onSubmitChessSquare={submitChessSquare}
            />
          )}
        </main>
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
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Permainan selesai</p>
            <p className="mt-2 text-2xl font-black uppercase leading-none text-[#f2ede1]">{data.resultLabel}</p>
            <button
              type="button"
              onClick={clearChessRoom}
              className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
            >
              Kembali
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
