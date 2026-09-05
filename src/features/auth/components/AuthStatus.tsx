'use client'

import Link from 'next/link'
import { useAuthControllers } from '../controllers/authControllers'

export default function AuthStatus() {
  const { auth, removeAuthLogout } = useAuthControllers()

  const submitAuthLogout = () => {
    removeAuthLogout.mutate()
  }

  if (auth.status === 'loading') return null

  if (auth.status !== 'success' || !auth.data) {
    return (
      <Link
        href="/login"
        className="shrink-0 rounded-full border border-[#3a3a42] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f2ede1] transition-colors hover:border-[#f2ede1]"
      >
        Masuk
      </Link>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <Link
        href="/friends"
        className="rounded-full border border-[#3a3a42] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f2ede1] transition-colors hover:border-[#f2ede1]"
      >
        Teman
      </Link>
      <button
        type="button"
        onClick={submitAuthLogout}
        title={auth.data.name || auth.data.email}
        className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#3a3a42]"
      >
        {auth.data.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={auth.data.image} alt={auth.data.name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[#121214] text-[11px] font-black text-[#f2ede1]">
            {auth.data.name.slice(0, 1).toUpperCase() || '?'}
          </span>
        )}
      </button>
    </div>
  )
}
