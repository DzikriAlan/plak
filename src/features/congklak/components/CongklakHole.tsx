'use client'

import type { CongklakHole as CongklakHoleType } from '../types/congklakTypes'

interface Props {
  hole: CongklakHoleType
  onSubmitCongklakHole: (holeIndex: number) => void
}

const SEED_TONES = ['#e0452a', '#3b6fd4', '#6d4bc4', '#f0b429']
const MAX_SEED_SIZE = 18
const MAX_RADIUS = 44
const SEED_SCALE = 0.7

export default function CongklakHole({ hole, onSubmitCongklakHole }: Props) {
  const getPlan = (total: number) => {
    if (total <= 1) return { rings: [{ count: total, radius: 0 }], size: MAX_SEED_SIZE }
    if (total <= 6) {
      const radius = 24
      const size = Math.min(MAX_SEED_SIZE, 2 * radius * Math.sin(Math.PI / total) * SEED_SCALE)
      return { rings: [{ count: total, radius }], size }
    }

    const outerTotal = total - 1
    if (outerTotal <= 9) {
      const radius = 27
      const size = Math.min(MAX_SEED_SIZE, radius, 2 * radius * Math.sin(Math.PI / outerTotal) * SEED_SCALE)
      return {
        rings: [
          { count: 1, radius: 0 },
          { count: outerTotal, radius },
        ],
        size,
      }
    }

    const outerCount = Math.ceil(outerTotal * 0.62)
    const innerCount = outerTotal - outerCount
    const outerRadius = MAX_RADIUS - 12
    const innerRadius = outerRadius / 2
    const size = Math.min(MAX_SEED_SIZE, innerRadius, 2 * outerRadius * Math.sin(Math.PI / outerCount) * SEED_SCALE)
    return {
      rings: [
        { count: 1, radius: 0 },
        { count: innerCount, radius: innerRadius },
        { count: outerCount, radius: outerRadius },
      ],
      size,
    }
  }
  const getSeeds = () => {
    const plan = getPlan(hole.seedTotal)
    const seeds: Array<{ id: number; tone: string; left: number; top: number; size: number }> = []
    let seedIndex = 0
    plan.rings.forEach((ring) => {
      for (let step = 0; step < ring.count; step += 1) {
        const angle = (Math.PI * 2 * step) / ring.count - Math.PI / 2
        seeds.push({
          id: seedIndex,
          tone: SEED_TONES[(hole.index + seedIndex) % SEED_TONES.length],
          left: 50 + ring.radius * Math.cos(angle),
          top: 50 + ring.radius * Math.sin(angle),
          size: plan.size,
        })
        seedIndex += 1
      }
    })
    return seeds
  }

  const seeds = getSeeds()
  // Warna cincin dibuat pekat, bukan transparan, supaya ketebalannya terbaca rata di seluruh sisi.
  const getRingTone = () => {
    if (hole.isActive) return 'border-[#f2ede1]'
    if (hole.side === 'player') return hole.isPlayable ? 'border-[#f0b429]' : 'border-[#8d6f24]'
    return 'border-[#5b46a3]'
  }
  const ringTone = getRingTone()
  const playableTone = hole.isPlayable ? 'hover:border-[#f7d06a] active:scale-95' : ''

  return (
    <button
      type="button"
      disabled={!hole.isPlayable}
      aria-label={`Lubang ${hole.index + 1} berisi ${hole.seedTotal} biji`}
      onClick={() => onSubmitCongklakHole(hole.index)}
      className={`relative h-full max-h-[76px] max-w-full rounded-full border-2 bg-[#0d0d0f] transition-all [aspect-ratio:1] disabled:cursor-default sm:max-h-[92px] ${ringTone} ${playableTone}`}
    >
      {/* Bayangan cekung dipasang di lapisan terpisah supaya tidak menutupi sebagian cincin. */}
      <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_3px_8px_rgba(0,0,0,0.7)]" />

      {seeds.map((seed) => (
        <span
          key={seed.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${seed.left}%`,
            top: `${seed.top}%`,
            width: `${seed.size}%`,
            height: `${seed.size}%`,
            backgroundColor: seed.tone,
          }}
        />
      ))}
    </button>
  )
}
