'use client'

interface Props {
  title: string
  subtitle: string
  cancelLabel: string
  confirmLabel: string
  isConfirmLoading?: boolean
  onClearGameExit: () => void
  onSubmitGameExit: () => void
}

export default function GameExitConfirm({
  title,
  subtitle,
  cancelLabel,
  confirmLabel,
  isConfirmLoading = false,
  onClearGameExit,
  onSubmitGameExit,
}: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 px-6 backdrop-blur-sm">
      <div className="w-full max-w-[340px] rounded-2xl border border-[#26262b] bg-[#121214] p-6 text-center">
        <p className="text-base font-black uppercase leading-tight tracking-tight text-[#f2ede1]">{title}</p>
        <p className="mt-2 text-[12px] font-medium leading-snug text-[#9aa3b2]">{subtitle}</p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClearGameExit}
            className="rounded-xl border border-[#3a3a42] py-3 text-[12px] font-semibold text-[#f2ede1] transition-colors hover:border-[#f2ede1]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isConfirmLoading}
            onClick={onSubmitGameExit}
            className="rounded-xl bg-[#c2372c] py-3 text-[12px] font-semibold text-[#f2ede1] transition-opacity active:opacity-80 disabled:opacity-45"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
