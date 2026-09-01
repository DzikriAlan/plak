'use client'

import Link from 'next/link'

import GameSoundToggle from '@/shared/components/reusable/GameSoundToggle'

interface Props {
  isSoundOn: boolean
  isInviteVisible?: boolean
  isInviteLoading?: boolean
  onSubmitCongklakInvite?: () => void
  onEditCongklakSound: () => void
}

export default function CongklakHeader({
  isSoundOn,
  isInviteVisible = false,
  isInviteLoading = false,
  onSubmitCongklakInvite,
  onEditCongklakSound,
}: Props) {
  return (
    <header className="shrink-0 space-y-3">
      <div className="flex min-h-[48px] items-stretch gap-2">
        <Link
          href="/"
          aria-label="Back to Waitplay Game Store"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#26262b] bg-[#121214] px-2 transition-colors hover:border-[#43434d] sm:px-3"
        >
          <span className="text-[10px] leading-none text-[#a29d93]">&#9664;</span>
          <span className="text-sm font-black uppercase leading-none tracking-tighter text-[#f2ede1] sm:text-base">
            Congklak
          </span>
        </Link>

        {isInviteVisible ? (
          <button
            type="button"
            disabled={isInviteLoading}
            onClick={onSubmitCongklakInvite}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#26262b] bg-[#121214] px-2 text-[#f2ede1] transition-colors hover:border-[#43434d] disabled:opacity-45"
          >
            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="8.5" r="3.2" />
              <path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" strokeLinecap="round" />
              <path d="M18 8v6M21 11h-6" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em]">
              {isInviteLoading ? 'Menyiapkan…' : 'Main berdua'}
            </span>
          </button>
        ) : (
          <div className="flex-1" />
        )}

        <GameSoundToggle isSoundOn={isSoundOn} className="w-[38px] shrink-0" onEditGameSound={onEditCongklakSound} />
      </div>
    </header>
  )
}
