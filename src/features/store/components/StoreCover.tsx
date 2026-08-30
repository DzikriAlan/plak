'use client'

interface Props {
  gameId: string
  tone: string
  accent: string
}

const PAPER = '#e8e2d4'
const INK = '#141416'

export default function StoreCover({ gameId, tone, accent }: Props) {
  const frame = 'h-full w-full'
  const grain = (
    <>
      <filter id={`grain-${gameId}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="320" height="200" filter={`url(#grain-${gameId})`} opacity="0.09" />
    </>
  )

  if (gameId === 'color-sort') {
    const bottles = [
      { x: 74, bands: ['#e0452a', '#f0b429', '#e0452a', '#3b6fd4'] },
      { x: 140, bands: ['#3b6fd4', '#e0452a', '#f0b429', '#2ec4b6'] },
      { x: 206, bands: ['#f0b429', '#2ec4b6', '#3b6fd4', '#e0452a'] },
    ]
    return (
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className={frame} aria-hidden="true">
        <rect width="320" height="200" fill={PAPER} />
        <path d="M0 200V118a82 82 0 0 0 82 82Z" fill="#e0452a" />
        <rect x="284" width="36" height="200" fill="#2b2b2d" />
        {bottles.map((bottle) => (
          <g key={bottle.x}>
            <rect x={bottle.x + 14} y="38" width="12" height="10" fill="#e0452a" stroke={INK} strokeWidth="3" />
            <rect x={bottle.x} y="48" width="40" height="104" fill="#f7f4ec" stroke={INK} strokeWidth="3" />
            {bottle.bands.map((band, index) => (
              <rect
                key={index}
                x={bottle.x + 1.5}
                y={49.5 + index * 25.25}
                width="37"
                height="25.25"
                fill={band}
                stroke={INK}
                strokeWidth="1.5"
              />
            ))}
          </g>
        ))}
        <rect x="60" y="152" width="200" height="7" fill={INK} />
        {grain}
      </svg>
    )
  }

  if (gameId === 'uno') {
    const cards = [
      { label: '1', fill: '#e0452a', x: 96, y: 66, rotate: -16 },
      { label: '2', fill: '#3d9e63', x: 176, y: 66, rotate: 16 },
      { label: '4', fill: INK, x: 136, y: 58, rotate: 0 },
    ]
    return (
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className={frame} aria-hidden="true">
        <rect width="320" height="200" fill={tone} />
        {cards.map((card) => (
          <g key={card.label} transform={`rotate(${card.rotate} ${card.x} ${card.y + 45})`}>
            <rect
              x={card.x - 27}
              y={card.y - 6}
              width="54"
              height="92"
              rx="7"
              fill={card.fill}
              stroke={PAPER}
              strokeWidth="4"
            />
            <text
              x={card.x}
              y={card.y + 52}
              textAnchor="middle"
              fill={PAPER}
              fontSize="42"
              fontWeight="900"
              fontFamily="'Arial Black', system-ui, sans-serif"
            >
              {card.label}
            </text>
          </g>
        ))}
        {grain}
      </svg>
    )
  }

  if (gameId === 'animal-matching') {
    const animals = ['\u{1F42E}', '\u{1F42F}', '\u{1F438}', '\u{1F435}', '\u{1F430}', '\u{1F98A}']
    return (
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className={frame} aria-hidden="true">
        <rect width="320" height="200" fill={tone} />
        <circle cx="286" cy="26" r="40" fill={accent} />
        {animals.map((animal, index) => (
          <g key={animal} transform={`translate(${52 + (index % 3) * 78} ${64 + Math.floor(index / 3) * 74})`}>
            <rect x="-30" y="-30" width="60" height="60" rx="10" fill={PAPER} stroke={INK} strokeWidth="3" />
            <text x="0" y="12" textAnchor="middle" fontSize="34">
              {animal}
            </text>
          </g>
        ))}
        {grain}
      </svg>
    )
  }

  if (gameId === 'catur') {
    const squares = [0, 1, 2, 3, 4, 5].flatMap((column) =>
      [0, 1, 2].map((row) => ({ column, row, isDark: (column + row) % 2 === 1 })),
    )
    return (
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className={frame} aria-hidden="true">
        <rect width="320" height="200" fill={tone} />
        <circle cx="272" cy="34" r="42" fill={accent} />
        <g transform="translate(40 116) skewY(-6)">
          {squares.map((square) => (
            <rect
              key={`${square.column}-${square.row}`}
              x={square.column * 40}
              y={square.row * 24}
              width="40"
              height="24"
              fill={square.isDark ? INK : PAPER}
            />
          ))}
        </g>
        <g transform="translate(158 170) scale(0.86)" fill={PAPER} stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <path d="M-30-12h60v14h-60z" />
          <path d="M-23-12c0-16 9-24 9-34h28c0 10 9 18 9 34z" />
          <path d="M-17-52h34v-10h-34z" />
          <circle cx="0" cy="-76" r="14" />
          <path d="M-4-116h8v26h-8z" />
          <path d="M-14-106h28v8h-28z" />
        </g>
        {grain}
      </svg>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: tone }}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0a0a0b]">Segera</span>
    </div>
  )
}
