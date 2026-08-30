'use client'

interface Level {
  id: number
  label: string
}

interface Props {
  levels: Level[]
  activeLevel: number
  isUndoDisabled: boolean
  isSoundOn: boolean
  onEditChessSound: () => void
  onEditChessLevel: (levelId: number) => void
  onLoadChessUndo: () => void
  onClearChessGame: () => void
  onClearChessSettings: () => void
}

export default function ChessSettings({
  levels,
  activeLevel,
  isUndoDisabled,
  isSoundOn,
  onEditChessSound,
  onEditChessLevel,
  onLoadChessUndo,
  onClearChessGame,
  onClearChessSettings,
}: Props) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <div className="w-full max-w-[360px] rounded-2xl border border-[#26262b] bg-[#121214] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Settings</p>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a29d93]">Difficulty</p>
        <div className="mt-2 grid gap-2">
          {levels.map((level) => (
            <button
              key={level.id}
              type="button"
              aria-pressed={level.id === activeLevel}
              onClick={() => onEditChessLevel(level.id)}
              className={`rounded-xl border py-2.5 text-[13px] font-medium transition-colors ${
                level.id === activeLevel
                  ? 'border-[#f2ede1] bg-[#f2ede1] text-[#0a0a0b]'
                  : 'border-[#3a3a42] text-[#f2ede1] hover:border-[#f2ede1]'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a29d93]">Audio</p>
        <button
          type="button"
          aria-pressed={isSoundOn}
          onClick={onEditChessSound}
          className={`mt-2 w-full rounded-xl border py-2.5 text-[13px] font-medium transition-colors ${
            isSoundOn
              ? 'border-[#f2ede1] bg-[#f2ede1] text-[#0a0a0b]'
              : 'border-[#3a3a42] text-[#f2ede1] hover:border-[#f2ede1]'
          }`}
        >
          Sound: {isSoundOn ? 'On' : 'Off'}
        </button>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isUndoDisabled}
            onClick={onLoadChessUndo}
            className="rounded-xl border border-[#3a3a42] py-2.5 text-[13px] font-medium text-[#f2ede1] transition-colors hover:border-[#f2ede1] disabled:opacity-30"
          >
            Undo move
          </button>
          <button
            type="button"
            onClick={onClearChessGame}
            className="rounded-xl border border-[#3a3a42] py-2.5 text-[13px] font-medium text-[#f2ede1] transition-colors hover:border-[#f2ede1]"
          >
            New game
          </button>
        </div>

        <button
          type="button"
          onClick={onClearChessSettings}
          className="mt-3 w-full rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
        >
          Close
        </button>
      </div>
    </div>
  )
}
