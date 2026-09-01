'use client'

import Link from 'next/link'

interface Booster {
  count: number
  cost: number
  isDisabled: boolean
}

interface Props {
  level: number
  coin: number
  star: number
  undoBooster: Booster
  addBottleBooster: Booster
  onLoadColorSortShop: () => void
  onEditColorSortUndo: () => void
  onEditColorSortAddBottle: () => void
}

export default function ColorSortHeader({
  level,
  coin,
  star,
  undoBooster,
  addBottleBooster,
  onLoadColorSortShop,
  onEditColorSortUndo,
  onEditColorSortAddBottle,
}: Props) {
  const stars = [1, 2, 3]
  const badgeClass =
    'absolute -right-1.5 -top-1.5 flex h-5 items-center justify-center rounded-full border border-[#0a0a0b] px-[6px] text-[9px] font-semibold'

  const getBadge = (booster: Booster) => {
    if (booster.count > 0) {
      return <span className={`${badgeClass} bg-[#f2ede1] text-[#0a0a0b]`}>{booster.count}</span>
    }
    return <span className={`${badgeClass} gap-[2px] bg-[#f0b429] text-[#0a0a0b]`}>★{booster.cost}</span>
  }

  return (
    <header className="relative z-20 space-y-2 px-3 pt-3">
      <div className="flex items-stretch gap-2">
        <div className="relative min-w-0 shrink">
          <Link
            href="/"
            aria-label="Back to Waitplay Game Store"
            className="block rounded-xl border border-[#26262b] bg-[#121214] px-2 py-2 transition-colors hover:border-[#43434d] sm:px-3"
          >
            <p className="flex items-center gap-1 text-[17px] font-black uppercase leading-[0.85] tracking-tighter text-[#f2ede1] [font-family:'Arial_Black','Archivo_Black',system-ui] sm:text-[20px]">
              <span className="text-[10px] leading-none">&#9664;</span>
              Color
            </p>
            <p className="mt-[2px] text-[17px] font-black uppercase leading-[0.9] tracking-tighter text-[#e0452a] [font-family:'Arial_Black','Archivo_Black',system-ui] sm:text-[20px]">
              Sort
            </p>
          </Link>
          <div className="mt-2 rounded-xl border border-[#26262b] bg-[#121214] px-2 py-[3px] text-center">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.15em] text-[#a29d93]">
              Sort the colors!
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] px-2 sm:px-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a29d93]">Level</p>
          <p className="text-[30px] font-black leading-[0.9] text-[#f2ede1] [font-family:'Arial_Black','Archivo_Black',system-ui]">
            {level}
          </p>
          <div className="mt-[2px] flex gap-[3px] text-[11px] leading-none">
            {stars.map((item) => (
              <span key={item} className={item <= star ? 'text-[#f0b429]' : 'text-[#f2ede1]/20'}>
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#26262b] bg-[#121214] px-2 py-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f0b429] text-[8px] text-[#0a0a0b]">
              ★
            </span>
            <span className="flex-1 text-center text-base font-black leading-none text-[#f2ede1]">{coin}</span>
            <button
              type="button"
              aria-label="Open reward pack"
              onClick={onLoadColorSortShop}
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e0452a] text-sm font-black leading-none text-[#f2ede1] transition-opacity active:opacity-80"
            >
              +
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-label="Undo last move"
              disabled={undoBooster.isDisabled}
              onClick={onEditColorSortUndo}
              className="relative flex h-[46px] flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] text-[#f2ede1] transition-opacity active:opacity-80 disabled:opacity-35"
            >
              <span className="text-base font-black leading-none">↺</span>
              <span className="text-[8px] font-semibold tracking-[0.1em]">UNDO</span>
              {getBadge(undoBooster)}
            </button>

            <button
              type="button"
              aria-label="Add an empty bottle"
              disabled={addBottleBooster.isDisabled}
              onClick={onEditColorSortAddBottle}
              className="relative flex h-[46px] flex-col items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] text-[#f2ede1] transition-opacity active:opacity-80 disabled:opacity-35"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M10 3h4v3l2 3v10H8V9l2-3V3z" />
                <path d="M18 4v6M21 7h-6" strokeLinecap="square" />
              </svg>
              <span className="text-center text-[8px] font-semibold leading-[1.05] tracking-[0.08em]">
                ADD
                <br />
                BOTTLE
              </span>
              {getBadge(addBottleBooster)}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
