'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useGomokuStates } from '../states/gomokuStates'
import { useGameRoomsStates } from '@/features/game-rooms/states/gameRoomsStates'
import { useGameRoomsControllers } from '@/features/game-rooms/controllers/gameRoomsControllers'
import GameAudio, { type GameAudioCue } from '@/shared/components/reusable/GameAudio'
import GameTurnStatus from '@/shared/components/reusable/GameTurnStatus'
import GameExitConfirm from '@/shared/components/reusable/GameExitConfirm'
import GomokuHeader from './GomokuHeader'
import GomokuBoard from './GomokuBoard'
import GomokuResult from './GomokuResult'

const BOT_DELAY = 620

export default function GomokuPlay() {
  const { gomokuGame, setGomokuInit, setGomokuCell, setGomokuBot, setGomokuRestart } = useGomokuStates()
  const { gameRooms } = useGameRoomsStates()
  const { storeGameRooms } = useGameRoomsControllers()
  const router = useRouter()
  const [filters, setFilters] = useState({
    isExitOpen: false,
    isSoundOn: true,
    isInviting: false,
    lastPlayerScore: 0,
    cue: null as GameAudioCue | null,
    pagination: { currentPage: 1, perPage: 0, totalItem: 0, totalPage: 1 },
  })
  const data = useMemo(() => {
    const game = gomokuGame.data
    const cells = game?.cells ?? []

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
      isExitOpen: filters.isExitOpen,
      data: cells,
      isLoading: gomokuGame.status === 'loading',
      isError: gomokuGame.status === 'error',
      isEmpty: gomokuGame.status === 'success' && !cells.length,
      emptyTitle: 'Papan belum siap',
      emptySubtitle: 'Muat ulang halaman untuk memulai permainan baru.',
      emptyImage: '',
      pagination: { ...filters.pagination, perPage: cells.length, totalItem: cells.length },
      cells,
      size: game?.size ?? 0,
      turn,
      statusLabel: isFinished ? 'Permainan selesai' : turn === 'player' ? 'Giliranmu, taruh batu' : 'Bot sedang berpikir',
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
  }, [gomokuGame, filters])
  const submitGomokuCell = (cellIndex: number) => {
    setGomokuCell(cellIndex)
  }
  const submitGomokuInvite = () => {
    setFilters((prev) => ({ ...prev, isInviting: true }))
    storeGameRooms.mutate({ game: 'gomoku', name: 'Pemain 1' })
  }
  const editGomokuSound = () => {
    setFilters((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }))
  }
  const clearGomokuGame = () => {
    setFilters((prev) => ({ ...prev, lastPlayerScore: 0, cue: null }))
    setGomokuRestart()
  }

  const loadGomokuExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: true }))
  }
  const clearGomokuExit = () => {
    setFilters((prev) => ({ ...prev, isExitOpen: false }))
  }
  const submitGomokuExit = () => {
    // Sesi permainan berakhir begitu pemain benar-benar keluar dari halaman.
    window.location.href = '/'
  }
  useEffect(() => {
    setGomokuInit()
  }, [setGomokuInit])
  useEffect(() => {
    // Ruangan baru langsung dibuka setelah server mengirim kode dan kursi tuan rumah.
    const room = gameRooms.data
    if (!filters.isInviting || !room?.code || !room.token) return
    try {
      window.sessionStorage.setItem(`game-room-${room.code}`, room.token)
    } catch {
      /* penyimpanan bisa ditolak peramban, kursi tetap dikirim lewat permintaan gabung. */
    }
    router.push(`/gomoku/${room.code}`)
  }, [gameRooms.data, filters.isInviting, router])
  useEffect(() => {
    // Bot menunggu sebentar supaya langkahnya terlihat seperti lawan yang berpikir.
    if (data.turn !== 'bot' || data.isFinished) return
    const timer = window.setTimeout(() => setGomokuBot(), BOT_DELAY)
    return () => window.clearTimeout(timer)
  }, [data.turn, data.moveTotal, data.isFinished, setGomokuBot])
  useEffect(() => {
    // Bunyi diketuk saat pemain berhasil menaruh batu baru di papan.
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
        <GomokuHeader
          onLoadGomokuExit={loadGomokuExit}
          isSoundOn={data.isSoundOn}
          isInviteVisible
          isInviteLoading={data.isInviting}
          onSubmitGomokuInvite={submitGomokuInvite}
          onEditGomokuSound={editGomokuSound}
        />

        <GameAudio
          isActive
          isMusicOn={data.isSoundOn}
          isSoundOn={data.isSoundOn}
          bassScale={[87.31, 98, 116.54, 98]}
          leadScale={[349.23, 415.3, 466.16, 523.25, 466.16, 415.3, 392, 349.23]}
          stepDuration={0.36}
          cue={data.cue}
        />

        <GameTurnStatus label={data.statusLabel} isWaiting={data.isWaiting} />

        <main className="flex min-h-0 flex-1 items-stretch justify-center">
          {data.isLoading || !data.size ? (
            <p className="self-center text-xs font-semibold uppercase tracking-[0.3em] text-[#a29d93]">
              Menyiapkan papan…
            </p>
          ) : (
            <GomokuBoard
              cells={data.cells}
              size={data.size}
              turn={data.turn}
              playerScore={data.playerScore}
              botScore={data.botScore}
              onSubmitGomokuCell={submitGomokuCell}
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
            onClick={clearGomokuGame}
            className="rounded-xl bg-[#f2ede1] py-2 text-[12px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
          >
            Restart
          </button>
        </footer>
      </div>

      {data.isFinished ? (
        <GomokuResult
          resultLabel={data.resultLabel}
          playerScore={data.playerScore}
          botScore={data.botScore}
          moveTotal={data.moveTotal}
          onClearGomokuGame={clearGomokuGame}
        />
      ) : null}
      {data.isExitOpen ? (
        <GameExitConfirm
          title="Keluar dari permainan?"
          subtitle="Sesi permainan ini akan diakhiri dan kemajuanmu tidak disimpan."
          cancelLabel="Batal"
          confirmLabel="Keluar"
          onClearGameExit={clearGomokuExit}
          onSubmitGameExit={submitGomokuExit}
        />
      ) : null}
    </div>
  )
}
