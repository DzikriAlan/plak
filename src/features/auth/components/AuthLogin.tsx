'use client'

import { useAuthControllers } from '../controllers/authControllers'

export default function AuthLogin() {
  const { storeAuthLogin } = useAuthControllers()

  const submitAuthLogin = () => {
    storeAuthLogin.mutate()
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-6 bg-[#0a0a0b] px-6 text-center text-[#f2ede1]">
      <div>
        <p className="text-[38px] font-black uppercase leading-[0.82] tracking-[-0.04em]">Waitplay</p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#a29d93]">
          Masuk untuk menambah teman
        </p>
      </div>

      <button
        type="button"
        disabled={storeAuthLogin.isPending}
        onClick={submitAuthLogin}
        className="w-full max-w-[320px] rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80 disabled:opacity-50"
      >
        {storeAuthLogin.isPending ? 'Menghubungkan...' : 'Masuk dengan Google'}
      </button>
    </div>
  )
}
