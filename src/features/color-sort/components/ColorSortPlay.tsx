'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useColorSortStates } from '../states/colorSortStates'
import ColorSortHeader from './ColorSortHeader'
import ColorSortControls from './ColorSortControls'

const ColorSortBoard = dynamic(() => import('./ColorSortBoard'), { ssr: false })
const ColorSortAudio = dynamic(() => import('./ColorSortAudio'), { ssr: false })

export default function ColorSortPlay() {
  const {
    colorSortLevel,
    colorSortProgress,
    selectedBottle,
    activePours,
    moveHistory,
    isLevelCleared,
    setColorSortInit,
    setColorSortPour,
    setColorSortPourDone,
    setColorSortUndo,
    setColorSortShuffle,
    setColorSortAddBottle,
    setColorSortNextLevel,
    setColorSortRestart,
    setColorSortProgress,
  } = useColorSortStates()
  const [filters, setFilters] = useState({
    isShopOpen: false,
    isPauseOpen: false,
    isMusicOn: true,
    isSoundOn: true,
    isPageActive: true,
  })
  const data = useMemo(() => {
    const getStarTotal = (moveTotal: number, colorTotal: number) => {
      const par = Math.max(colorTotal * 2, 4)
      if (moveTotal <= par) return 3
      if (moveTotal <= Math.round(par * 1.6)) return 2
      return 1
    }

    const boosterPrice = 100
    const getBoosterState = (count: number, isUsable: boolean) => ({
      count,
      cost: count > 0 ? 0 : boosterPrice,
      isDisabled: !isUsable || (count <= 0 && (colorSortProgress.data?.coin ?? 0) < boosterPrice),
    })
    const getSealedTotal = () => {
      const bottles = level?.bottles ?? []
      return bottles.filter(
        (bottle) =>
          bottle.segments.length === bottle.capacity &&
          bottle.segments.every((segment) => segment.colorIndex === bottle.segments[0].colorIndex),
      ).length
    }

    const level = colorSortLevel.data
    const progress = colorSortProgress.data
    const moveTotal = moveHistory.length
    const colorTotal = level?.colorTotal ?? 0

    return {
      data: level?.bottles ?? [],
      isLoading: colorSortLevel.status === 'loading',
      isError: colorSortLevel.status === 'error',
      isEmpty: colorSortLevel.status === 'success' && !level?.bottles.length,
      emptyTitle: 'Level tidak tersedia',
      emptySubtitle: 'Reload the page to start a new game.',
      emptyImage: '',
      pagination: { currentPage: level?.level ?? 1, perPage: 1, totalItem: 0, totalPage: 0 },
      capacity: level?.capacity ?? 4,
      levelNumber: level?.level ?? 1,
      colorTotal,
      hiddenTotal: level?.hiddenTotal ?? 0,
      coin: progress?.coin ?? 0,
      undoLeft: progress?.undoLeft ?? 0,
      shuffleLeft: progress?.shuffleLeft ?? 0,
      addBottleLeft: progress?.addBottleLeft ?? 0,
      moveTotal,
      bestMove: progress?.bestMoves?.[String(level?.level ?? 1)] ?? 0,
      star: getStarTotal(moveTotal, colorTotal),
      isBoosterDisabled: !!activePours.length || isLevelCleared,
      undoBooster: getBoosterState(
        progress?.undoLeft ?? 0,
        !activePours.length && !isLevelCleared && !!moveTotal,
      ),
      shuffleBooster: getBoosterState(progress?.shuffleLeft ?? 0, !activePours.length && !isLevelCleared),
      addBottleBooster: getBoosterState(progress?.addBottleLeft ?? 0, !activePours.length && !isLevelCleared),
      isHintVisible: !moveTotal && !activePours.length && !isLevelCleared,
      isShopOpen: filters.isShopOpen,
      isPauseOpen: filters.isPauseOpen,
      isMusicOn: filters.isMusicOn,
      isSoundOn: filters.isSoundOn,
      isPageActive: filters.isPageActive,
      sealedTotal: getSealedTotal(),
      giantTotal: level?.giantTotal ?? 0,
      pourKey: activePours.length ? Math.max(...activePours.map((pour) => pour.id)) : 0,
      isCleared: isLevelCleared,
      clearedReward: 25 + (level?.level ?? 1) * 2,
    }
  }, [colorSortLevel, colorSortProgress, activePours, isLevelCleared, moveHistory, filters])
  const editColorSortBottle = (bottleId: number) => {
    setColorSortPour(bottleId)
  }
  const editColorSortPourDone = (pourId: number) => {
    setColorSortPourDone(pourId)
  }
  const loadColorSortShop = () => {
    setFilters((prev) => ({ ...prev, isShopOpen: !prev.isShopOpen, isPauseOpen: false }))
  }
  const loadColorSortPause = () => {
    setFilters((prev) => ({ ...prev, isPauseOpen: !prev.isPauseOpen, isShopOpen: false }))
  }
  const editColorSortMusic = () => {
    setFilters((prev) => ({ ...prev, isMusicOn: !prev.isMusicOn }))
  }
  const editColorSortSound = () => {
    setFilters((prev) => ({ ...prev, isSoundOn: !prev.isSoundOn }))
  }
  const editColorSortPageActive = (isPageActive: boolean) => {
    // Hanya menghentikan render & audio saat tab tidak aktif.
    // Dialog jeda tidak ikut dibuka: itu murni aksi tombol jeda.
    setFilters((prev) => ({ ...prev, isPageActive }))
  }
  const submitColorSortReward = () => {
    setColorSortProgress({
      coin: data.coin + 500,
      undoLeft: data.undoLeft + 3,
      shuffleLeft: data.shuffleLeft + 3,
      addBottleLeft: data.addBottleLeft + 3,
    })
    setFilters((prev) => ({ ...prev, isShopOpen: false }))
  }
  const submitColorSortNextLevel = () => {
    setColorSortNextLevel()
  }
  const clearColorSortLevel = () => {
    setColorSortRestart()
    setFilters((prev) => ({ ...prev, isPauseOpen: false }))
  }

  useEffect(() => {
    setColorSortInit()
  }, [setColorSortInit])
  useEffect(() => {
    const loadColorSortVisibility = () => {
      editColorSortPageActive(document.visibilityState === 'visible')
    }
    const clearColorSortPage = () => {
      editColorSortPageActive(false)
    }

    document.addEventListener('visibilitychange', loadColorSortVisibility)
    window.addEventListener('pagehide', clearColorSortPage)
    window.addEventListener('blur', clearColorSortPage)
    window.addEventListener('focus', loadColorSortVisibility)

    return () => {
      document.removeEventListener('visibilitychange', loadColorSortVisibility)
      window.removeEventListener('pagehide', clearColorSortPage)
      window.removeEventListener('blur', clearColorSortPage)
      window.removeEventListener('focus', loadColorSortVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative flex min-h-screen w-full justify-center bg-[#0a0a0b]">
      <ColorSortAudio
        isActive={data.isPageActive}
        isMusicOn={data.isMusicOn}
        isSoundOn={data.isSoundOn}
        pourKey={data.pourKey}
        sealedTotal={data.sealedTotal}
        isCleared={data.isCleared}
      />

      <main className="relative z-10 flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden">
        <ColorSortHeader
          level={data.levelNumber}
          coin={data.coin}
          star={data.star}
          undoBooster={data.undoBooster}
          addBottleBooster={data.addBottleBooster}
          onLoadColorSortShop={loadColorSortShop}
          onEditColorSortUndo={setColorSortUndo}
          onEditColorSortAddBottle={setColorSortAddBottle}
        />

        <section className="relative z-0 min-h-0 flex-1">
          {data.isLoading ? (
            <div className="flex h-full items-center justify-center text-sm font-black uppercase tracking-[0.3em] text-[#f2ede1]/50">
              Loading…
            </div>
          ) : (
            <ColorSortBoard
              isActive={data.isPageActive}
              bottles={data.data}
              selectedBottle={selectedBottle}
              activePours={activePours}
              onEditColorSortBottle={editColorSortBottle}
              onEditColorSortPourDone={editColorSortPourDone}
            />
          )}

          {data.isHintVisible ? (
            <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-[#26262b] bg-[#121214]/90 px-4 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a29d93] backdrop-blur-sm">
              Tap a bottle to pour
            </p>
          ) : null}
        </section>

        <ColorSortControls
          moveTotal={data.moveTotal}
          bestMove={data.bestMove}
          undoBooster={data.undoBooster}
          shuffleBooster={data.shuffleBooster}
          addBottleBooster={data.addBottleBooster}
          onEditColorSortUndo={setColorSortUndo}
          onEditColorSortShuffle={setColorSortShuffle}
          onEditColorSortAddBottle={setColorSortAddBottle}
          onLoadColorSortPause={loadColorSortPause}
        />

        {data.isCleared ? (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
            <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Level complete</p>
              <p className="mt-1 text-5xl font-black leading-none text-[#f2ede1] [font-family:'Arial_Black','Archivo_Black',system-ui]">
                {data.levelNumber}
              </p>
              <p className="mt-2 text-xl tracking-[0.2em] text-[#f0b429]">
                {'★'.repeat(data.star)}
                <span className="text-[#f2ede1]/15">{'★'.repeat(3 - data.star)}</span>
              </p>
              <p className="mt-3 inline-block rounded-md border border-[#3a3a42] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">
                {data.moveTotal} moves · +{data.clearedReward} koin
              </p>
              <button
                type="button"
                onClick={submitColorSortNextLevel}
                className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
              >
                Next level
              </button>
            </div>
          </div>
        ) : null}

        {data.isPauseOpen ? (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
            <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
              <p className="text-lg font-black uppercase tracking-[0.24em] text-[#f2ede1]">Pause</p>
              <button
                type="button"
                onClick={loadColorSortPause}
                className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={clearColorSortLevel}
                className="mt-3 w-full rounded-xl border border-[#3a3a42] py-3 text-[13px] font-medium text-[#f2ede1] transition-colors hover:border-[#f2ede1]"
              >
                Restart level
              </button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={editColorSortMusic}
                  className={`rounded-xl border py-2 text-[11px] font-medium transition-colors ${
                    data.isMusicOn
                      ? 'border-[#f2ede1] bg-[#f2ede1] text-[#0a0a0b]'
                      : 'border-[#3a3a42] text-[#a29d93]'
                  }`}
                >
                  Music: {data.isMusicOn ? 'On' : 'Off'}
                </button>
                <button
                  type="button"
                  onClick={editColorSortSound}
                  className={`rounded-xl border py-2 text-[11px] font-medium transition-colors ${
                    data.isSoundOn
                      ? 'border-[#f2ede1] bg-[#f2ede1] text-[#0a0a0b]'
                      : 'border-[#3a3a42] text-[#a29d93]'
                  }`}
                >
                  Sfx: {data.isSoundOn ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {data.isShopOpen ? (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
            <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
              <p className="text-lg font-black uppercase tracking-[0.18em] text-[#f2ede1]">Reward Pack</p>
              <p className="mt-2 text-[12px] font-medium text-[#9aa3b2]">
                500 coins + 3 of each booster
              </p>
              <button
                type="button"
                onClick={submitColorSortReward}
                className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
              >
                Claim free
              </button>
              <button
                type="button"
                onClick={loadColorSortShop}
                className="mt-3 w-full rounded-xl border border-[#3a3a42] py-3 text-[13px] font-medium text-[#f2ede1] transition-colors hover:border-[#f2ede1]"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
