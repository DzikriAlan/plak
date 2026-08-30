'use client'

import type { AnimalMatchingTile } from '../types/animalMatchingTypes'
import AnimalMatchingIcon from './AnimalMatchingIcon'

interface Props {
  tiles: AnimalMatchingTile[]
  rowTotal: number
  colTotal: number
  onSubmitAnimalMatchingTile: (tileId: number) => void
}

export default function AnimalMatchingBoard({ tiles, rowTotal, colTotal, onSubmitAnimalMatchingTile }: Props) {
  const getTileTone = (tile: AnimalMatchingTile) => {
    if (tile.isEmpty) return 'border-transparent bg-transparent'
    if (tile.isSelected) return 'border-[#141416] bg-[#f0b429] shadow-[2px_2px_0_#141416]'
    if (tile.isHinted) return 'border-[#141416] bg-[#a78bfa] shadow-[2px_2px_0_#141416]'
    return 'border-[#141416] bg-[#f6efdd] shadow-[2px_2px_0_#141416]'
  }

  return (
    <div
      className="grid w-full gap-[3px] sm:gap-1.5"
      style={{
        gridTemplateColumns: `repeat(${colTotal}, minmax(0, 1fr))`,
        aspectRatio: `${colTotal} / ${rowTotal}`,
        maxWidth: `calc((100dvh - 15rem) * ${colTotal} / ${rowTotal})`,
      }}
    >
      {tiles.map((tile) => (
        <button
          key={tile.id}
          type="button"
          disabled={tile.isEmpty}
          aria-label={tile.isEmpty ? 'Kotak kosong' : `Hewan ${tile.icon}`}
          onClick={() => onSubmitAnimalMatchingTile(tile.id)}
          className={`flex aspect-square items-center justify-center rounded-[4px] border-2 p-[8%] transition-transform active:scale-95 ${getTileTone(
            tile,
          )}`}
        >
          {tile.isEmpty ? null : <AnimalMatchingIcon name={tile.icon} />}
        </button>
      ))}
    </div>
  )
}
