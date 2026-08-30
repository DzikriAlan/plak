'use client'

interface Props {
  moveTotal: number
  bestMove: number
  undoLeft: number
  shuffleLeft: number
  addBottleLeft: number
  isDisabled: boolean
  onEditColorSortUndo: () => void
  onEditColorSortShuffle: () => void
  onEditColorSortAddBottle: () => void
  onLoadColorSortPause: () => void
}

export default function ColorSortControls({
  moveTotal,
  bestMove,
  undoLeft,
  shuffleLeft,
  addBottleLeft,
  isDisabled,
  onEditColorSortUndo,
  onEditColorSortShuffle,
  onEditColorSortAddBottle,
  onLoadColorSortPause,
}: Props) {
  const buttons = [
    { key: 'undo', label: 'UNDO', tone: 'bg-[#e63946]', count: undoLeft, onPress: onEditColorSortUndo },
    { key: 'shuffle', label: 'SHUFFLE', tone: 'bg-[#8b5cf6]', count: shuffleLeft, onPress: onEditColorSortShuffle },
    { key: 'add', label: 'TAMBAH BOTOL', tone: 'bg-[#3a86ff]', count: addBottleLeft, onPress: onEditColorSortAddBottle },
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
            disabled={isDisabled}
            onClick={button.onPress}
            className={`relative flex flex-col items-center justify-center border-[3px] border-black py-2 text-[#f2e9d8] shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40 ${button.tone}`}
          >
            {getButtonIcon(button.key)}
            <span className="mt-1 px-1 text-center text-[9px] font-black uppercase leading-[1.05] tracking-[0.08em]">
              {button.label}
            </span>
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center border-[3px] border-black bg-[#f2e9d8] text-[9px] font-black text-black">
              {button.count}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onLoadColorSortPause}
        className="flex w-[52px] shrink-0 items-center justify-center gap-1 border-[3px] border-black bg-[#f2e9d8] shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <span className="h-5 w-[5px] bg-black" />
        <span className="h-5 w-[5px] bg-black" />
      </button>
    </footer>
  )
}
