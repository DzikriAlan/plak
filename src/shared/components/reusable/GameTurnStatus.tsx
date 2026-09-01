'use client'

interface Props {
  label: string
  isWaiting: boolean
  className?: string
}

export default function GameTurnStatus({ label, isWaiting, className = '' }: Props) {
  const tone = isWaiting
    ? 'border-[#26262b] bg-[#121214] text-[#a29d93]'
    : 'border-[#f0b429] bg-[#f0b429]/10 text-[#f0b429]'

  return (
    <div
      className={`flex shrink-0 items-center justify-center gap-2 rounded-xl border py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${tone} ${className}`}
    >
      {isWaiting ? <span className="block h-2 w-2 animate-pulse rounded-full bg-[#a29d93]" /> : null}
      {label}
    </div>
  )
}
