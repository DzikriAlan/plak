'use client'

interface Props {
  hintLabel: string
  scrambleLabel: string
  isScrambleLoading?: boolean
  onSubmitRubikScramble: () => void
}

export default function RubikControls({
  hintLabel,
  scrambleLabel,
  isScrambleLoading = false,
  onSubmitRubikScramble,
}: Props) {
  return (
    <div className="shrink-0 space-y-2">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a29d93]">{hintLabel}</p>

      <button
        type="button"
        disabled={isScrambleLoading}
        onClick={onSubmitRubikScramble}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e0452a] py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f2ede1] transition-opacity active:opacity-80 disabled:opacity-45"
      >
        <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M3 7h5l3 5 3 5h5" strokeLinecap="round" />
          <path d="M3 17h5l3-5" strokeLinecap="round" />
          <path d="M17 4l3 3-3 3M17 14l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {scrambleLabel}
      </button>
    </div>
  )
}
