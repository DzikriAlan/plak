'use client'

interface Props {
  secondsLeft: number
  timeLimit: number
}

export default function AnimalMatchingGauge({ secondsLeft, timeLimit }: Props) {
  const getRatio = () => (timeLimit > 0 ? Math.max(0, Math.min(1, secondsLeft / timeLimit)) : 0)
  const getArcPath = (ratio: number) => {
    const angle = Math.PI * (1 - ratio)
    const x = 50 - 38 * Math.cos(Math.PI * ratio)
    const y = 46 - 38 * Math.sin(Math.PI * ratio)
    return { d: `M12 46 A38 38 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`, angle }
  }
  const getTone = (ratio: number) => {
    if (ratio > 0.5) return '#4ea86b'
    if (ratio > 0.22) return '#f0b429'
    return '#d0453a'
  }
  const getClock = (total: number) => {
    const minute = Math.floor(Math.max(0, total) / 60)
    const second = Math.max(0, total) % 60
    return `${minute}:${String(second).padStart(2, '0')}`
  }

  const ratio = getRatio()
  const arc = getArcPath(ratio)
  const tone = getTone(ratio)
  const needleX = 50 - 30 * Math.cos(Math.PI * ratio)
  const needleY = 46 - 30 * Math.sin(Math.PI * ratio)

  return (
    <div className="flex min-w-0 items-center gap-2">
      <svg viewBox="0 0 100 56" className="hidden h-[38px] w-[68px] shrink-0 sm:block" aria-hidden="true">
        <path d="M12 46 A38 38 0 0 1 88 46" fill="none" stroke="#26262b" strokeWidth="8" strokeLinecap="round" />
        <path d={arc.d} fill="none" stroke={tone} strokeWidth="8" strokeLinecap="round" />
        <line x1="50" y1="46" x2={needleX.toFixed(2)} y2={needleY.toFixed(2)} stroke="#f2ede1" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="50" cy="46" r="4" fill="#f2ede1" />
      </svg>
      <span className="shrink-0 text-[13px] font-black tabular-nums sm:text-[15px]" style={{ color: tone }}>
        {getClock(secondsLeft)}
      </span>
    </div>
  )
}
