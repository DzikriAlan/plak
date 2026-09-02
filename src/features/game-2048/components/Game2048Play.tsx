'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Game2048Direction } from '../types/game2048Types'
import { useGame2048States } from '../states/game2048States'
import GameAudio, { type GameAudioCue } from '@/shared/components/reusable/GameAudio'
import GameTurnStatus from '@/shared/components/reusable/GameTurnStatus'
import GameExitConfirm from '@/shared/components/reusable/GameExitConfirm'
import Game2048Header from './Game2048Header'
import Game2048Board from './Game2048Board'
import Game2048Controls from './Game2048Controls'
import Game2048Result from './Game2048Result'
import { useLocaleStates } from '@/shared/states/localeStates'
import type { LocaleCode } from '@/shared/states/localeStates'
import GameGuide from '@/shared/components/reusable/GameGuide'

const SWIPE_THRESHOLD = 24

export default function Game2048Play() {
  const { game2048Game, setGame2048Init, setGame2048Slide, setGame2048Restart } = useGame2048States()
  // Titik awal sentuhan disimpan di luar render supaya usapan tidak memicu render berulang.
  const swipeRef = useRef({ x: 0, y: 0, isDown: false })
  const { activeLocale, text, setLocale, setLocaleInit } = useLocaleStates()
  const [filters, setFilters] = useState({
    isGuideOpen: false,
    isExitOpen: false,
    isSoundOn: true,
    lastScore: 0,
    cue: null as GameAudioCue | null,
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const game = game2048Game.data
    const tiles = game?.tiles ?? []
    const isOver = !!game?.isOver
    const isWon = !!game?.isWon

    return {
      isGuideOpen: filters.isGuideOpen,
      guide: text.guide,
      guideText: text.guide.games.game2048,
      activeLocale,
      switchLabel: text.locale.switch,
      isExitOpen: filters.isExitOpen,
      data: tiles,
      isLoading: game2048Game.status === 'loading',
      isError: game2048Game.status === 'error',
      isEmpty: game2048Game.status === 'success' && !tiles.length,
      emptyTitle: 'Papan belum siap',
      emptySubtitle: 'Muat ulang halaman untuk memulai permainan baru.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: tiles.length, totalItem: tiles.length },
      tiles,
      size: game?.size ?? 0,
      score: game?.score ?? 0,
      bestScore: game?.bestScore ?? 0,
      moveTotal: game?.moveTotal ?? 0,
      topValue: game?.topValue ?? 0,
      // Penanda besar dipakai supaya pemain tahu papan masih bisa digeser atau sudah buntu.
      // Ketiga penanda dibuat sependek mungkin supaya tidak pernah pecah menjadi dua baris
      // dan menggeser posisi papan di tengah permainan.
      statusLabel: isOver ? 'Papan buntu' : isWon ? 'Ubin 2048 tercapai' : 'Geser untuk menggabungkan angka',
      isWaiting: isOver,
      hintLabel: 'Usap papan atau pakai tombol arah',
      isOver,
      isWon,
      resultLabel: isWon ? 'Kamu mencapai 2048' : 'Papan buntu',
      isSoundOn: filters.isSoundOn,
      cue: filters.cue,
    }
  }, [game2048Game, filters, text, activeLocale])
  const submitGame2048Slide = (direction: Game2048Direction) => {
    setGame2048Slide(direction)
  }
  const editGame2048Sound = () => {
    setFilters((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }))
  }
  const clearGame2048Game = () => {
    setFilters((prev) => ({ ...prev, lastScore: 0, cue: null }))
    setGame2048Restart()
  }

  const loadGame2048Guide = () => {
    setFilters((prev) => ({ ...prev, isGuideOpen: true }))
  }
  const clearGame2048Guide = () => {
    setFilters((prev) => ({ ...prev, isGuideOpen: false }))
  }
  const editGame2048Locale = (locale: string) => {
    setLocale(locale as LocaleCode)
  }
  const loadGame2048Exit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: true }))
  }
  const clearGame2048Exit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: false }))
  }
  const submitGame2048Exit = () => {
    // Sesi permainan berakhir begitu pemain benar-benar keluar dari halaman.
    window.location.href = '/'
  }
  useEffect(() => {
    // Pilihan bahasa baru dibaca di peramban supaya hasil render server tetap sama.
    setLocaleInit()
  }, [setLocaleInit])
  useEffect(() => {
    setGame2048Init()
  }, [setGame2048Init])
  useEffect(() => {
    // Papan tetap bisa dimainkan dengan papan ketik di layar lebar.
    const loadKeyboard = (event: KeyboardEvent) => {
      const directions: Record<string, Game2048Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      }
      const direction = directions[event.key]
      if (!direction) return
      event.preventDefault()
      setGame2048Slide(direction)
    }

    window.addEventListener('keydown', loadKeyboard)
    return () => window.removeEventListener('keydown', loadKeyboard)
  }, [setGame2048Slide])
  useEffect(() => {
    // Bunyi gabungan hanya dibunyikan saat skor benar-benar bertambah.
    setFilters((prev) =>
      data.score > prev.lastScore
        ? { ...prev, lastScore: data.score, cue: { id: Date.now(), kind: 'match' } }
        : { ...prev, lastScore: data.score },
    )
  }, [data.score])
  useEffect(() => {
    if (!data.isOver) return
    const kind = data.isWon ? 'win' : 'lose'
    setFilters((prev) => (prev.cue?.kind === kind ? prev : { ...prev, cue: { id: Date.now(), kind } }))
  }, [data.isOver, data.isWon])

  const loadGame2048SwipeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    swipeRef.current = { x: event.clientX, y: event.clientY, isDown: true }
  }
  const loadGame2048SwipeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!swipeRef.current.isDown) return
    const deltaX = event.clientX - swipeRef.current.x
    const deltaY = event.clientY - swipeRef.current.y
    swipeRef.current.isDown = false
    if (Math.abs(deltaX) < SWIPE_THRESHOLD && Math.abs(deltaY) < SWIPE_THRESHOLD) return

    // Sumbu dengan geseran terpanjang yang menentukan arah, seperti papan sentuh pada umumnya.
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setGame2048Slide(deltaX > 0 ? 'right' : 'left')
      return
    }
    setGame2048Slide(deltaY > 0 ? 'down' : 'up')
  }

  return (
    <div className="flex h-[100dvh] w-full touch-none items-stretch justify-center overflow-hidden overscroll-none bg-[#0a0a0b] p-2 sm:p-4">
      <div className="flex h-full w-full max-w-[480px] flex-col gap-3">
        <Game2048Header
          onLoadGame2048Exit={loadGame2048Exit}
          isSoundOn={data.isSoundOn}
          onLoadGame2048Guide={loadGame2048Guide}
          onEditGame2048Sound={editGame2048Sound}
        />

        <GameAudio
          isActive
          isMusicOn={data.isSoundOn}
          isSoundOn={data.isSoundOn}
          bassScale={[146.83, 164.81, 196, 164.81]}
          leadScale={[587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88, 523.25]}
          stepDuration={0.34}
          cue={data.cue}
        />

        <GameTurnStatus label={data.statusLabel} isWaiting={data.isWaiting} className="h-[38px] py-0" />

        <main
          className="flex min-h-0 flex-1 items-stretch justify-center"
          onPointerDown={loadGame2048SwipeStart}
          onPointerUp={loadGame2048SwipeEnd}
        >
          {data.isLoading || !data.size ? (
            <p className="self-center text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">
              Menyiapkan papan…
            </p>
          ) : (
            <Game2048Board tiles={data.tiles} size={data.size} score={data.score} bestScore={data.bestScore} />
          )}
        </main>

        <Game2048Controls
          hintLabel={data.hintLabel}
          isDisabled={data.isOver}
          onSubmitGame2048Slide={submitGame2048Slide}
        />

        <footer className="grid shrink-0 grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Langkah</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.moveTotal}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Tertinggi</span>
            <span className="text-[13px] font-black leading-none text-[#f2ede1]">{data.topValue}</span>
          </div>
          <button
            type="button"
            onClick={clearGame2048Game}
            className="rounded-xl bg-[#f2ede1] py-2 text-[12px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
          >
            Restart
          </button>
        </footer>
      </div>

      {data.isOver ? (
        <Game2048Result
          resultLabel={data.resultLabel}
          score={data.score}
          bestScore={data.bestScore}
          topValue={data.topValue}
          onClearGame2048Game={clearGame2048Game}
        />
      ) : null}
      {data.isExitOpen ? (
        <GameExitConfirm
          title="Keluar dari permainan?"
          subtitle="Sesi permainan ini akan diakhiri dan kemajuanmu tidak disimpan."
          cancelLabel="Batal"
          confirmLabel="Keluar"
          onClearGameExit={clearGame2048Exit}
          onSubmitGameExit={submitGame2048Exit}
        />
      ) : null}
      {data.isGuideOpen ? (
        <GameGuide
          title={data.guideText.title}
          goalLabel={data.guide.goalLabel}
          goal={data.guideText.goal}
          playLabel={data.guide.playLabel}
          play={data.guideText.play}
          winLabel={data.guide.winLabel}
          win={data.guideText.win}
          closeLabel={data.guide.close}
          activeLocale={data.activeLocale}
          switchLabel={data.switchLabel}
          onEditLocale={editGame2048Locale}
          onClearGameGuide={clearGame2048Guide}
        />
      ) : null}
    </div>
  )
}
