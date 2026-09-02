'use client'

interface Props {
  resultLabel: string
  moveTotal: number
  timeLabel: string
  scrambleTotal: number
  onClearRubikGame: () => void
}

export default function RubikResult({ resultLabel, moveTotal, timeLabel, scrambleTotal, onClearRubikGame }: Props) {
  const stats = [
    { id: 'move', label: 'Langkah', value: String(moveTotal) },
    { id: 'time', label: 'Waktu', value: timeLabel },
    { id: 'scramble', label: 'Acakan', value: String(scrambleTotal) },
  ]

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Kubus selesai</p>
        <p className="mt-2 text-3xl font-black uppercase leading-none text-[#f2ede1]">{resultLabel}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div key={stat.id} className="rounded-xl border border-[#26262b] bg-[#0a0a0b] px-1 py-2">
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a29d93]">{stat.label}</p>
              <p className="mt-1 text-[13px] font-black leading-none text-[#f2ede1]">{stat.value}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClearRubikGame}
          className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
        >
          Acak lagi
        </button>
      </div>
    </div>
  )
}
