'use client'

interface Props {
  type: string
  color: string
}

const WHITE_FILL = '#f7f1e2'
const WHITE_LINE = '#2b2a26'
const BLACK_FILL = '#1b1a17'
const BLACK_LINE = '#f1f1e4'

export default function CaturPiece({ type, color }: Props) {
  const isWhite = color === 'w'
  const fill = isWhite ? WHITE_FILL : BLACK_FILL
  const line = isWhite ? WHITE_LINE : BLACK_LINE

  const getBody = () => {
    if (type === 'p') {
      return (
        <>
          <circle cx="22.5" cy="13" r="5.2" />
          <path d="M22.5 18.6c-3.7 0-6.6 2.4-6.6 5.4 0 1.8 1 3.1 2.3 4-2.7 1.7-4.5 4.4-4.8 7.8h18.2c-.3-3.4-2.1-6.1-4.8-7.8 1.3-.9 2.3-2.2 2.3-4 0-3-2.9-5.4-6.6-5.4z" />
          <path d="M11.6 35.6h21.8v4H11.6z" />
        </>
      )
    }
    if (type === 'r') {
      return (
        <>
          <path d="M10.8 8.4h4.6v4.1h4.1V8.4h5.9v4.1h4.1V8.4h4.6v10.2H10.8z" />
          <path d="M14.6 18.6h15.8l1.1 12.6H13.5z" />
          <path d="M12.4 31.2h20.2v4.2H12.4z" />
          <path d="M10.4 35.4h24.2v4.2H10.4z" />
          <path d="M13.6 22.4h17.8M13.2 27h18.6" fill="none" />
        </>
      )
    }
    if (type === 'b') {
      return (
        <>
          <circle cx="22.5" cy="9.2" r="2.7" />
          <path d="M22.5 12.4c4.2 2.7 6.9 6.9 6.9 11 0 3.5-1.9 6.6-3.9 8.9h-6c-2-2.3-3.9-5.4-3.9-8.9 0-4.1 2.7-8.3 6.9-11z" />
          <path d="M13.4 32.3h18.2v3.4H13.4z" />
          <path d="M10.4 35.7h24.2v3.9H10.4z" />
          <path d="M22.5 16.6v7.2M19 20.2h7" fill="none" />
        </>
      )
    }
    if (type === 'n') {
      return (
        <>
          <path d="M25.4 8.2c-.6 2-2.1 3.2-3.9 4.2l-1.4-2.4-2.3 3.6c-3 1.6-6 3.9-7.7 7-1.3 2.4-1.8 5-1.6 7.5l3.9-2 1.2-3.2 2.6 1.3c-1.7 2.6-2.6 5.6-2.7 8.6h17.1c.7-4 .9-8.2.2-12.2-.9-5.1-3.4-9.1-6.6-12.4z" />
          <path d="M12.6 34.8h20.8v4.8H12.6z" />
          <path d="M22.8 15.4c-2.4 2-4.6 4.6-5.8 7.4M25.4 17.2c-1.6 2.6-2.6 5.6-3 8.6" fill="none" />
          <circle cx="19.4" cy="15.6" r="1.2" stroke="none" fill={line} />
        </>
      )
    }
    if (type === 'q') {
      return (
        <>
          <path d="M9.2 14.6 12.4 23h20.2l3.2-8.4-5.4 4.2-3.6-7.4-3.1 7.4-3.1-7.4-3.6 7.4z" />
          <path d="M12.6 23.4h19.8l-1.4 8.2H14z" />
          <path d="M12.4 31.4h20.2v4.2H12.4z" />
          <path d="M10.4 35.6h24.2v4H10.4z" />
          <circle cx="9.2" cy="12.4" r="2.2" />
          <circle cx="16" cy="9.6" r="2.2" />
          <circle cx="22.5" cy="8.6" r="2.2" />
          <circle cx="29" cy="9.6" r="2.2" />
          <circle cx="35.8" cy="12.4" r="2.2" />
          <path d="M14 27h17" fill="none" />
        </>
      )
    }
    return (
      <>
        <path d="M20.9 5.4h3.2v3.4h3.4V12h-3.4v3.4h-3.2V12h-3.4V8.8h3.4z" />
        <path d="M22.5 16.4c-4.6 0-8.1 1.8-10.1 5.2l1.6 9.8h17l1.6-9.8c-2-3.4-5.5-5.2-10.1-5.2z" />
        <path d="M12.4 31.4h20.2v4.2H12.4z" />
        <path d="M10.4 35.6h24.2v4H10.4z" />
        <path d="M13.4 22.6h18.2M15 27h15" fill="none" />
      </>
    )
  }

  return (
    <svg
      viewBox="0 0 45 45"
      className="pointer-events-none h-full w-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
      aria-hidden="true"
    >
      <g fill={fill} stroke={line} strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round">
        {getBody()}
      </g>
    </svg>
  )
}
