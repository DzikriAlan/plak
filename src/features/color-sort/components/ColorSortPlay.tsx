'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useColorSortStates } from '../states/colorSortStates'
import ColorSortHeader from './ColorSortHeader'
import ColorSortControls from './ColorSortControls'

const ColorSortBoard = dynamic(() => import('./ColorSortBoard'), { ssr: false })
const ColorSortStars = dynamic(() => import('./ColorSortStars'), { ssr: false })
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
      emptySubtitle: 'Coba muat ulang halaman untuk memulai permainan.',
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
      praiseMessage: ((level?.level ?? 1) - 1) % 3 === 0 ? 'WIH AYU JAGO BANGET' : '',
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
    setFilters((prev) => ({ ...prev, isPageActive, isPauseOpen: isPageActive ? prev.isPauseOpen : true }))
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
    <div className="relative flex min-h-screen w-full justify-center bg-black">
      <ColorSortStars isActive={data.isPageActive} />
      <ColorSortAudio
        isActive={data.isPageActive}
        isMusicOn={data.isMusicOn}
        isSoundOn={data.isSoundOn}
        pourKey={data.pourKey}
        sealedTotal={data.sealedTotal}
        isCleared={data.isCleared}
      />

      <aside className="absolute left-6 top-1/2 hidden h-[600px] w-[300px] -translate-y-1/2 lg:block xl:left-10">
        <div className="flex h-full w-full items-center justify-center border-[3px] border-[#f2e9d8]/40 bg-[#0b0b0d]/80 text-center text-xs font-black uppercase tracking-[0.2em] text-[#f2e9d8]/50 shadow-[6px_6px_0_rgba(242,233,216,0.15)]">
          AD SLOT
          <br />
          300x600
        </div>
      </aside>

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
            <div className="flex h-full items-center justify-center text-sm font-black uppercase tracking-[0.3em] text-[#f2e9d8]/60">
              Memuat…
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
            <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 border-[3px] border-black bg-[#f2e9d8] px-3 py-[2px] text-center text-[10px] font-black uppercase leading-tight tracking-[0.12em] text-black shadow-[3px_3px_0_#000]">
              Pilih botol untuk menuang
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
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 px-6">
            <div className="w-full border-[3px] border-black bg-[#f2e9d8] p-6 text-center shadow-[8px_8px_0_#ff5a1f]">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Level Selesai</p>
              <p className="mt-1 text-5xl font-black leading-none text-black [font-family:'Arial_Black','Archivo_Black',system-ui]">
                {data.levelNumber}
              </p>
              <p className="mt-2 text-xl tracking-[0.2em] text-black">
                {'★'.repeat(data.star)}
                <span className="text-black/20">{'★'.repeat(3 - data.star)}</span>
              </p>
              <p className="mt-2 inline-block border-[3px] border-black bg-[#ffd23f] px-2 text-[10px] font-black uppercase tracking-[0.1em] text-black">
                {data.moveTotal} moves · +{data.clearedReward} koin
              </p>
              {data.praiseMessage ? (
                <p className="mx-auto mt-3 -rotate-1 border-[3px] border-black bg-[#ff5a1f] px-3 py-1 text-sm font-black uppercase tracking-[0.08em] text-[#f2e9d8] shadow-[4px_4px_0_#000]">
                  {data.praiseMessage}
                </p>
              ) : null}
              <button
                type="button"
                onClick={submitColorSortNextLevel}
                className="mt-5 w-full border-[3px] border-black bg-[#ff5a1f] py-3 text-sm font-black uppercase tracking-[0.1em] text-black shadow-[5px_5px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Level Berikutnya
              </button>
            </div>
          </div>
        ) : null}

        {data.isPauseOpen ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 px-6">
            <div className="w-full border-[3px] border-black bg-[#f2e9d8] p-6 text-center shadow-[8px_8px_0_#2ec4b6]">
              <p className="text-2xl font-black uppercase tracking-[0.25em] text-black">Jeda</p>
              <button
                type="button"
                onClick={loadColorSortPause}
                className="mt-5 w-full border-[3px] border-black bg-[#3a86ff] py-3 text-sm font-black uppercase tracking-[0.1em] text-black shadow-[5px_5px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Lanjutkan
              </button>
              <button
                type="button"
                onClick={clearColorSortLevel}
                className="mt-3 w-full border-[3px] border-black bg-[#8b5cf6] py-3 text-sm font-black uppercase tracking-[0.1em] text-black shadow-[5px_5px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Ulangi Level
              </button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={editColorSortMusic}
                  className={`border-[3px] border-black py-2 text-[10px] font-black uppercase tracking-[0.1em] text-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                    data.isMusicOn ? 'bg-[#2ec4b6]' : 'bg-[#f2e9d8]'
                  }`}
                >
                  Musik: {data.isMusicOn ? 'On' : 'Off'}
                </button>
                <button
                  type="button"
                  onClick={editColorSortSound}
                  className={`border-[3px] border-black py-2 text-[10px] font-black uppercase tracking-[0.1em] text-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                    data.isSoundOn ? 'bg-[#ffd23f]' : 'bg-[#f2e9d8]'
                  }`}
                >
                  Sfx: {data.isSoundOn ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {data.isShopOpen ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 px-6">
            <div className="w-full border-[3px] border-black bg-[#f2e9d8] p-6 text-center shadow-[8px_8px_0_#ffd23f]">
              <p className="text-xl font-black uppercase tracking-[0.15em] text-black">Paket Hadiah</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-black/70">
                500 koin + 3 booster tiap jenis
              </p>
              <button
                type="button"
                onClick={submitColorSortReward}
                className="mt-5 w-full border-[3px] border-black bg-[#ffd23f] py-3 text-sm font-black uppercase tracking-[0.1em] text-black shadow-[5px_5px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Klaim Gratis
              </button>
              <button
                type="button"
                onClick={loadColorSortShop}
                className="mt-3 w-full border-[3px] border-black bg-[#f2e9d8] py-2 text-[10px] font-black uppercase tracking-[0.1em] text-black"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </main>

      <aside className="absolute right-6 top-1/2 hidden h-[600px] w-[300px] -translate-y-1/2 lg:block xl:right-10">
        <div className="flex h-full w-full items-center justify-center border-[3px] border-[#f2e9d8]/40 bg-[#0b0b0d]/80 text-center text-xs font-black uppercase tracking-[0.2em] text-[#f2e9d8]/50 shadow-[6px_6px_0_rgba(242,233,216,0.15)]">
          AD SLOT
          <br />
          300x600
        </div>
      </aside>
    </div>
  )
}
