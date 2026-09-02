'use client'

import GameSoundToggle from '@/shared/components/reusable/GameSoundToggle'

interface Props {
  onLoadRubikExit: () => void
  isSoundOn: boolean
  onEditRubikSound: () => void
}

export default function RubikHeader({
  onLoadRubikExit,
  isSoundOn,
  onEditRubikSound,
}: Props) {
  return (
    <header className="shrink-0 space-y-3">
      <div className="flex min-h-[48px] items-stretch gap-2">
        <button
          type="button"
          onClick={onLoadRubikExit}
          aria-label="Back to Waitplay Game Collection"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#26262b] bg-[#121214] px-2 transition-colors hover:border-[#43434d] sm:px-3"
        >
          <span className="text-[10px] leading-none text-[#a29d93]">&#9664;</span>
          <span className="text-sm font-black uppercase leading-none tracking-tighter text-[#f2ede1] sm:text-base">
            Rubik 3D
          </span>
        </button>

        <div className="flex-1" />

        <GameSoundToggle isSoundOn={isSoundOn} className="w-[38px] shrink-0" onEditGameSound={onEditRubikSound} />
      </div>
    </header>
  )
}
