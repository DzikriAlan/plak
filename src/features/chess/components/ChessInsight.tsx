'use client'

import type { ChessInsight as ChessInsightItem } from '../types/chessTypes'

interface Props {
  insight: ChessInsightItem | null
  history: ChessInsightItem[]
  isHistoryOpen: boolean
  onLoadChessHistory: () => void
  onClearChessHistory: () => void
}

export default function ChessInsight({
  insight,
  history,
  isHistoryOpen,
  onLoadChessHistory,
  onClearChessHistory,
}: Props) {
  if (!insight) return null

  return (
    <section className="shrink-0 rounded-2xl border border-[#26262b] bg-[#121214] p-3">
      <div className="flex items-center gap-2">
        <span className="rounded bg-[#26262b] px-1.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#a29d93]">
          {insight.turnLabel}
        </span>
        <span className="text-sm font-black leading-none text-[#f2ede1]">
          {insight.moverLabel} {insight.san}
        </span>
        {insight.qualityLabel ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: insight.qualityTone }}>
            {insight.qualityLabel}
          </span>
        ) : null}
        <button
          type="button"
          onClick={isHistoryOpen ? onClearChessHistory : onLoadChessHistory}
          className="ml-auto shrink-0 rounded-lg border border-[#3a3a42] px-2 py-1 text-[10px] font-semibold text-[#a29d93] transition-colors hover:border-[#f2ede1] hover:text-[#f2ede1]"
        >
          {isHistoryOpen ? 'Close' : `Log (${history.length})`}
        </button>
      </div>

      <ul className="mt-2 max-h-[4.5rem] space-y-1 overflow-y-auto pr-1">
        {insight.reasons.map((reason) => (
          <li key={reason} className="text-[11px] leading-snug text-[#d7d2c7]">
            {reason}
          </li>
        ))}
        {insight.threat ? <li className="text-[11px] leading-snug text-[#f0b429]">{insight.threat}</li> : null}
        {insight.counter ? <li className="text-[11px] leading-snug text-[#e07a3f]">{insight.counter}</li> : null}
        {insight.evalText ? <li className="text-[11px] leading-snug text-[#9aa3b2]">{insight.evalText}</li> : null}
        {insight.expectedReply ? (
          <li className="text-[11px] leading-snug text-[#9aa3b2]">{insight.expectedReply}</li>
        ) : null}
        {insight.plan ? <li className="text-[11px] leading-snug text-[#9aa3b2]">{insight.plan}</li> : null}
      </ul>

      {isHistoryOpen ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/80 px-4 py-6 backdrop-blur-sm sm:items-center">
          <div className="flex max-h-full w-full max-w-[420px] flex-col rounded-2xl border border-[#26262b] bg-[#121214] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Move analysis</p>

            <ul className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {history.map((item) => (
                <li key={item.id} className="rounded-xl border border-[#26262b] p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a29d93]">
                      {item.turnLabel}
                    </span>
                    <span className="text-[13px] font-black leading-none text-[#f2ede1]">
                      {item.moverLabel} {item.san}
                    </span>
                    {item.qualityLabel ? (
                      <span
                        className="ml-auto text-[10px] font-semibold uppercase tracking-[0.1em]"
                        style={{ color: item.qualityTone }}
                      >
                        {item.qualityLabel}
                      </span>
                    ) : null}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {item.reasons.map((reason) => (
                      <li key={reason} className="text-[11px] leading-snug text-[#d7d2c7]">
                        {reason}
                      </li>
                    ))}
                    {item.threat ? <li className="text-[11px] leading-snug text-[#f0b429]">{item.threat}</li> : null}
                    {item.counter ? <li className="text-[11px] leading-snug text-[#e07a3f]">{item.counter}</li> : null}
                    {item.evalText ? <li className="text-[11px] leading-snug text-[#9aa3b2]">{item.evalText}</li> : null}
                    {item.expectedReply ? (
                      <li className="text-[11px] leading-snug text-[#9aa3b2]">{item.expectedReply}</li>
                    ) : null}
                    {item.plan ? <li className="text-[11px] leading-snug text-[#9aa3b2]">{item.plan}</li> : null}
                  </ul>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onClearChessHistory}
              className="mt-4 w-full shrink-0 rounded-xl bg-[#f2ede1] py-3 text-[13px] font-semibold text-[#0a0a0b] transition-opacity active:opacity-80"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
