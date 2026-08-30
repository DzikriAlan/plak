'use client'

interface Props {
  isSoundOn: boolean
  className?: string
  onEditGameSound: () => void
}

export default function GameSoundToggle({ isSoundOn, className = '', onEditGameSound }: Props) {
  return (
    <button
      type="button"
      aria-pressed={isSoundOn}
      aria-label={isSoundOn ? 'Turn sound off' : 'Turn sound on'}
      onClick={onEditGameSound}
      className={`flex items-center justify-center rounded-xl border border-[#26262b] bg-[#121214] text-[#f2ede1] transition-colors hover:border-[#43434d] ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4z" strokeLinejoin="round" />
        {isSoundOn ? (
          <path d="M15.6 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8" strokeLinecap="round" />
        ) : (
          <path d="M16 9.6l4.4 4.8M20.4 9.6L16 14.4" strokeLinecap="round" />
        )}
      </svg>
    </button>
  )
}
