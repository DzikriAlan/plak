'use client'

import { useEffect, useState } from 'react'
import type { AnimalMatchingPoint, AnimalMatchingTile } from '../types/animalMatchingTypes'
import AnimalMatchingIcon from './AnimalMatchingIcon'

interface Props {
  tiles: AnimalMatchingTile[]
  rowTotal: number
  colTotal: number
  path: AnimalMatchingPoint[]
  onSubmitAnimalMatchingTile: (tileId: number) => void
}

export default function AnimalMatchingBoard({
  tiles,
  rowTotal,
  colTotal,
  path,
  onSubmitAnimalMatchingTile,
}: Props) {
  const [filters, setFilters] = useState({ trail: [] as AnimalMatchingPoint[] })

  // Jejak jalur ditahan sebentar setelah pasangan terhapus, lalu hilang sendiri.
  useEffect(() => {
    if (!path.length) return
    setFilters({ trail: path })
    const timer = window.setTimeout(() => setFilters({ trail: [] }), 420)
    return () => window.clearTimeout(timer)
  }, [path])

  const getTrailPoints = () => {
    const getCenter = (point: AnimalMatchingPoint) => ({
      x: ((point.col + 0.5) / colTotal) * 100,
      y: ((point.row + 0.5) / rowTotal) * 100,
    })
    return filters.trail.map(getCenter)
  }

  const trail = getTrailPoints()
  const getTileTone = (tile: AnimalMatchingTile) => {
    if (tile.isEmpty) return 'border-transparent bg-transparent'
    if (tile.isSelected) return 'border-[#141416] bg-[#f0b429] shadow-[2px_2px_0_#141416]'
    if (tile.isHinted) return 'border-[#141416] bg-[#a78bfa] shadow-[2px_2px_0_#141416]'
    return 'border-[#141416] bg-[#f6efdd] shadow-[2px_2px_0_#141416]'
  }

  return (
    <div
      className="relative grid w-full gap-[2px] sm:gap-[3px]"
      style={{
        gridTemplateColumns: `repeat(${colTotal}, minmax(0, 1fr))`,
        aspectRatio: `${colTotal} / ${rowTotal}`,
        maxWidth: `calc((100dvh - 15rem) * ${colTotal} / ${rowTotal})`,
      }}
    >
      {trail.length > 1 ? (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <polyline
            points={trail.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke="#f0b429"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 4 }}
          />
          {trail.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r="1.4" fill="#f0b429" />
          ))}
        </svg>
      ) : null}

      {tiles.map((tile) => (
        <button
          key={tile.id}
          type="button"
          disabled={tile.isEmpty}
          aria-label={tile.isEmpty ? 'Empty cell' : `Animal ${tile.icon}`}
          onClick={() => onSubmitAnimalMatchingTile(tile.id)}
          className={`flex aspect-square items-center justify-center rounded-[5px] border-2 p-[4%] transition-transform active:scale-95 ${getTileTone(
            tile,
          )}`}
        >
          {tile.isEmpty ? null : <AnimalMatchingIcon name={tile.icon} />}
        </button>
      ))}
    </div>
  )
}
