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
    { key: 'undo', label: 'UNDO', tone: 'bg-[#e63946]', booster: undoBooster, onPress: onEditColorSortUndo },
    { key: 'shuffle', label: 'SHUFFLE', tone: 'bg-[#8b5cf6]', booster: shuffleBooster, onPress: onEditColorSortShuffle },
    { key: 'add', label: 'TAMBAH BOTOL', tone: 'bg-[#3a86ff]', booster: addBottleBooster, onPress: onEditColorSortAddBottle },
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
    const base = 'absolute -right-2 -top-2 flex h-5 items-center justify-center border-[3px] border-black text-[9px] font-black'
    if (count > 0) return <span className={`${base} w-5 bg-[#f2e9d8] text-black`}>{count}</span>
    return <span className={`${base} bg-[#ffd23f] px-1 text-black`}>★{cost}</span>
  }

  return (
    <footer className="relative z-10 flex items-stretch gap-2 px-3 pb-4 pt-2">
      <div className="flex w-[72px] shrink-0 flex-col items-center justify-center border-[3px] border-black bg-[#ffd23f] py-1 shadow-[4px_4px_0_#000]">
        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-black">Moves</p>
        <p className="text-[26px] font-black leading-none text-black [font-family:'Arial_Black','Archivo_Black',system-ui]">
          {moveTotal}
        </p>
        <p className="text-[8px] font-black uppercase tracking-[0.1em] text-black">Best: {bestMove || '-'}</p>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-2">
        {buttons.map((button) => (
          <button
            key={button.key}
            type="button"
            aria-label={button.label}
            disabled={button.booster.isDisabled}
            onClick={button.onPress}
            className={`relative flex flex-col items-center justify-center border-[3px] border-black py-2 text-[#f2e9d8] shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0_#000] ${button.tone}`}
          >
            {getButtonIcon(button.key)}
            <span className="mt-1 px-1 text-center text-[9px] font-black uppercase leading-[1.05] tracking-[0.08em]">
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
        className="flex w-[52px] shrink-0 items-center justify-center gap-1 border-[3px] border-black bg-[#f2e9d8] shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <span className="h-5 w-[5px] bg-black" />
        <span className="h-5 w-[5px] bg-black" />
      </button>
    </footer>
  )
}
