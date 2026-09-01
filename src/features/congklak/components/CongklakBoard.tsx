'use client'

import type { CongklakHole as CongklakHoleType } from '../types/congklakTypes'
import CongklakHole from './CongklakHole'

interface Props {
  playerHoles: CongklakHoleType[]
  botHoles: CongklakHoleType[]
  playerStore: CongklakHoleType
  botStore: CongklakHoleType
  turn: string
  onSubmitCongklakHole: (holeIndex: number) => void
}

export default function CongklakBoard({
  playerHoles,
  botHoles,
  playerStore,
  botStore,
  turn,
  onSubmitCongklakHole,
}: Props) {
  // Baris papan dibaca dari atas: lubang lawan naik ke rumahnya, lubang pemain turun ke rumahnya.
  const getRows = () =>
    playerHoles.map((hole, index) => ({
      id: hole.index,
      rival: botHoles[botHoles.length - 1 - index],
      own: hole,
    }))

  const rows = getRows()
  // Tujuh baris dibagi rata pada sisa tinggi papan supaya lubang tidak pernah menabrak rumah.
  const rowsStyle = { gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))` }
  const countClass = 'w-5 shrink-0 text-[13px] font-black leading-none tabular-nums sm:w-6 sm:text-[15px]'
  const getStoreBorder = (isActive: boolean) => (isActive ? 'border-[#f2ede1]' : 'border-[#26262b]')
  // Rumah pihak yang tidak berjalan tetap memakai warnanya, hanya diredupkan sebagai penanda giliran.
  const getStoreState = (isOwnTurn: boolean) => (isOwnTurn ? 'opacity-100' : 'opacity-40')
  const isPlayerTurn = turn === 'player'

  return (
    <div className="flex h-full w-full flex-col gap-2 rounded-2xl border border-[#26262b] bg-[#121214] p-3">
      <div
        className={`rounded-xl border-2 bg-[#6d4bc4] py-2 text-center transition-opacity ${getStoreState(
          !isPlayerTurn,
        )} ${getStoreBorder(botStore.isActive)}`}
      >
        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0b]">Rumah Bot</p>
        <p className="text-[26px] font-black leading-none text-[#0a0a0b]">{botStore.seedTotal}</p>
      </div>

      <div className="grid min-h-0 flex-1 gap-[6px] overflow-hidden py-1" style={rowsStyle}>
        {rows.map((row) => (
          <div key={row.id} className="grid min-h-0 grid-cols-2 gap-3 sm:gap-5">
            <div className="flex min-h-0 items-center justify-center gap-2">
              <span className={`${countClass} text-right text-[#8f7ad8]`}>{row.rival.seedTotal}</span>
              <CongklakHole hole={row.rival} onSubmitCongklakHole={onSubmitCongklakHole} />
            </div>
            <div className="flex min-h-0 items-center justify-center gap-2">
              <CongklakHole hole={row.own} onSubmitCongklakHole={onSubmitCongklakHole} />
              <span className={`${countClass} text-left text-[#f0b429]`}>{row.own.seedTotal}</span>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`rounded-xl border-2 bg-[#f0b429] py-2 text-center transition-opacity ${getStoreState(
          isPlayerTurn,
        )} ${getStoreBorder(playerStore.isActive)}`}
      >
        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0b]">Rumah Kamu</p>
        <p className="text-[26px] font-black leading-none text-[#0a0a0b]">{playerStore.seedTotal}</p>
      </div>
    </div>
  )
}
