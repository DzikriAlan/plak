'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MazeRunnerDirection } from '../types/mazeRunnerTypes'
import { useMazeRunnerStates } from '../states/mazeRunnerStates'
import GameAudio, { type GameAudioCue } from '@/shared/components/reusable/GameAudio'
import MazeRunnerHeader from './MazeRunnerHeader'
import MazeRunnerBoard from './MazeRunnerBoard'
import MazeRunnerResult from './MazeRunnerResult'

const KEY_DIRECTIONS: Record<string, MazeRunnerDirection> = {
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  w: 'up',
  d: 'right',
  s: 'down',
  a: 'left',
  k: 'up',
  l: 'right',
  j: 'down',
  h: 'left',
}

export default function MazeRunnerPlay() {
  const {
    mazeRunnerGame,
    setMazeRunnerInit,
    setMazeRunnerMove,
    setMazeRunnerRun,
    setMazeRunnerHint,
    setMazeRunnerNextLevel,
    setMazeRunnerRestart,
  } = useMazeRunnerStates()
  const [filters, setFilters] = useState({
    activeLevel: 0,
    secondsLeft: 0,
    isSoundOn: true,
    lastMoveTotal: 0,
    cue: null as GameAudioCue | null,
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const game = mazeRunnerGame.data
    const cells = game?.cells ?? []

    const getTimeLabel = (seconds: number) => {
      const minute = Math.floor(seconds / 60)
      const second = seconds % 60
      return `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
    }
    const getPaddedLevel = (level: number) => String(level).padStart(2, '0')

    const level = game?.level ?? 1
    const hintTotal = game?.hintTotal ?? 0
    const hintUsed = game?.hintUsed ?? 0
    const isTimeUp = !!game && !game.isCleared && filters.activeLevel === level && filters.secondsLeft <= 0

    return {
      data: cells,
      isLoading: mazeRunnerGame.status === 'loading',
      isError: mazeRunnerGame.status === 'error',
      isEmpty: mazeRunnerGame.status === 'success' && !cells.length,
      emptyTitle: 'Labirin belum siap',
      emptySubtitle: 'Muat ulang halaman untuk memulai permainan baru.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: cells.length, totalItem: cells.length },
      rowTotal: game?.rowTotal ?? 0,
      colTotal: game?.colTotal ?? 0,
      player: game?.player ?? { row: 0, col: 0 },
      goal: game?.goal ?? { row: 0, col: 0 },
      hintPath: game?.hintPath ?? [],
      level,
      levelLabel: getPaddedLevel(level),
      secondsLeft: filters.secondsLeft,
      timeLabel: getTimeLabel(filters.secondsLeft),
      hintLabel: `${hintUsed}/${hintTotal}`,
      goalLabel: 'Ke Gua',
      moveTotal: game?.moveTotal ?? 0,
      isHintDisabled: hintUsed >= hintTotal || !!game?.isCleared || isTimeUp,
      isSoundOn: filters.isSoundOn,
      cue: filters.cue,
      isCleared: !!game?.isCleared,
      isTimeUp,
    }
  }, [mazeRunnerGame, filters])
  const editMazeRunnerMove = (direction: MazeRunnerDirection) => {
    setMazeRunnerMove(direction)
  }
  const editMazeRunnerRun = (direction: MazeRunnerDirection) => {
    setMazeRunnerRun(direction)
  }
  const editMazeRunnerSound = () => {
    setFilters((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }))
  }
  const loadMazeRunnerHint = () => {
    setMazeRunnerHint()
  }
  const submitMazeRunnerNextLevel = () => {
    setFilters((prev) => ({ ...prev, activeLevel: 0, secondsLeft: 0, lastMoveTotal: 0, cue: null }))
    setMazeRunnerNextLevel()
  }
  const clearMazeRunnerLevel = () => {
    setFilters((prev) => ({ ...prev, activeLevel: 0, secondsLeft: 0, lastMoveTotal: 0, cue: null }))
    setMazeRunnerRestart()
  }

  useEffect(() => {
    setMazeRunnerInit()
  }, [setMazeRunnerInit])
  useEffect(() => {
    const game = mazeRunnerGame.data
    if (!game) return
    // Waktu direset saat level berganti maupun saat level yang sama diulang.
    setFilters((prev) =>
      prev.activeLevel === game.level && prev.secondsLeft > 0
        ? prev
        : { ...prev, activeLevel: game.level, secondsLeft: game.timeLimit },
    )
  }, [mazeRunnerGame])
  useEffect(() => {
    // Tombol huruf disamakan ke huruf kecil supaya caps lock atau shift tetap terbaca.
    const getPressedDirection = (event: KeyboardEvent) =>
      KEY_DIRECTIONS[event.key.length === 1 ? event.key.toLowerCase() : event.key] ?? null
    const editPressedKey = (event: KeyboardEvent) => {
      const direction = getPressedDirection(event)
      if (!direction) return
      event.preventDefault()
      setMazeRunnerMove(direction)
    }
    window.addEventListener('keydown', editPressedKey)
    return () => window.removeEventListener('keydown', editPressedKey)
  }, [setMazeRunnerMove])
  useEffect(() => {
    const game = mazeRunnerGame.data
    if (!game) return
    // Bunyi hanya dipicu saat langkah benar-benar bertambah.
    setFilters((prev) => {
      const getCue = (kind: GameAudioCue['kind']): GameAudioCue => ({ id: Date.now(), kind })
      if (game.isCleared) {
        if (prev.cue?.kind === 'win') return prev
        return { ...prev, cue: getCue('win'), lastMoveTotal: game.moveTotal }
      }
      if (game.moveTotal > prev.lastMoveTotal) {
        return { ...prev, cue: getCue('move'), lastMoveTotal: game.moveTotal }
      }
      if (game.moveTotal === prev.lastMoveTotal) return prev
      return { ...prev, lastMoveTotal: game.moveTotal }
    })
  }, [mazeRunnerGame])
  useEffect(() => {
    if (!data.isTimeUp) return
    setFilters((prev) => (prev.cue?.kind === 'lose' ? prev : { ...prev, cue: { id: Date.now(), kind: 'lose' } }))
  }, [data.isTimeUp])
  useEffect(() => {
    if (data.isCleared || data.isTimeUp || !data.secondsLeft) return
    const timer = window.setInterval(() => {
      setFilters((prev) => ({ ...prev, secondsLeft: Math.max(0, prev.secondsLeft - 1) }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [data.isCleared, data.isTimeUp, data.secondsLeft])

  return (
    <div className="flex h-[100dvh] w-full touch-none items-stretch justify-center overflow-hidden overscroll-none bg-[#0a0a0b] p-2 sm:p-4">
      <div className="flex h-full w-full max-w-[480px] flex-col gap-3">
        <MazeRunnerHeader
          level={data.level}
          timeLabel={data.timeLabel}
          hintLabel={data.hintLabel}
          goalLabel={data.goalLabel}
          isHintDisabled={data.isHintDisabled}
          isSoundOn={data.isSoundOn}
          onLoadMazeRunnerHint={loadMazeRunnerHint}
          onEditMazeRunnerSound={editMazeRunnerSound}
        />

        <GameAudio
          isActive
          isMusicOn={data.isSoundOn}
          isSoundOn={data.isSoundOn}
          bassScale={[98, 98, 130.81, 116.54]}
          leadScale={[392, 493.88, 587.33, 493.88, 440, 523.25, 659.25, 587.33]}
          stepDuration={0.32}
          cue={data.cue}
        />

        <main className="flex min-h-0 flex-1 items-stretch justify-center">
          {data.isLoading ? (
            <p className="self-center text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">
              Preparing maze…
            </p>
          ) : (
            <MazeRunnerBoard
              cells={data.data}
              rowTotal={data.rowTotal}
              colTotal={data.colTotal}
              player={data.player}
              goal={data.goal}
              hintPath={data.hintPath}
              onEditMazeRunnerMove={editMazeRunnerMove}
              onEditMazeRunnerRun={editMazeRunnerRun}
            />
          )}
        </main>

        <footer className="grid shrink-0 grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Moves</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.moveTotal}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Time</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.timeLabel}</span>
          </div>
          <button
            type="button"
            onClick={clearMazeRunnerLevel}
            className="rounded-xl bg-[#f2ede1] py-2 text-[12px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
          >
            Restart
          </button>
        </footer>
      </div>

      {data.isCleared || data.isTimeUp ? (
        <MazeRunnerResult
          isCleared={data.isCleared}
          levelLabel={data.levelLabel}
          timeLabel={data.timeLabel}
          moveTotal={data.moveTotal}
          onSubmitMazeRunnerNextLevel={submitMazeRunnerNextLevel}
          onClearMazeRunnerLevel={clearMazeRunnerLevel}
        />
      ) : null}
    </div>
  )
}
