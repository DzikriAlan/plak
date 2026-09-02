'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useDotsAndBoxesStates } from '../states/dotsAndBoxesStates'
import { useGameRoomsStates } from '@/features/game-rooms/states/gameRoomsStates'
import { useGameRoomsControllers } from '@/features/game-rooms/controllers/gameRoomsControllers'
import GameAudio, { type GameAudioCue } from '@/shared/components/reusable/GameAudio'
import GameTurnStatus from '@/shared/components/reusable/GameTurnStatus'
import GameExitConfirm from '@/shared/components/reusable/GameExitConfirm'
import DotsAndBoxesHeader from './DotsAndBoxesHeader'
import DotsAndBoxesBoard from './DotsAndBoxesBoard'
import DotsAndBoxesResult from './DotsAndBoxesResult'
import { useLocaleStates } from '@/shared/states/localeStates'
import type { LocaleCode } from '@/shared/states/localeStates'
import GameGuide from '@/shared/components/reusable/GameGuide'

const BOT_DELAY = 620

export default function DotsAndBoxesPlay() {
  const { dotsAndBoxesGame, setDotsAndBoxesInit, setDotsAndBoxesLine, setDotsAndBoxesBot, setDotsAndBoxesRestart } =
    useDotsAndBoxesStates()
  const { gameRooms } = useGameRoomsStates()
  const { storeGameRooms } = useGameRoomsControllers()
  const router = useRouter()
  const { activeLocale, text, setLocale, setLocaleInit } = useLocaleStates()
  const [filters, setFilters] = useState({
    isGuideOpen: false,
    isExitOpen: false,
    isSoundOn: true,
    isInviting: false,
    lastPlayerScore: 0,
    cue: null as GameAudioCue | null,
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const game = dotsAndBoxesGame.data
    const lines = game?.lines ?? []

    const getResultLabel = (winner: string) => {
      if (winner === 'player') return 'Kamu menang'
      if (winner === 'bot') return 'Bot menang'
      return 'Seri'
    }
    const turn = game?.turn ?? 'player'
    const isFinished = !!game?.isFinished
    const playerScore = game?.playerScore ?? 0
    const botScore = game?.botScore ?? 0

    return {
      isGuideOpen: filters.isGuideOpen,
      guide: text.guide,
      guideText: text.guide.games.dotsAndBoxes,
      activeLocale,
      switchLabel: text.locale.switch,
      isExitOpen: filters.isExitOpen,
      data: lines,
      isLoading: dotsAndBoxesGame.status === 'loading',
      isError: dotsAndBoxesGame.status === 'error',
      isEmpty: dotsAndBoxesGame.status === 'success' && !lines.length,
      emptyTitle: 'Papan belum siap',
      emptySubtitle: 'Muat ulang halaman untuk memulai permainan baru.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: lines.length, totalItem: lines.length },
      lines,
      boxes: game?.boxes ?? [],
      dotTotal: game?.dotTotal ?? 0,
      turn,
      statusLabel: isFinished ? 'Permainan selesai' : turn === 'player' ? 'Giliranmu, tarik garis' : 'Bot sedang berpikir',
      isWaiting: !isFinished && turn !== 'player',
      scoreLabel: `${playerScore} : ${botScore}`,
      playerScore,
      botScore,
      moveTotal: game?.moveTotal ?? 0,
      isFinished,
      resultLabel: getResultLabel(game?.winner ?? ''),
      winner: game?.winner ?? '',
      isSoundOn: filters.isSoundOn,
      isInviting: filters.isInviting,
      cue: filters.cue,
    }
  }, [dotsAndBoxesGame, filters, text, activeLocale])
  const submitDotsAndBoxesLine = (lineIndex: number) => {
    setDotsAndBoxesLine(lineIndex)
  }
  const submitDotsAndBoxesInvite = () => {
    setFilters((prev) => ({ ...prev, isInviting: true }))
    storeGameRooms.mutate({ game: 'dots-and-boxes', name: 'Pemain 1' })
  }
  const editDotsAndBoxesSound = () => {
    setFilters((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }))
  }
  const clearDotsAndBoxesGame = () => {
    setFilters((prev) => ({ ...prev, lastPlayerScore: 0, cue: null }))
    setDotsAndBoxesRestart()
  }

  const loadDotsAndBoxesGuide = () => {
    setFilters((prev) => ({ ...prev, isGuideOpen: true }))
  }
  const clearDotsAndBoxesGuide = () => {
    setFilters((prev) => ({ ...prev, isGuideOpen: false }))
  }
  const editDotsAndBoxesLocale = (locale: string) => {
    setLocale(locale as LocaleCode)
  }
  const loadDotsAndBoxesExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: true }))
  }
  const clearDotsAndBoxesExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: false }))
  }
  const submitDotsAndBoxesExit = () => {
    // Sesi permainan berakhir begitu pemain benar-benar keluar dari halaman.
    window.location.href = '/'
  }
  useEffect(() => {
    // Pilihan bahasa baru dibaca di peramban supaya hasil render server tetap sama.
    setLocaleInit()
  }, [setLocaleInit])
  useEffect(() => {
    setDotsAndBoxesInit()
  }, [setDotsAndBoxesInit])
  useEffect(() => {
    // Ruangan baru langsung dibuka setelah server mengirim kode dan kursi tuan rumah.
    const room = gameRooms.data
    if (!filters.isInviting || !room?.code || !room.token) return
    try {
      window.sessionStorage.setItem(`game-room-${room.code}`, room.token)
    } catch {
      /* penyimpanan bisa ditolak peramban, kursi tetap dikirim lewat permintaan gabung. */
    }
    router.push(`/dots-and-boxes/${room.code}`)
  }, [gameRooms.data, filters.isInviting, router])
  useEffect(() => {
    // Bot menunggu sebentar supaya langkahnya terlihat seperti lawan yang berpikir.
    if (data.turn !== 'bot' || data.isFinished) return
    const timer = window.setTimeout(() => setDotsAndBoxesBot(), BOT_DELAY)
    return () => window.clearTimeout(timer)
  }, [data.turn, data.moveTotal, data.isFinished, setDotsAndBoxesBot])
  useEffect(() => {
    // Bunyi tembakan hanya dibunyikan saat pemain berhasil menutup kotak baru.
    setFilters((prev) =>
      data.playerScore > prev.lastPlayerScore
        ? { ...prev, lastPlayerScore: data.playerScore, cue: { id: Date.now(), kind: 'capture' } }
        : { ...prev, lastPlayerScore: data.playerScore },
    )
  }, [data.playerScore])
  useEffect(() => {
    if (!data.isFinished) return
    const kind = data.winner === 'bot' ? 'lose' : 'win'
    setFilters((prev) => (prev.cue?.kind === kind ? prev : { ...prev, cue: { id: Date.now(), kind } }))
  }, [data.isFinished, data.winner])

  return (
    <div className="flex h-[100dvh] w-full touch-none items-stretch justify-center overflow-hidden overscroll-none bg-[#0a0a0b] p-2 sm:p-4">
      <div className="flex h-full w-full max-w-[480px] flex-col gap-3">
        <DotsAndBoxesHeader
          onLoadDotsAndBoxesExit={loadDotsAndBoxesExit}
          isSoundOn={data.isSoundOn}
          isInviteVisible
          isInviteLoading={data.isInviting}
          onSubmitDotsAndBoxesInvite={submitDotsAndBoxesInvite}
          onLoadDotsAndBoxesGuide={loadDotsAndBoxesGuide}
          onEditDotsAndBoxesSound={editDotsAndBoxesSound}
        />

        <GameAudio
          isActive
          isMusicOn={data.isSoundOn}
          isSoundOn={data.isSoundOn}
          bassScale={[110, 130.81, 146.83, 130.81]}
          leadScale={[392, 440, 523.25, 587.33, 523.25, 440, 392, 349.23]}
          stepDuration={0.32}
          cue={data.cue}
        />

        <GameTurnStatus label={data.statusLabel} isWaiting={data.isWaiting} />

        <main className="flex min-h-0 flex-1 items-stretch justify-center">
          {data.isLoading || !data.dotTotal ? (
            <p className="self-center text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">
              Menyiapkan papan…
            </p>
          ) : (
            <DotsAndBoxesBoard
              lines={data.lines}
              boxes={data.boxes}
              dotTotal={data.dotTotal}
              turn={data.turn}
              playerScore={data.playerScore}
              botScore={data.botScore}
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
          <button
            type="button"
            onClick={clearDotsAndBoxesGame}
            className="rounded-xl bg-[#f2ede1] py-2 text-[12px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
          >
            Restart
          </button>
        </footer>
      </div>

      {data.isFinished ? (
        <DotsAndBoxesResult
          resultLabel={data.resultLabel}
          playerScore={data.playerScore}
          botScore={data.botScore}
          moveTotal={data.moveTotal}
          onClearDotsAndBoxesGame={clearDotsAndBoxesGame}
        />
      ) : null}
      {data.isExitOpen ? (
        <GameExitConfirm
          title="Keluar dari permainan?"
          subtitle="Sesi permainan ini akan diakhiri dan kemajuanmu tidak disimpan."
          cancelLabel="Batal"
          confirmLabel="Keluar"
          onClearGameExit={clearDotsAndBoxesExit}
          onSubmitGameExit={submitDotsAndBoxesExit}
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
          onEditLocale={editDotsAndBoxesLocale}
          onClearGameGuide={clearDotsAndBoxesGuide}
        />
      ) : null}
    </div>
  )
}
