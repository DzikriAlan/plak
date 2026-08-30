'use client'

interface Props {
  name: string
  cardTotal: number
  tone: string
  isActive: boolean
}

export default function UnoOpponent({ name, cardTotal, tone, isActive }: Props) {
  return (
    <div
      className={`flex flex-1 items-center justify-center gap-1 rounded-xl border border-[#26262b] bg-[#121214] gap-2 px-2 py-2.5 transition-colors ${
        isActive ? 'border-[#f2ede1]' : ''
      }`}
    >
      <span
        className={`truncate rounded px-2 py-[3px] text-[10px] font-semibold uppercase text-[#0a0a0b] ${tone}`}
      >
        {name}
      </span>
      <span className="min-w-[22px] rounded bg-[#26262b] px-[7px] py-[2px] text-center text-[12px] font-semibold leading-tight text-[#f2ede1]">
        {cardTotal}
      </span>
    </div>
  )
}
