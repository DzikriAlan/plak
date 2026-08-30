'use client'

interface Booster {
  count: number
  cost: number
  isDisabled: boolean
}

interface Props {
  moveTotal: number
  bestMove: number
  undoBooster: Booster
  shuffleBooster: Booster
  addBottleBooster: Booster
  onEditColorSortUndo: () => void
  onEditColorSortShuffle: () => void
  onEditColorSortAddBottle: () => void
  onLoadColorSortPause: () => void
}

export default function ColorSortControls({
  moveTotal,
  bestMove,
  undoBooster,
  shuffleBooster,
  addBottleBooster,
  onEditColorSortUndo,
  onEditColorSortShuffle,
  onEditColorSortAddBottle,
  onLoadColorSortPause,
}: Props) {
  const buttons = [
    { key: 'undo', label: 'UNDO', tone: 'bg-[#c2372c]', booster: undoBooster, onPress: onEditColorSortUndo },
    { key: 'shuffle', label: 'SHUFFLE', tone: 'bg-[#6d4bc4]', booster: shuffleBooster, onPress: onEditColorSortShuffle },
    { key: 'add', label: 'TAMBAH BOTOL', tone: 'bg-[#3b6fd4]', booster: addBottleBooster, onPress: onEditColorSortAddBottle },
  ]

  const getButtonIcon = (key: string) => {
    if (key === 'undo') return <span className="text-xl font-black leading-none">↺</span>
    if (key === 'shuffle') return <span className="text-xl font-black leading-none">⇄</span>
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M10 3h4v3l2 3v10H8V9l2-3V3z" />
        <path d="M18 4v6M21 7h-6" strokeLinecap="square" />
      </svg>
    )
  }

  const getBadge = (count: number, cost: number) => {
    const base =
      'absolute -right-1.5 -top-1.5 flex h-5 items-center justify-center rounded-full border border-[#0a0a0b] px-[6px] text-[9px] font-semibold'
    if (count > 0) return <span className={`${base} bg-[#f2ede1] text-[#0a0a0b]`}>{count}</span>
    return <span className={`${base} bg-[#f0b429] text-[#0a0a0b]`}>★{cost}</span>
  }

  return (
    <footer className="relative z-10 flex items-stretch gap-2 px-3 pb-4 pt-2">
      <div className="flex w-[72px] shrink-0 flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] py-1">
        <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#a29d93]">Moves</p>
        <p className="text-[26px] font-black leading-none text-[#f2ede1] [font-family:'Arial_Black','Archivo_Black',system-ui]">
          {moveTotal}
        </p>
        <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#a29d93]">Best: {bestMove || '-'}</p>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-2">
        {buttons.map((button) => (
          <button
            key={button.key}
            type="button"
            aria-label={button.label}
            disabled={button.booster.isDisabled}
            onClick={button.onPress}
            className={`relative flex flex-col items-center justify-center rounded-xl py-2 text-[#f2ede1] transition-opacity active:opacity-80 disabled:opacity-35 ${button.tone}`}
          >
            {getButtonIcon(button.key)}
            <span className="mt-1 px-1 text-center text-[9px] font-semibold uppercase leading-[1.05] tracking-[0.08em]">
              {button.label}
            </span>
            {getBadge(button.booster.count, button.booster.cost)}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Jeda permainan"
        onClick={onLoadColorSortPause}
        className="flex w-[52px] shrink-0 items-center justify-center gap-1 rounded-xl border border-[#26262b] bg-[#121214] transition-colors hover:border-[#43434d]"
      >
        <span className="h-5 w-[4px] rounded-sm bg-[#f2ede1]" />
        <span className="h-5 w-[4px] rounded-sm bg-[#f2ede1]" />
      </button>
    </footer>
  )
}
