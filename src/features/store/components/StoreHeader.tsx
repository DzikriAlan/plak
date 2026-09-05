'use client'

import LocaleToggle from '@/shared/components/reusable/LocaleToggle'
import AuthStatus from '@/features/auth/components/AuthStatus'

interface Props {
  activeLocale: string
  switchLabel: string
  onEditStoreLocale: (locale: string) => void
}

export default function StoreHeader({ activeLocale, switchLabel, onEditStoreLocale }: Props) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[38px] font-black uppercase leading-[0.82] tracking-[-0.04em] text-[#f2ede1] min-[360px]:text-[46px] sm:text-[56px] lg:text-[68px]">
          Waitplay
        </p>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#f2ede1]/85 sm:mt-2 sm:text-[12px] sm:tracking-[0.4em]">
          Game Collection
        </p>
      </div>

      <div className="mt-1 flex shrink-0 items-center gap-3">
        <AuthStatus />
        <LocaleToggle activeLocale={activeLocale} switchLabel={switchLabel} onEditLocale={onEditStoreLocale} />
      </div>
    </header>
  )
}
