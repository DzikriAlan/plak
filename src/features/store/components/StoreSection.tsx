'use client'

interface Props {
  title: string
  actionLabel: string
  isActionDisabled?: boolean
  isActionFlipped?: boolean
  onLoadStoreSection: () => void
}

export default function StoreSection({
  title,
  actionLabel,
  isActionDisabled = false,
  isActionFlipped = false,
  onLoadStoreSection,
}: Props) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3">
      <h2 className="text-[18px] font-black uppercase leading-none tracking-tight text-[#f2ede1] sm:text-[20px]">
        {title}
      </h2>
      <button
        type="button"
        aria-label={actionLabel}
        disabled={isActionDisabled}
        onClick={onLoadStoreSection}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2e2e34] bg-[#131316] text-[#f2ede1] transition-colors hover:border-[#f2ede1] disabled:opacity-35"
      >
        <svg
          viewBox="0 0 16 16"
          className={`h-4 w-4 transition-transform ${isActionFlipped ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
