'use client'

import type { AnimalMatchingTile } from '../types/animalMatchingTypes'

interface Props {
  tiles: AnimalMatchingTile[]
  rowTotal: number
  colTotal: number
  onSubmitAnimalMatchingTile: (tileId: number) => void
}

export default function AnimalMatchingBoard({ tiles, rowTotal, colTotal, onSubmitAnimalMatchingTile }: Props) {
  const getTileTone = (tile: AnimalMatchingTile) => {
    if (tile.isEmpty) return 'border-transparent bg-transparent'
    if (tile.isSelected) return 'border-[#f0b429] bg-[#f6efdd] ring-2 ring-[#f0b429]'
    if (tile.isHinted) return 'border-[#7c3aed] bg-[#f6efdd] ring-2 ring-[#7c3aed]'
    return 'border-[#cdbf9f] bg-[#f6efdd]'
  }

  return (
    <div
      className="grid w-full gap-[3px] sm:gap-1.5"
      style={{
        containerType: 'inline-size',
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
          // Ukuran ikon mengikuti lebar ubin (satu ubin = 100/kolom cqw).
          style={{ fontSize: `calc(${100 / colTotal}cqw * 0.56)` }}
          className={`flex aspect-square items-center justify-center rounded-md border text-[min(5.2vw,3.4dvh)] leading-none transition-transform active:scale-95 ${getTileTone(
            tile,
          )}`}
        >
          {tile.icon}
        </button>
      ))}
    </div>
  )
}
