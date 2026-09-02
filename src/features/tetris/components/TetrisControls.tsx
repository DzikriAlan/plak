'use client'

interface Props {
  isDisabled: boolean
  onSubmitTetrisShift: (step: number) => void
  onSubmitTetrisRotate: () => void
  onSubmitTetrisSoftDrop: () => void
  onSubmitTetrisHardDrop: () => void
}

export default function TetrisControls({
  isDisabled,
  onSubmitTetrisShift,
  onSubmitTetrisRotate,
  onSubmitTetrisSoftDrop,
  onSubmitTetrisHardDrop,
}: Props) {
  const buttonClass =
    'flex items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-3 text-[#f2ede1] transition-colors hover:border-[#43434d] disabled:opacity-45'

  return (
    <div className="grid shrink-0 grid-cols-5 gap-2">
      <button type="button" disabled={isDisabled} aria-label="Geser kiri" onClick={() => onSubmitTetrisShift(-1)} className={buttonClass}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" disabled={isDisabled} aria-label="Putar" onClick={onSubmitTetrisRotate} className={buttonClass}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12a8 8 0 1 1 2.6 5.9" strokeLinecap="round" />
          <path d="M4 19v-5h5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" disabled={isDisabled} aria-label="Geser kanan" onClick={() => onSubmitTetrisShift(1)} className={buttonClass}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" disabled={isDisabled} aria-label="Turun pelan" onClick={onSubmitTetrisSoftDrop} className={buttonClass}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v13M6 12l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" disabled={isDisabled} aria-label="Jatuhkan" onClick={onSubmitTetrisHardDrop} className={buttonClass}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4v10M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 20h14" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
