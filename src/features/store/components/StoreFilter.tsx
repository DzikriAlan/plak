'use client'

import type { StoreCategory } from '../types/storeTypes'

interface Props {
  categories: StoreCategory[]
  activeCategory: string
  onEditStoreCategory: (categoryId: string) => void
}

export default function StoreFilter({ categories, activeCategory, onEditStoreCategory }: Props) {
  const getIcon = (categoryId: string, isActive: boolean) => {
    const tone = isActive ? '#0a0a0b' : '#f2ede1'
    if (categoryId === 'puzzle') {
      return (
        <svg viewBox="0 0 16 16" className="h-[14px] w-[14px]" fill={tone} aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" rx="1.4" />
          <rect x="9" y="1" width="6" height="6" rx="1.4" opacity="0.55" />
          <rect x="1" y="9" width="6" height="6" rx="1.4" opacity="0.55" />
          <rect x="9" y="9" width="6" height="6" rx="1.4" />
        </svg>
      )
    }
    if (categoryId === 'papan') {
      return (
        <svg viewBox="0 0 16 16" className="h-[14px] w-[14px]" fill={tone} aria-hidden="true">
          <rect x="1.5" y="1.5" width="13" height="13" rx="1.6" opacity="0.35" />
          <rect x="1.5" y="1.5" width="4.33" height="4.33" />
          <rect x="10.17" y="1.5" width="4.33" height="4.33" />
          <rect x="5.83" y="5.83" width="4.34" height="4.34" />
          <rect x="1.5" y="10.17" width="4.33" height="4.33" />
          <rect x="10.17" y="10.17" width="4.33" height="4.33" />
        </svg>
      )
    }
    if (categoryId === 'kartu') {
      return (
        <svg viewBox="0 0 16 16" className="h-[14px] w-[14px]" fill="none" stroke={tone} strokeWidth="1.5">
          <rect x="5.5" y="2.5" width="8" height="11" rx="1.6" />
          <path d="M4 4.6 2.2 5.3a1.4 1.4 0 0 0-.8 1.8l2.3 6.1" strokeLinecap="round" />
        </svg>
      )
    }
    return <span className="block h-[7px] w-[7px] rounded-full" style={{ backgroundColor: tone }} />
  }

  return (
    <nav
      className="flex shrink-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Filter kategori"
    >
      {categories.map((category) => {
        const isActive = category.id === activeCategory
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onEditStoreCategory(category.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
              isActive
                ? 'border-[#f2ede1] bg-[#f2ede1] text-[#0a0a0b]'
                : 'border-[#2e2e34] bg-[#131316] text-[#f2ede1] hover:border-[#454550]'
            }`}
          >
            {getIcon(category.id, isActive)}
            {category.label}
          </button>
        )
      })}
    </nav>
  )
}
