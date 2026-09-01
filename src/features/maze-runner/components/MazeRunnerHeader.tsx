'use client'

import Link from 'next/link'

import GameSoundToggle from '@/shared/components/reusable/GameSoundToggle'

interface Props {
  level: number
  timeLabel: string
  hintLabel: string
  goalLabel: string
  isHintDisabled: boolean
  isSoundOn: boolean
  onLoadMazeRunnerHint: () => void
  onEditMazeRunnerSound: () => void
}

export default function MazeRunnerHeader({
  level,
  timeLabel,
  hintLabel,
  goalLabel,
  isHintDisabled,
  isSoundOn,
  onLoadMazeRunnerHint,
  onEditMazeRunnerSound,
}: Props) {
  return (
    <header className="shrink-0 space-y-3">
      <div className="flex items-stretch gap-2">
        <Link
          href="/"
          aria-label="Back to Waitplay Game Store"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#26262b] bg-[#121214] px-2 transition-colors hover:border-[#43434d] sm:px-3"
        >
          <span className="text-[10px] leading-none text-[#a29d93]">&#9664;</span>
          <span className="text-sm font-black uppercase leading-none tracking-tighter text-[#f2ede1] sm:text-base">
            Labirin
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border border-[#26262b] bg-[#121214] px-2 py-1 sm:px-3">
          <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">
            Level {level}
          </span>
          <span className="hidden truncate text-[8px] font-semibold uppercase tracking-[0.2em] text-[#a29d93] sm:inline">
            {goalLabel}
          </span>
          <span className="shrink-0 text-xs font-black leading-none text-[#f0b429] sm:text-sm">{timeLabel}</span>
        </div>

        <button
          type="button"
          disabled={isHintDisabled}
          onClick={onLoadMazeRunnerHint}
          className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] px-2 py-2 transition-colors hover:border-[#43434d] disabled:opacity-45 sm:px-3"
        >
          <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">Hint</span>
          <span className="text-lg font-black leading-none text-[#f2ede1]">{hintLabel}</span>
        </button>

        <GameSoundToggle
          isSoundOn={isSoundOn}
          className="w-[38px] shrink-0"
          onEditGameSound={onEditMazeRunnerSound}
        />
      </div>
    </header>
  )
}
