'use client'

import LocaleToggle from '@/shared/components/reusable/LocaleToggle'

interface Props {
  tagline: string
  activeLocale: string
  switchLabel: string
  onEditStoreLocale: (locale: string) => void
}

export default function StoreHeader({ tagline, activeLocale, switchLabel, onEditStoreLocale }: Props) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[38px] font-black uppercase leading-[0.82] tracking-[-0.04em] text-[#f2ede1] min-[360px]:text-[46px] sm:text-[64px] lg:text-[88px]">
          Waitplay
        </p>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#f2ede1]/85 sm:mt-2 sm:text-[13px] sm:tracking-[0.42em]">
          Game Store
        </p>
        <p className="mt-3 max-w-[34ch] whitespace-pre-line text-[12px] font-medium leading-snug text-[#9aa3b2] sm:mt-5 sm:text-[15px] sm:leading-relaxed">
          {tagline}
        </p>
      </div>

      <LocaleToggle
        activeLocale={activeLocale}
        switchLabel={switchLabel}
        className="mt-1"
        onEditLocale={onEditStoreLocale}
      />
    </header>
  )
}
