'use client'

interface Level {
  id: number
  label: string
}

interface Mode {
  id: string
  label: string
  hint: string
}

interface Props {
  modes: Mode[]
  activeMode: string
  levels: Level[]
  activeLevel: number
  isUndoDisabled: boolean
  isSoundOn: boolean
  onEditChessSound: () => void
  onEditChessMode: (modeId: string) => void
  onEditChessLevel: (levelId: number) => void
  onLoadChessUndo: () => void
  onClearChessGame: () => void
  onClearChessSettings: () => void
}

export default function ChessSettings({
  modes,
  activeMode,
  levels,
  activeLevel,
  isUndoDisabled,
  isSoundOn,
  onEditChessSound,
  onEditChessMode,
  onEditChessLevel,
  onLoadChessUndo,
  onClearChessGame,
  onClearChessSettings,
}: Props) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-[360px] overflow-y-auto rounded-2xl border border-[#26262b] bg-[#121214] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Settings</p>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a29d93]">Mode</p>
        <div className="mt-2 grid gap-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              aria-pressed={mode.id === activeMode}
              onClick={() => onEditChessMode(mode.id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                mode.id === activeMode
                  ? 'border-[#f2ede1] bg-[#f2ede1] text-[#0a0a0b]'
                  : 'border-[#3a3a42] text-[#f2ede1] hover:border-[#f2ede1]'
              }`}
            >
              <span className="block text-[13px] font-medium leading-none">{mode.label}</span>
              <span className={`mt-1 block text-[10px] leading-snug ${mode.id === activeMode ? 'text-[#0a0a0b]/70' : 'text-[#a29d93]'}`}>
                {mode.hint}
              </span>
            </button>
          ))}
        </div>

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
