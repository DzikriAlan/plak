'use client'

import type { UnoCard as UnoCardType, UnoColor } from '../types/unoTypes'
import UnoCard from './UnoCard'
import UnoOpponent from './UnoOpponent'

interface Opponent {
  id: number
  name: string
  cardTotal: number
  tone: string
  isActive: boolean
}

interface Props {
  opponents: Opponent[]
  topCard: UnoCardType | null
  activeColor: UnoColor
  lastAction: string
  drawTotal: number
  isDrawDisabled: boolean
  onLoadUnoDraw: () => void
}

const ACTIVE_TONE: Record<UnoColor, string> = {
  red: 'bg-[#e8202a]',
  yellow: 'bg-[#f7c600]',
  green: 'bg-[#23a94a]',
  blue: 'bg-[#2f5ce0]',
}

export default function UnoBoard({
  opponents,
  topCard,
  activeColor,
  lastAction,
  drawTotal,
  isDrawDisabled,
  onLoadUnoDraw,
}: Props) {
  return (
    <section className="relative flex min-h-0 flex-1 flex-col gap-2 px-3 py-3">
      <div className="flex shrink-0 items-stretch gap-2">
        {opponents.map((opponent) => (
          <UnoOpponent
            key={opponent.id}
            name={opponent.name}
            cardTotal={opponent.cardTotal}
            tone={opponent.tone}
            isActive={opponent.isActive}
          />
        ))}
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center gap-4">
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-[150px] w-[190px] -translate-x-1/2 -translate-y-1/2 -rotate-2 rounded-3xl bg-[#8b5cf6]/25 blur-[2px]" />

        <button
          type="button"
          disabled={isDrawDisabled}
          onClick={onLoadUnoDraw}
          aria-label="Draw a card from the pile"
          className="relative shrink-0 active:translate-y-[2px] disabled:opacity-50"
        >
          <span className="absolute -left-1 -top-1 block h-[78px] w-[52px] rounded-lg border border-[#3a3a42] bg-[#1b1b1f]" />
          <span className="absolute -left-[2px] -top-[2px] block h-[78px] w-[52px] rounded-lg border border-[#3a3a42] bg-[#141416]" />
          <span className="relative block">
            <UnoCard card={null} isBack size="md" />
          </span>
          <span className="mt-2 block rounded-md border border-[#3a3a42] px-1 text-center text-[9px] font-semibold uppercase tracking-wide text-[#a29d93]">
            Ambil · {drawTotal}
          </span>
        </button>

        <span className="relative shrink-0">
          <span className="absolute -left-2 top-1 block h-[114px] w-[76px] -rotate-6 rounded-lg border border-[#3a3a42] bg-[#1b1b1f]" />
          <span className="absolute left-1 -top-1 block h-[114px] w-[76px] rotate-3 rounded-lg border border-[#3a3a42] bg-[#232327]" />
          <span className="relative block">
            <UnoCard card={topCard} size="lg" />
          </span>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span className={`h-4 w-6 shrink-0 rounded border border-[#3a3a42] ${ACTIVE_TONE[activeColor]}`} />
        <p className="flex-1 truncate rounded-md border border-[#26262b] bg-[#121214] px-2 py-[3px] text-[9px] font-semibold uppercase tracking-wide text-[#a29d93]">
          {lastAction}
        </p>
      </div>
    </section>
  )
}
