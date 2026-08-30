'use client'

export default function StoreHeader() {
  return (
    <header className="shrink-0">
      <p className="text-[38px] font-black uppercase leading-[0.82] tracking-[-0.04em] text-[#f2ede1] min-[360px]:text-[46px] sm:text-[64px] lg:text-[88px]">
        Waitplay
      </p>
      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#f2ede1]/85 sm:mt-2 sm:text-[13px] sm:tracking-[0.42em]">
        Game Store
      </p>
      <p className="mt-3 max-w-[34ch] text-[12px] font-medium leading-snug text-[#9aa3b2] sm:mt-5 sm:text-[15px] sm:leading-relaxed">
        Guess the picture, learn the story.
        <br />
        Play a little, understand a lot.
      </p>
    </header>
  )
}
