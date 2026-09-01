'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCongklakStates } from '../states/congklakStates'
import GameAudio, { type GameAudioCue } from '@/shared/components/reusable/GameAudio'
import CongklakHeader from './CongklakHeader'
import CongklakBoard from './CongklakBoard'
import CongklakResult from './CongklakResult'

const STEP_DELAY = 220
const BOT_DELAY = 620

export default function CongklakPlay() {
  const { congklakGame, setCongklakInit, setCongklakSow, setCongklakStep, setCongklakBot, setCongklakUndo, setCongklakRestart } =
    useCongklakStates()
  const [filters, setFilters] = useState({
    isSoundOn: true,
    lastCaptureTotal: 0,
    cue: null as GameAudioCue | null,
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const game = congklakGame.data
    const holes = game?.holes ?? []

    const getResultLabel = (winner: string) => {
      if (winner === 'player') return 'Kamu menang'
      if (winner === 'bot') return 'Bot menang'
      return 'Seri'
    }
    const playerScore = game?.playerStore.seedTotal ?? 0
    const botScore = game?.botStore.seedTotal ?? 0
    const isFinished = !!game?.isFinished
    const turn = game?.turn ?? 'player'

    return {
      data: holes,
      isLoading: congklakGame.status === 'loading',
      isError: congklakGame.status === 'error',
      isEmpty: congklakGame.status === 'success' && !holes.length,
      emptyTitle: 'Papan belum siap',
      emptySubtitle: 'Muat ulang halaman untuk memulai permainan baru.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: holes.length, totalItem: holes.length },
      playerHoles: game?.playerHoles ?? [],
      botHoles: game?.botHoles ?? [],
      playerStore: game?.playerStore ?? null,
      botStore: game?.botStore ?? null,
      turn,
      scoreLabel: `${playerScore} : ${botScore}`,
      playerScore,
      botScore,
      moveTotal: game?.moveTotal ?? 0,
      undoLeft: game?.undoLeft ?? 0,
      captureTotal: game?.captureTotal ?? 0,
      isSowing: !!game?.isSowing,
      isUndoDisabled: !game?.undoLeft || !!game?.isSowing || isFinished || !game?.moveTotal,
      isFinished,
      resultLabel: getResultLabel(game?.winner ?? ''),
      winner: game?.winner ?? '',
      isSoundOn: filters.isSoundOn,
      cue: filters.cue,
    }
  }, [congklakGame, filters])
  const submitCongklakHole = (holeIndex: number) => {
    setCongklakSow(holeIndex)
  }
  const editCongklakSound = () => {
    setFilters((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }))
  }
  const editCongklakUndo = () => {
    setCongklakUndo()
  }
  const clearCongklakGame = () => {
    setFilters((prev) => ({ ...prev, lastCaptureTotal: 0, cue: null }))
    setCongklakRestart()
  }

  useEffect(() => {
    setCongklakInit()
  }, [setCongklakInit])
  useEffect(() => {
    if (!data.isSowing) return
    const timer = window.setInterval(() => setCongklakStep(), STEP_DELAY)
    return () => window.clearInterval(timer)
  }, [data.isSowing, setCongklakStep])
  useEffect(() => {
    // Bot menunggu sebentar supaya langkahnya terlihat seperti lawan yang berpikir.
    if (data.turn !== 'bot' || data.isSowing || data.isFinished) return
    const timer = window.setTimeout(() => setCongklakBot(), BOT_DELAY)
    return () => window.clearTimeout(timer)
  }, [data.turn, data.isSowing, data.isFinished, setCongklakBot])
  useEffect(() => {
    // Bunyi tembakan hanya dibunyikan saat jumlah biji tertembak bertambah.
    setFilters((prev) =>
      data.captureTotal > prev.lastCaptureTotal
        ? { ...prev, lastCaptureTotal: data.captureTotal, cue: { id: Date.now(), kind: 'capture' } }
        : { ...prev, lastCaptureTotal: data.captureTotal },
    )
  }, [data.captureTotal])
  useEffect(() => {
    if (!data.isFinished) return
    const kind = data.winner === 'bot' ? 'lose' : 'win'
    setFilters((prev) => (prev.cue?.kind === kind ? prev : { ...prev, cue: { id: Date.now(), kind } }))
  }, [data.isFinished, data.winner])

  return (
    <div className="flex h-[100dvh] w-full touch-none items-stretch justify-center overflow-hidden overscroll-none bg-[#0a0a0b] p-2 sm:p-4">
      <div className="flex h-full w-full max-w-[480px] flex-col gap-3">
        <CongklakHeader isSoundOn={data.isSoundOn} onEditCongklakSound={editCongklakSound} />

        <GameAudio
          isActive
          isMusicOn={data.isSoundOn}
          isSoundOn={data.isSoundOn}
          bassScale={[110, 110, 146.83, 130.81]}
          leadScale={[440, 523.25, 587.33, 523.25, 440, 392, 440, 523.25]}
          stepDuration={0.34}
          cue={data.cue}
        />

        <main className="flex min-h-0 flex-1 items-stretch justify-center">
          {data.isLoading || !data.playerStore || !data.botStore ? (
            <p className="self-center text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">
              Menyiapkan papan…
            </p>
          ) : (
            <CongklakBoard
              playerHoles={data.playerHoles}
              botHoles={data.botHoles}
              playerStore={data.playerStore}
              botStore={data.botStore}
              turn={data.turn}
              onSubmitCongklakHole={submitCongklakHole}
            />
          )}
        </main>

        <footer className="grid shrink-0 grid-cols-4 gap-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Langkah</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.moveTotal}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Skor</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.scoreLabel}</span>
          </div>
          <button
            type="button"
            disabled={data.isUndoDisabled}
            onClick={editCongklakUndo}
            className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2 transition-colors hover:border-[#43434d] disabled:opacity-45"
          >
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Undo</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.undoLeft}</span>
          </button>
          <button
            type="button"
            onClick={clearCongklakGame}
            className="rounded-xl bg-[#f2ede1] py-2 text-[12px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
          >
            Restart
          </button>
        </footer>
      </div>

      {data.isFinished ? (
        <CongklakResult
          resultLabel={data.resultLabel}
          playerScore={data.playerScore}
          botScore={data.botScore}
          moveTotal={data.moveTotal}
          onClearCongklakGame={clearCongklakGame}
        />
      ) : null}
    </div>
  )
}
