'use client'

import Link from 'next/link'
import type { StoreGame } from '../types/storeTypes'
import StoreCover from './StoreCover'

interface Props {
  game: StoreGame
  onSubmitStoreGame: (gameId: string) => void
}

export default function StoreTile({ game, onSubmitStoreGame }: Props) {
  return (
    <Link
      href={game.path}
      onClick={() => onSubmitStoreGame(game.id)}
      className="group flex w-[84px] shrink-0 flex-col gap-1.5 sm:w-[96px]"
    >
      <span className="block aspect-square w-full overflow-hidden rounded-2xl border border-[#26262b] bg-[#121214] transition-colors group-hover:border-[#43434d]">
        <StoreCover gameId={game.id} tone={game.tone} accent={game.accent} />
      </span>
      <span className="line-clamp-2 text-[11px] font-semibold leading-snug text-[#f2ede1]">{game.name}</span>
    </Link>
  )
}
