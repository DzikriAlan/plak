'use client'

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
    'absolute -right-2 -top-2 flex h-5 items-center justify-center border-[3px] border-black text-[9px] font-black'

  const getBadge = (booster: Booster) => {
    if (booster.count > 0) {
      return <span className={`${badgeClass} w-5 bg-[#e63946] text-white`}>{booster.count}</span>
    }
    return <span className={`${badgeClass} gap-[2px] bg-[#ffd23f] px-1 text-black`}>★{booster.cost}</span>
  }

  return (
    <header className="relative z-20 space-y-2 px-3 pt-3">
      <div className="flex items-stretch gap-2">
        <div className="relative shrink-0">
          <div className="border-[3px] border-black bg-[#f2e9d8] px-2 py-1 shadow-[4px_4px_0_#000]">
            <p className="text-[22px] font-black uppercase leading-[0.85] tracking-tighter text-black [font-family:'Arial_Black','Archivo_Black',system-ui]">
              Color
            </p>
            <p className="-mx-2 mt-[2px] border-y-[3px] border-black bg-[#ff5a1f] px-2 text-[22px] font-black uppercase leading-[0.9] tracking-tighter text-[#f2e9d8] [font-family:'Arial_Black','Archivo_Black',system-ui]">
              Sort
            </p>
          </div>
          <div className="mt-1 border-[3px] border-black bg-[#ffd23f] px-2 py-[2px] text-center shadow-[4px_4px_0_#000]">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-black">Pisahkan warna!</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center border-[3px] border-black bg-[#2ec4b6] px-3 shadow-[4px_4px_0_#000]">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-black">Level</p>
          <p className="text-[30px] font-black leading-[0.9] text-black [font-family:'Arial_Black','Archivo_Black',system-ui]">
            {level}
          </p>
          <div className="mt-[2px] flex gap-[3px] text-[11px] leading-none">
            {stars.map((item) => (
              <span key={item} className={item <= star ? 'text-black' : 'text-black/25'}>
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-2">
          <div className="flex items-center gap-2 border-[3px] border-black bg-[#f2e9d8] px-2 py-1 shadow-[4px_4px_0_#000]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-black bg-[#ffd23f] text-[8px] text-black">
              ★
            </span>
            <span className="flex-1 text-center text-base font-black leading-none text-black">{coin}</span>
            <button
              type="button"
              aria-label="Buka paket hadiah"
              onClick={onLoadColorSortShop}
              className="flex h-6 w-6 items-center justify-center border-[3px] border-black bg-[#ff5a1f] text-sm font-black leading-none text-black active:translate-x-[1px] active:translate-y-[1px]"
            >
              +
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-label="Undo langkah terakhir"
              disabled={undoBooster.isDisabled}
              onClick={onEditColorSortUndo}
              className="relative flex h-[46px] flex-col items-center justify-center border-[3px] border-black bg-[#f2e9d8] text-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0_#000]"
            >
              <span className="text-base font-black leading-none">↺</span>
              <span className="text-[8px] font-black tracking-[0.1em]">UNDO</span>
              {getBadge(undoBooster)}
            </button>

            <button
              type="button"
              aria-label="Tambah botol kosong"
              disabled={addBottleBooster.isDisabled}
              onClick={onEditColorSortAddBottle}
              className="relative flex h-[46px] flex-col items-center justify-center border-[3px] border-black bg-[#f2e9d8] text-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0_#000]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M10 3h4v3l2 3v10H8V9l2-3V3z" />
                <path d="M18 4v6M21 7h-6" strokeLinecap="square" />
              </svg>
              <span className="text-center text-[8px] font-black leading-[1.05] tracking-[0.08em]">
                TAMBAH
                <br />
                BOTOL
              </span>
              {getBadge(addBottleBooster)}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
