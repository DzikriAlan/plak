'use client'

interface Props {
  kind: 'player' | 'cave'
}

const SHELL = '#e0452a'
const SHELL_DARK = '#a82f1c'
const BODY = '#1b1b1f'
const ROCK = '#8a8a99'
const ROCK_DARK = '#5f5f6d'
const ROCK_LIGHT = '#b3b3c0'
const MOUTH = '#08080a'
const GLOW = '#f0b429'

export default function MazeRunnerIcon({ kind }: Props) {
  const getShape = () => {
    if (kind === 'cave') {
      return (
        <>
          <ellipse cx="12" cy="15.6" rx="10.6" ry="9.4" fill={GLOW} opacity="0.16" />
          <path d="M2.4 21C2.4 11.4 6.7 5.8 12 5.8s9.6 5.6 9.6 15.2Z" fill={ROCK} />
          <path d="M12 5.8c5.3 0 9.6 5.6 9.6 15.2h-4C17.6 12.4 15.4 7 12 5.8Z" fill={ROCK_DARK} />
          <path d="M6.4 9.6q2.2-2.6 5.6-2.6 3.4 0 5.6 2.6-2.6-1.4-5.6-1.4-3 0-5.6 1.4Z" fill={ROCK_LIGHT} />
          <path d="M6.4 21c0-5.9 2.5-9.5 5.6-9.5s5.6 3.6 5.6 9.5Z" fill={MOUTH} />
          <path
            d="M6.4 21c0-5.9 2.5-9.5 5.6-9.5s5.6 3.6 5.6 9.5"
            fill="none"
            stroke={GLOW}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path d="M9.4 21c0-3.2 1.2-5.2 2.6-5.2s2.6 2 2.6 5.2Z" fill={GLOW} opacity="0.3" />
        </>
      )
    }

    return (
      <>
        <path d="M5.4 8.4 8 10.6M18.6 8.4 16 10.6" stroke={BODY} strokeWidth="1.3" strokeLinecap="round" />
        <path d="M4.6 13h3.2M16.2 13h3.2M5.6 17.2 8 15.8M18.4 17.2 16 15.8" stroke={BODY} strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="12" cy="7.6" r="3.1" fill={BODY} />
        <circle cx="10.8" cy="7.2" r="0.7" fill="#fdf8ec" />
        <circle cx="13.2" cy="7.2" r="0.7" fill="#fdf8ec" />
        <ellipse cx="12" cy="14.4" rx="6.4" ry="6.8" fill={SHELL} />
        <path d="M12 7.6v13.6" stroke={BODY} strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="9.2" cy="12.4" r="1.5" fill={SHELL_DARK} />
        <circle cx="14.8" cy="12.4" r="1.5" fill={SHELL_DARK} />
        <circle cx="9.6" cy="17.4" r="1.2" fill={SHELL_DARK} />
        <circle cx="14.4" cy="17.4" r="1.2" fill={SHELL_DARK} />
      </>
    )
  }

  return <g>{getShape()}</g>
}
