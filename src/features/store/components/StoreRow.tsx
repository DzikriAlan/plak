'use client'

import Link from 'next/link'
import type { StoreGame } from '../types/storeTypes'
import StoreCover from './StoreCover'

interface Props {
  game: StoreGame
  playLabel: string
  soonLabel: string
  minuteUnit: string
  playerUnit: string
  playersUnit: string
  onSubmitStoreGame: (gameId: string) => void
}

export default function StoreRow({
  game,
  playLabel,
  soonLabel,
  minuteUnit,
  playerUnit,
  playersUnit,
  onSubmitStoreGame,
}: Props) {
  // Satuan pemain mengikuti jumlahnya supaya bahasa Inggris tetap luwes dibaca.
  const getPlayerLabel = () => `${game.playerValue} ${game.playerValue === '1' ? playerUnit : playersUnit}`

  const infos = [
    {
      id: 'duration',
      label: `${game.durationValue} ${minuteUnit}`,
      icon: (
        <svg viewBox="0 0 16 16" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4.6V8l2.3 1.6" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'player',
      label: getPlayerLabel(),
      icon: (
        <svg viewBox="0 0 16 16" className="h-[13px] w-[13px]" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6.2" cy="6" r="2.6" />
          <path d="M2 13c0-2.2 1.9-3.6 4.2-3.6S10.4 10.8 10.4 13" strokeLinecap="round" />
          <path d="M11 4.2a2.4 2.4 0 0 1 0 4.4M12.4 13c0-1.6-.6-2.7-1.6-3.3" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  const cover = (
    <span className="block h-[58px] w-[58px] shrink-0 overflow-hidden rounded-2xl border border-[#26262b] bg-[#121214] sm:h-[76px] sm:w-[76px]">
      <StoreCover gameId={game.id} tone={game.tone} accent={game.accent} />
    </span>
  )
  const body = (
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[15px] font-black uppercase leading-tight tracking-tight text-[#f2ede1]">{game.name}</span>
      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-3">
        {infos.map((info) => (
          <span key={info.id} className="flex items-center gap-1 text-[10px] font-medium text-[#9aa3b2] sm:text-[11px]">
            {info.icon}
            {info.label}
          </span>
        ))}
      </span>
    </span>
  )

  if (!game.isAvailable) {
    return (
      <article className="flex w-full items-start gap-3 rounded-2xl p-2 opacity-60 sm:gap-4">
        {cover}
        {body}
        <span className="shrink-0 self-center rounded-lg border border-[#3a3a42] px-3 py-[6px] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a29d93]">
          {soonLabel}
        </span>
      </article>
    )
  }

  return (
    <Link
      href={game.path}
      onClick={() => onSubmitStoreGame(game.id)}
      className="group flex w-full items-start gap-2.5 rounded-2xl p-2 transition-colors hover:bg-[#121214] sm:gap-4"
    >
      {cover}
      {body}
      <span className="shrink-0 self-center rounded-lg border border-[#f2ede1] bg-[#f2ede1] px-3 py-[7px] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0a0a0b] transition-opacity group-active:opacity-80 sm:px-4 sm:py-2 sm:text-[11px]">
        {playLabel}
      </span>
    </Link>
  )
}
