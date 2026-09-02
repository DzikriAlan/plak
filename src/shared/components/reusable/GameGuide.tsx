'use client'

import LocaleToggle from './LocaleToggle'

interface Props {
  title: string
  goalLabel: string
  goal: string
  playLabel: string
  play: string[]
  winLabel: string
  win: string[]
  closeLabel: string
  activeLocale: string
  switchLabel: string
  onEditLocale: (locale: string) => void
  onClearGameGuide: () => void
}

export default function GameGuide({
  title,
  goalLabel,
  goal,
  playLabel,
  play,
  winLabel,
  win,
  closeLabel,
  activeLocale,
  switchLabel,
  onEditLocale,
  onClearGameGuide,
}: Props) {
  const sections = [
    { id: 'play', label: playLabel, items: play, isOrdered: true },
    { id: 'win', label: winLabel, items: win, isOrdered: false },
  ]

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 px-6 backdrop-blur-sm">
      <div className="flex max-h-[86dvh] w-full max-w-[380px] flex-col rounded-2xl border border-[#26262b] bg-[#121214]">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#26262b] p-4">
          <p className="min-w-0 truncate text-[15px] font-black uppercase leading-none tracking-tight text-[#f2ede1]">
            {title}
          </p>
          <LocaleToggle activeLocale={activeLocale} switchLabel={switchLabel} onEditLocale={onEditLocale} />
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className="rounded-xl border border-[#26262b] bg-[#0a0a0b] p-3">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">{goalLabel}</p>
            <p className="mt-1 text-[12px] leading-snug text-[#f2ede1]">{goal}</p>
          </div>

          {sections.map((section) => (
            <div key={section.id}>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#a29d93]">{section.label}</p>
              <ul className="mt-2 space-y-2">
                {section.items.map((item, index) => (
                  <li key={item} className="flex gap-2">
                    <span
                      className={`mt-[1px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full text-[9px] font-black leading-none ${
                        section.isOrdered ? 'bg-[#26262b] text-[#f2ede1]' : 'bg-[#f0b429] text-[#0a0a0b]'
                      }`}
                    >
                      {section.isOrdered ? index + 1 : '★'}
                    </span>
                    <span className="text-[12px] leading-snug text-[#c9c2b2]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-[#26262b] p-4">
          <button
            type="button"
            onClick={onClearGameGuide}
            className="w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
