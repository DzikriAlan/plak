'use client'

interface Props {
  name: string
}

const INK = '#141416'

export default function AnimalMatchingIcon({ name }: Props) {
  const getShape = () => {
    if (name === 'beruang') {
      return (
        <>
          <circle cx="13" cy="14" r="7" fill="#8a5a34" />
          <circle cx="35" cy="14" r="7" fill="#8a5a34" />
          <circle cx="24" cy="27" r="16" fill="#a9713f" />
          <ellipse cx="24" cy="32" rx="8" ry="6" fill="#e8d5b8" />
          <circle cx="18" cy="24" r="2" fill={INK} stroke="none" />
          <circle cx="30" cy="24" r="2" fill={INK} stroke="none" />
          <circle cx="24" cy="30" r="2.4" fill={INK} stroke="none" />
        </>
      )
    }
    if (name === 'rubah') {
      return (
        <>
          <path d="M8 12 13 30 24 36 35 30 40 12 30 18H18Z" fill="#e0703a" />
          <path d="M24 36 18 26h12Z" fill="#f2ede1" />
          <circle cx="18" cy="23" r="2" fill={INK} stroke="none" />
          <circle cx="30" cy="23" r="2" fill={INK} stroke="none" />
          <circle cx="24" cy="31" r="2" fill={INK} stroke="none" />
        </>
      )
    }
    if (name === 'kucing') {
      return (
        <>
          <path d="M10 10 14 22 34 22 38 10 30 16H18Z" fill="#9aa3b2" />
          <circle cx="24" cy="28" r="14" fill="#b8c0cc" />
          <circle cx="18" cy="26" r="2.2" fill={INK} stroke="none" />
          <circle cx="30" cy="26" r="2.2" fill={INK} stroke="none" />
          <path d="M24 31v3M20 34h8" fill="none" />
        </>
      )
    }
    if (name === 'sapi') {
      return (
        <>
          <path d="M6 14c-2-5 3-8 6-5M42 14c2-5-3-8-6-5" fill="#e8e2d4" />
          <circle cx="24" cy="26" r="16" fill="#f2ede1" />
          <path d="M13 18a7 7 0 0 1 9 3l-9 4Z" fill={INK} stroke="none" />
          <ellipse cx="24" cy="33" rx="9" ry="6" fill="#f4a6b8" />
          <circle cx="20" cy="33" r="1.6" fill={INK} stroke="none" />
          <circle cx="28" cy="33" r="1.6" fill={INK} stroke="none" />
          <circle cx="18" cy="24" r="2" fill={INK} stroke="none" />
          <circle cx="31" cy="24" r="2" fill={INK} stroke="none" />
        </>
      )
    }
    if (name === 'babi') {
      return (
        <>
          <path d="M9 13 14 22h4ZM39 13 34 22h-4Z" fill="#f0a3b8" />
          <circle cx="24" cy="27" r="15" fill="#f4b3c6" />
          <ellipse cx="24" cy="31" rx="8" ry="6" fill="#e07f9c" />
          <circle cx="21" cy="31" r="1.6" fill={INK} stroke="none" />
          <circle cx="27" cy="31" r="1.6" fill={INK} stroke="none" />
          <circle cx="18" cy="22" r="2" fill={INK} stroke="none" />
          <circle cx="30" cy="22" r="2" fill={INK} stroke="none" />
        </>
      )
    }
    if (name === 'katak') {
      return (
        <>
          <circle cx="14" cy="14" r="7" fill="#7fb832" />
          <circle cx="34" cy="14" r="7" fill="#7fb832" />
          <circle cx="14" cy="14" r="2.6" fill={INK} stroke="none" />
          <circle cx="34" cy="14" r="2.6" fill={INK} stroke="none" />
          <path d="M6 24a18 12 0 0 0 36 0Z" fill="#8cc63f" />
          <path d="M16 33h16" fill="none" />
        </>
      )
    }
    if (name === 'ayam') {
      return (
        <>
          <path d="M20 8c1-4 7-4 8 0" fill="#e0452a" />
          <circle cx="24" cy="27" r="15" fill="#f5c518" />
          <path d="M24 27 34 31l-10 4Z" fill="#e07b1f" />
          <circle cx="19" cy="23" r="2.2" fill={INK} stroke="none" />
          <circle cx="30" cy="23" r="2.2" fill={INK} stroke="none" />
        </>
      )
    }
    if (name === 'kelinci') {
      return (
        <>
          <ellipse cx="17" cy="12" rx="4.5" ry="10" fill="#f2ede1" />
          <ellipse cx="31" cy="12" rx="4.5" ry="10" fill="#f2ede1" />
          <circle cx="24" cy="30" r="13" fill="#f7f4ec" />
          <circle cx="19" cy="28" r="2" fill={INK} stroke="none" />
          <circle cx="29" cy="28" r="2" fill={INK} stroke="none" />
          <path d="M24 33v2M21 36h6" fill="none" />
        </>
      )
    }
    if (name === 'panda') {
      return (
        <>
          <circle cx="12" cy="14" r="6" fill={INK} />
          <circle cx="36" cy="14" r="6" fill={INK} />
          <circle cx="24" cy="27" r="16" fill="#f7f4ec" />
          <ellipse cx="18" cy="25" rx="4.5" ry="5.5" fill={INK} stroke="none" />
          <ellipse cx="30" cy="25" rx="4.5" ry="5.5" fill={INK} stroke="none" />
          <circle cx="24" cy="33" r="2.4" fill={INK} stroke="none" />
        </>
      )
    }
    if (name === 'singa') {
      return (
        <>
          <circle cx="24" cy="25" r="19" fill="#c2711f" />
          <circle cx="24" cy="26" r="12" fill="#f0b429" />
          <circle cx="19" cy="24" r="2" fill={INK} stroke="none" />
          <circle cx="29" cy="24" r="2" fill={INK} stroke="none" />
          <path d="M24 29v3M20 33h8" fill="none" />
        </>
      )
    }
    if (name === 'monyet') {
      return (
        <>
          <circle cx="10" cy="24" r="6" fill="#a9713f" />
          <circle cx="38" cy="24" r="6" fill="#a9713f" />
          <circle cx="24" cy="25" r="15" fill="#8a5a34" />
          <ellipse cx="24" cy="30" rx="10" ry="9" fill="#e8c9a0" />
          <circle cx="20" cy="24" r="2" fill={INK} stroke="none" />
          <circle cx="28" cy="24" r="2" fill={INK} stroke="none" />
          <path d="M20 33q4 3 8 0" fill="none" />
        </>
      )
    }
    if (name === 'gajah') {
      return (
        <>
          <ellipse cx="10" cy="22" rx="8" ry="11" fill="#8b93a1" />
          <ellipse cx="38" cy="22" rx="8" ry="11" fill="#8b93a1" />
          <circle cx="24" cy="24" r="13" fill="#a3abb8" />
          <path d="M24 30v10q0 4 5 4" fill="none" strokeWidth="5" />
          <circle cx="19" cy="22" r="2" fill={INK} stroke="none" />
          <circle cx="29" cy="22" r="2" fill={INK} stroke="none" />
        </>
      )
    }
    if (name === 'ikan') {
      return (
        <>
          <path d="M40 12 30 24l10 12Z" fill="#2f6d9e" />
          <ellipse cx="20" cy="24" rx="16" ry="11" fill="#3b8fd4" />
          <circle cx="12" cy="21" r="2.4" fill={INK} stroke="none" />
          <path d="M22 16q6 8 0 16" fill="none" />
        </>
      )
    }
    if (name === 'domba') {
      return (
        <>
          <circle cx="14" cy="20" r="8" fill="#f2ede1" />
          <circle cx="34" cy="20" r="8" fill="#f2ede1" />
          <circle cx="24" cy="14" r="8" fill="#f2ede1" />
          <circle cx="24" cy="30" r="12" fill="#f7f4ec" />
          <ellipse cx="24" cy="30" rx="9" ry="8" fill="#4a4a52" />
          <circle cx="21" cy="29" r="1.6" fill="#f7f4ec" stroke="none" />
          <circle cx="27" cy="29" r="1.6" fill="#f7f4ec" stroke="none" />
        </>
      )
    }
    if (name === 'harimau') {
      return (
        <>
          <path d="M10 12 14 22h6ZM38 12 34 22h-6Z" fill="#e07b1f" />
          <circle cx="24" cy="27" r="15" fill="#f0a02a" />
          <path d="M17 15v6M24 13v5M31 15v6" fill="none" />
          <circle cx="19" cy="26" r="2" fill={INK} stroke="none" />
          <circle cx="29" cy="26" r="2" fill={INK} stroke="none" />
          <path d="M24 31v2M20 35h8" fill="none" />
        </>
      )
    }
    return (
      <>
        <ellipse cx="24" cy="26" rx="13" ry="17" fill={INK} />
        <ellipse cx="24" cy="30" rx="8" ry="12" fill="#f7f4ec" />
        <path d="M24 22 31 26l-7 4Z" fill="#f0b429" />
        <circle cx="20" cy="18" r="1.8" fill="#f7f4ec" stroke="none" />
        <circle cx="28" cy="18" r="1.8" fill="#f7f4ec" stroke="none" />
      </>
    )
  }

  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
        {getShape()}
      </g>
    </svg>
  )
}
