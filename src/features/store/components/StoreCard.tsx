'use client'

import Link from 'next/link'
import type { StoreGame } from '../types/storeTypes'
import StoreCover from './StoreCover'

interface Props {
  game: StoreGame
}

export default function StoreCard({ game }: Props) {
  const shell =
    'flex h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#26262b] bg-[#121214] transition-colors'
  const badge =
    'absolute left-3 top-3 rounded-md bg-[#0a0a0b]/85 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f2ede1] backdrop-blur-sm'
  const modePill =
    'rounded-md border border-[#3a3a42] px-3 py-[6px] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a29d93]'

  const body = (
    <>
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-[#26262b]">
        <StoreCover gameId={game.id} tone={game.tone} accent={game.accent} />
        <span className={badge}>{game.categoryLabel}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-4 sm:p-5">
        <h2 className="text-[19px] font-black uppercase leading-none tracking-tight text-[#f2ede1]">{game.name}</h2>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a29d93]">{game.tagline}</p>
        <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-relaxed text-[#9aa3b2]">{game.description}</p>
      </div>
    </>
  )

  if (!game.isAvailable) {
    return (
      <article className={shell}>
        {body}
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
          <span className={modePill}>{game.modeLabel}</span>
          <span className="rounded-md border border-[#3a3a42] px-3 py-[6px] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a29d93]">
            Segera
          </span>
        </div>
      </article>
    )
  }

  return (
    <article className={`${shell} group hover:border-[#43434d]`}>
      {body}
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
        <span className={modePill}>{game.modeLabel}</span>
        <Link
          href={game.path}
          aria-label={`Main ${game.name}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f2ede1] text-[#f2ede1] transition-colors group-hover:bg-[#f2ede1] group-hover:text-[#0a0a0b]"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
