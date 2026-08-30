'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CaturCell } from '../types/caturTypes'
import { useCaturStates } from '../states/caturStates'
import CaturHeader from './CaturHeader'
import CaturBoard from './CaturBoard'
import CaturCaptured from './CaturCaptured'

const LEVELS = [
  { id: 0, label: 'Santai', skill: 2, depth: 4, movetime: 200 },
  { id: 1, label: 'Serius', skill: 12, depth: 10, movetime: 500 },
  { id: 2, label: 'Kelas Dunia', skill: 20, depth: 20, movetime: 1200 },
]
const PROMOTION_CHOICES = [
  { piece: 'q', label: 'Menteri', glyph: '♛' },
  { piece: 'r', label: 'Benteng', glyph: '♜' },
  { piece: 'b', label: 'Gajah', glyph: '♝' },
  { piece: 'n', label: 'Kuda', glyph: '♞' },
]

export default function CaturPlay() {
  const { caturGame, setCaturInit, setCaturSelect, setCaturMove, setCaturPromotion, setCaturUndo, setCaturRestart } =
    useCaturStates()
  const engineRef = useRef<Worker | null>(null)
  const [filters, setFilters] = useState({
    activeLevel: 2,
    isEngineReady: false,
    isThinking: false,
    pagination: { currentPage: 1, perPage: 64, totalItem: 64, totalPage: 1 },
  })
  const data = useMemo(() => {
    const getStatusLabel = (board: CaturCell[]) => {
      if (!board.length) return 'Menyiapkan papan'
      if (game?.isFinished) return game.resultTitle
      if (!filters.isEngineReady) return 'Memuat mesin catur…'
      if (filters.isThinking) return 'Lawan sedang berpikir…'
      if (game?.isCheck) return game.turn === 'w' ? 'Anda diskak!' : 'Skak untuk lawan'
      return game?.turn === 'w' ? 'Giliran Anda (putih)' : 'Giliran lawan'
    }
    const getPieceValue = (piece: string) => ({ q: 9, r: 5, b: 3, n: 3, p: 1 })[piece] ?? 0
    const getScore = (mine: string[], theirs: string[]) =>
      mine.reduce((sum, piece) => sum + getPieceValue(piece), 0) -
      theirs.reduce((sum, piece) => sum + getPieceValue(piece), 0)

    const game = caturGame.data
    const board = game?.board ?? []
    const advantage = getScore(game?.capturedByPlayer ?? [], game?.capturedByEngine ?? [])

    return {
      data: board,
      isLoading: caturGame.status === 'loading',
      isError: caturGame.status === 'error',
      isEmpty: caturGame.status === 'success' && !board.length,
      emptyTitle: 'Papan tidak tersedia',
      emptySubtitle: 'Muat ulang halaman untuk memulai permainan.',
      emptyImage: '',
      pagination: filters.pagination,
      levels: LEVELS.map((level) => ({ id: level.id, label: level.label })),
      activeLevel: filters.activeLevel,
      statusLabel: getStatusLabel(board),
      moveTotal: game?.moveTotal ?? 0,
      advantage,
      lastMove: game?.lastMove ?? null,
      capturedByPlayer: game?.capturedByPlayer ?? [],
      capturedByEngine: game?.capturedByEngine ?? [],
      isLocked:
        !game ||
        !filters.isEngineReady ||
        game.isFinished ||
        game.turn !== 'w' ||
        filters.isThinking ||
        !!game.pendingPromotion,
      isUndoDisabled: !game || filters.isThinking || game.moveTotal < 2,
      isPromotionOpen: !!game?.pendingPromotion,
      isFinished: !!game?.isFinished,
      resultTitle: game?.resultTitle ?? '',
      resultSubtitle: game?.resultSubtitle ?? '',
    }
  }, [caturGame, filters])
  const submitCaturSquare = (square: string) => {
    const game = caturGame.data
    if (!game || data.isLocked) return

    const getCell = (target: string) => game.board.find((cell) => cell.square === target) ?? null

    const cell = getCell(square)
    if (game.selected && cell?.isTarget) {
      setCaturMove(game.selected, square)
      return
    }
    setCaturSelect(square)
  }
  const submitCaturPromotion = (piece: string) => {
    setCaturPromotion(piece)
  }
  const editCaturLevel = (levelId: number) => {
    setFilters((prev) => ({ ...prev, activeLevel: levelId }))
  }
  const loadCaturUndo = () => {
    setCaturUndo()
  }
  const clearCaturGame = () => {
    setCaturRestart()
  }

  useEffect(() => {
    setCaturInit()
  }, [setCaturInit])
  useEffect(() => {
    const worker = new Worker('/engine/stockfish-18-lite-single.js')
    worker.onmessage = (event) => {
      const line = typeof event.data === 'string' ? event.data : ''
      if (line.startsWith('uciok')) worker.postMessage('isready')
      if (line.startsWith('readyok')) setFilters((prev) => ({ ...prev, isEngineReady: true }))
      if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1]
        setFilters((prev) => ({ ...prev, isThinking: false }))
        if (move && move !== '(none)') {
          setCaturMove(move.slice(0, 2), move.slice(2, 4), move.length > 4 ? move[4] : undefined)
        }
      }
    }
    worker.postMessage('uci')
    engineRef.current = worker

    return () => {
      worker.terminate()
      engineRef.current = null
    }
  }, [setCaturMove])
  useEffect(() => {
    const game = caturGame.data
    const worker = engineRef.current
    if (!game || !worker || !filters.isEngineReady) return
    if (game.isFinished || game.turn !== 'b' || filters.isThinking) return

    const level = LEVELS[filters.activeLevel]
    setFilters((prev) => ({ ...prev, isThinking: true }))
    worker.postMessage(`setoption name Skill Level value ${level.skill}`)
    worker.postMessage(`position fen ${game.fen}`)
    worker.postMessage(`go depth ${level.depth} movetime ${level.movetime}`)
  }, [caturGame, filters.isEngineReady, filters.isThinking, filters.activeLevel])

  return (
    <div className="flex h-[100dvh] w-full items-stretch justify-center overflow-hidden bg-[#0a0a0b] p-3 sm:p-5">
      <div className="flex h-full w-full max-w-[520px] flex-col gap-3 lg:max-w-[680px]">
        <CaturHeader
          levels={data.levels}
          activeLevel={data.activeLevel}
          moveTotal={data.moveTotal}
          statusLabel={data.statusLabel}
          onEditCaturLevel={editCaturLevel}
        />

        <CaturCaptured
          label="Lawan"
          pieces={data.capturedByEngine}
          color="w"
          advantage={data.advantage < 0 ? -data.advantage : 0}
        />

        <main className="flex min-h-0 flex-1 items-center justify-center">
          {data.isLoading ? (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">Menyiapkan papan…</p>
          ) : (
            <CaturBoard
              board={data.data}
              lastMove={data.lastMove}
              isLocked={data.isLocked}
              onSubmitCaturSquare={submitCaturSquare}
            />
          )}
        </main>

        <CaturCaptured
          label="Anda"
          pieces={data.capturedByPlayer}
          color="b"
          advantage={data.advantage > 0 ? data.advantage : 0}
        />

        <footer className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={data.isUndoDisabled}
            onClick={loadCaturUndo}
            className="flex-1 rounded-xl border border-[#3a3a42] py-2 text-[12px] font-medium text-[#f2ede1] transition-colors hover:border-[#f2ede1] disabled:opacity-30"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={clearCaturGame}
            className="flex-1 rounded-xl bg-[#f2ede1] py-2 text-[12px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
          >
            Ulang
          </button>
        </footer>
      </div>

      {data.isPromotionOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
            <p className="text-lg font-black uppercase tracking-[0.18em] text-[#f2ede1]">Promosi bidak</p>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {PROMOTION_CHOICES.map((choice) => (
                <button
                  key={choice.piece}
                  type="button"
                  aria-label={choice.label}
                  onClick={() => submitCaturPromotion(choice.piece)}
                  className="rounded-xl border border-[#3a3a42] py-3 text-2xl leading-none text-[#f2ede1] transition-colors hover:border-[#f2ede1]"
                >
                  {choice.glyph}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {data.isFinished ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Permainan selesai</p>
            <p className="mt-2 text-2xl font-black uppercase leading-none text-[#f2ede1]">{data.resultTitle}</p>
            <p className="mt-2 text-[13px] font-medium text-[#9aa3b2]">{data.resultSubtitle}</p>
            <button
              type="button"
              onClick={clearCaturGame}
              className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
            >
              Main lagi
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
