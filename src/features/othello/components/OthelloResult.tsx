'use client'

interface Props {
  resultLabel: string
  rivalLabel?: string
  playerScore: number
  botScore: number
  moveTotal: number
  onClearOthelloGame: () => void
}

export default function OthelloResult({
  resultLabel,
  rivalLabel = 'Bidak bot',
  playerScore,
  botScore,
  moveTotal,
  onClearOthelloGame,
}: Props) {
  const stats = [
    { id: 'player', label: 'Bidak kamu', value: String(playerScore) },
    { id: 'bot', label: rivalLabel, value: String(botScore) },
    { id: 'move', label: 'Langkah', value: String(moveTotal) },
  ]

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Permainan selesai</p>
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
          onClick={onClearOthelloGame}
          className="mt-6 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
        >
          Main lagi
        </button>
      </div>
    </div>
  )
}
