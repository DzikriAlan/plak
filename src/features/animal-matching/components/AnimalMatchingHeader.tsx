'use client'

import Link from 'next/link'

import GameSoundToggle from '@/shared/components/reusable/GameSoundToggle'
import AnimalMatchingGauge from './AnimalMatchingGauge'

interface Props {
  level: number
  remainingTotal: number
  secondsLeft: number
  timeLimit: number
  isSoundOn: boolean
  onEditAnimalMatchingSound: () => void
}

export default function AnimalMatchingHeader({
  level,
  remainingTotal,
  secondsLeft,
  timeLimit,
  isSoundOn,
  onEditAnimalMatchingSound,
}: Props) {
  return (
    <header className="shrink-0 space-y-3">
      <div className="flex items-stretch gap-2">
        <Link
          href="/"
          aria-label="Back to Waitplay Game Collection"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#26262b] bg-[#121214] px-2 transition-colors hover:border-[#43434d] sm:px-3"
        >
          <span className="text-[10px] leading-none text-[#a29d93]">&#9664;</span>
          <span className="text-sm font-black uppercase leading-none tracking-tighter text-[#f2ede1] sm:text-base">
            Animals
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border border-[#26262b] bg-[#121214] px-2 py-1 sm:px-3">
          <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">
            Level {level}
          </span>
          <AnimalMatchingGauge secondsLeft={secondsLeft} timeLimit={timeLimit} />
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] px-2 py-2 sm:px-3">
          <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Left</span>
          <span className="text-lg font-black leading-none text-[#f2ede1]">{remainingTotal}</span>
        </div>

        <GameSoundToggle
          isSoundOn={isSoundOn}
          className="w-[38px] shrink-0"
          onEditGameSound={onEditAnimalMatchingSound}
        />
      </div>
    </header>
  )
}
