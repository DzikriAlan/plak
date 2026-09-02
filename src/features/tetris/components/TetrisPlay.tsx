'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTetrisStates } from '../states/tetrisStates'
import GameAudio, { type GameAudioCue } from '@/shared/components/reusable/GameAudio'
import GameTurnStatus from '@/shared/components/reusable/GameTurnStatus'
import GameExitConfirm from '@/shared/components/reusable/GameExitConfirm'
import TetrisHeader from './TetrisHeader'
import TetrisBoard from './TetrisBoard'
import TetrisControls from './TetrisControls'
import TetrisResult from './TetrisResult'

const SWIPE_THRESHOLD = 28

export default function TetrisPlay() {
  const {
    tetrisGame,
    setTetrisInit,
    setTetrisShift,
    setTetrisRotate,
    setTetrisSoftDrop,
    setTetrisHardDrop,
    setTetrisStep,
    setTetrisRestart,
  } = useTetrisStates()
  // Titik awal sentuhan disimpan di luar render supaya usapan tidak memicu render berulang.
  const swipeRef = useRef({ x: 0, y: 0, isDown: false })
  const [filters, setFilters] = useState({
    isExitOpen: false,
    isSoundOn: true,
    lastLineTotal: 0,
    cue: null as GameAudioCue | null,
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const game = tetrisGame.data
    const cells = game?.cells ?? []
    const isOver = !!game?.isOver

    return {
      isExitOpen: filters.isExitOpen,
      data: cells,
      isLoading: tetrisGame.status === 'loading',
      isError: tetrisGame.status === 'error',
      isEmpty: tetrisGame.status === 'success' && !cells.length,
      emptyTitle: 'Papan belum siap',
      emptySubtitle: 'Muat ulang halaman untuk memulai permainan baru.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: cells.length, totalItem: cells.length },
      cells,
      preview: game?.preview ?? [],
      columnTotal: game?.columnTotal ?? 0,
      rowTotal: game?.rowTotal ?? 0,
      score: game?.score ?? 0,
      bestScore: game?.bestScore ?? 0,
      lineTotal: game?.lineTotal ?? 0,
      level: game?.level ?? 1,
      stepDelay: game?.stepDelay ?? 800,
      statusLabel: isOver ? 'Tumpukan sudah penuh' : `Level ${game?.level ?? 1} · ${game?.lineTotal ?? 0} baris`,
      isWaiting: isOver,
      isOver,
      resultLabel: 'Skor akhir',
      isSoundOn: filters.isSoundOn,
      cue: filters.cue,
    }
  }, [tetrisGame, filters])
  const submitTetrisShift = (step: number) => {
    setTetrisShift(step)
  }
  const submitTetrisRotate = () => {
    setTetrisRotate()
  }
  const submitTetrisSoftDrop = () => {
    setTetrisSoftDrop()
  }
  const submitTetrisHardDrop = () => {
    setTetrisHardDrop()
  }
  const editTetrisSound = () => {
    setFilters((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }))
  }
  const clearTetrisGame = () => {
    setFilters((prev) => ({ ...prev, lastLineTotal: 0, cue: null }))
    setTetrisRestart()
  }

  const loadTetrisExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: true }))
  }
  const clearTetrisExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: false }))
  }
  const submitTetrisExit = () => {
    // Sesi permainan berakhir begitu pemain benar-benar keluar dari halaman.
    window.location.href = '/'
  }
  useEffect(() => {
    setTetrisInit()
  }, [setTetrisInit])
  useEffect(() => {
    // Balok turun sendiri mengikuti tempo level yang sedang berjalan.
    if (data.isOver || data.isLoading) return
    const timer = window.setInterval(() => setTetrisStep(), data.stepDelay)
    return () => window.clearInterval(timer)
  }, [data.isOver, data.isLoading, data.stepDelay, setTetrisStep])
  useEffect(() => {
    // Papan tetap bisa dimainkan dengan papan ketik di layar lebar.
    const loadKeyboard = (event: KeyboardEvent) => {
      const actions: Record<string, () => void> = {
        ArrowLeft: () => setTetrisShift(-1),
        ArrowRight: () => setTetrisShift(1),
        ArrowUp: () => setTetrisRotate(),
        ArrowDown: () => setTetrisSoftDrop(),
        ' ': () => setTetrisHardDrop(),
      }
      const action = actions[event.key]
      if (!action) return
      event.preventDefault()
      action()
    }

    window.addEventListener('keydown', loadKeyboard)
    return () => window.removeEventListener('keydown', loadKeyboard)
  }, [setTetrisShift, setTetrisRotate, setTetrisSoftDrop, setTetrisHardDrop])
  useEffect(() => {
    // Bunyi hanya dibunyikan saat ada baris baru yang berhasil dibersihkan.
    setFilters((prev) =>
      data.lineTotal > prev.lastLineTotal
        ? { ...prev, lastLineTotal: data.lineTotal, cue: { id: Date.now(), kind: 'capture' } }
        : { ...prev, lastLineTotal: data.lineTotal },
    )
  }, [data.lineTotal])
  useEffect(() => {
    if (!data.isOver) return
    setFilters((prev) => (prev.cue?.kind === 'lose' ? prev : { ...prev, cue: { id: Date.now(), kind: 'lose' } }))
  }, [data.isOver])

  const loadTetrisSwipeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    swipeRef.current = { x: event.clientX, y: event.clientY, isDown: true }
  }
  const loadTetrisSwipeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!swipeRef.current.isDown) return
    const deltaX = event.clientX - swipeRef.current.x
    const deltaY = event.clientY - swipeRef.current.y
    swipeRef.current.isDown = false

    // Usapan pendek dianggap ketukan untuk memutar balok.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD && Math.abs(deltaY) < SWIPE_THRESHOLD) {
      setTetrisRotate()
      return
    }
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setTetrisShift(deltaX > 0 ? 1 : -1)
      return
    }
    if (deltaY > 0) setTetrisHardDrop()
  }

  return (
    <div className="flex h-[100dvh] w-full touch-none items-stretch justify-center overflow-hidden overscroll-none bg-[#0a0a0b] p-2 sm:p-4">
      <div className="flex h-full w-full max-w-[480px] flex-col gap-3">
        <TetrisHeader onLoadTetrisExit={loadTetrisExit} isSoundOn={data.isSoundOn} onEditTetrisSound={editTetrisSound} />

        <GameAudio
          isActive
          isMusicOn={data.isSoundOn}
          isSoundOn={data.isSoundOn}
          bassScale={[110, 110, 164.81, 146.83]}
          leadScale={[659.25, 493.88, 523.25, 587.33, 523.25, 493.88, 440, 440]}
          stepDuration={0.26}
          cue={data.cue}
        />

        <GameTurnStatus label={data.statusLabel} isWaiting={data.isWaiting} />

        <main
          className="flex min-h-0 flex-1 items-stretch justify-center"
          onPointerDown={loadTetrisSwipeStart}
          onPointerUp={loadTetrisSwipeEnd}
        >
          {data.isLoading || !data.columnTotal ? (
            <p className="self-center text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">
              Menyiapkan papan…
            </p>
          ) : (
            <TetrisBoard
              cells={data.cells}
              preview={data.preview}
              columnTotal={data.columnTotal}
              rowTotal={data.rowTotal}
              score={data.score}
              bestScore={data.bestScore}
            />
          )}
        </main>

        <TetrisControls
          isDisabled={data.isOver}
          onSubmitTetrisShift={submitTetrisShift}
          onSubmitTetrisRotate={submitTetrisRotate}
          onSubmitTetrisSoftDrop={submitTetrisSoftDrop}
          onSubmitTetrisHardDrop={submitTetrisHardDrop}
        />

        <footer className="grid shrink-0 grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Level</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.level}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Baris</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.lineTotal}</span>
          </div>
          <button
            type="button"
            onClick={clearTetrisGame}
            className="rounded-xl bg-[#f2ede1] py-2 text-[12px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
          >
            Restart
          </button>
        </footer>
      </div>

      {data.isOver ? (
        <TetrisResult
          resultLabel={data.resultLabel}
          score={data.score}
          bestScore={data.bestScore}
          lineTotal={data.lineTotal}
          onClearTetrisGame={clearTetrisGame}
        />
      ) : null}
      {data.isExitOpen ? (
        <GameExitConfirm
          title="Keluar dari permainan?"
          subtitle="Sesi permainan ini akan diakhiri dan kemajuanmu tidak disimpan."
          cancelLabel="Batal"
          confirmLabel="Keluar"
          onClearGameExit={clearTetrisExit}
          onSubmitGameExit={submitTetrisExit}
        />
      ) : null}
    </div>
  )
}
