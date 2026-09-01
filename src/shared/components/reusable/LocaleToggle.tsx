'use client'

interface Props {
  activeLocale: string
  switchLabel: string
  className?: string
  onEditLocale: (locale: string) => void
}

const LOCALES = [
  { code: 'id', label: 'ID' },
  { code: 'en', label: 'EN' },
]

export default function LocaleToggle({ activeLocale, switchLabel, className = '', onEditLocale }: Props) {
  return (
    <div
      role="group"
      aria-label={switchLabel}
      className={`flex shrink-0 items-center gap-1 rounded-full border border-[#2e2e34] bg-[#131316] p-1 ${className}`}
    >
      {LOCALES.map((locale) => {
        const isActive = locale.code === activeLocale
        return (
          <button
            key={locale.code}
            type="button"
            aria-pressed={isActive}
            onClick={() => onEditLocale(locale.code)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              isActive ? 'bg-[#f2ede1] text-[#0a0a0b]' : 'text-[#a29d93] hover:text-[#f2ede1]'
            }`}
          >
            {locale.label}
          </button>
        )
      })}
    </div>
  )
}
