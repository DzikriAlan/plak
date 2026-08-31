import { create } from 'zustand'
import { Chess } from 'chess.js'
import type {
  ChessCell,
  ChessColor,
  ChessInsight,
  DataChessGame,
  ChessGame,
  PayloadChessAnalysis,
} from '../types/chessTypes'

interface ChessStore {
  chessGame: ChessGame
  setChessInit: () => void
  setChessSelect: (square: string) => void
  setChessMove: (from: string, to: string, promotion?: string) => void
  setChessPromotion: (piece: string) => void
  setChessAnalysis: (payload: PayloadChessAnalysis) => void
  setChessUndo: () => void
  setChessRestart: () => void
}

const PLAYER_COLOR: ChessColor = 'w'
const CENTER_SQUARES = ['d4', 'd5', 'e4', 'e5']
const PIECE_NAMES: Record<string, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}
const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
const QUALITY_TIERS = [
  { maxLoss: 0.1, label: 'Best move', tone: '#63b36b' },
  { maxLoss: 0.4, label: 'Good move', tone: '#9ac47a' },
  { maxLoss: 0.9, label: 'Inaccuracy', tone: '#f0b429' },
  { maxLoss: 1.8, label: 'Mistake', tone: '#e07a3f' },
]
const BLUNDER_TIER = { label: 'Blunder', tone: '#d0453a' }

export const useChessStates = create<ChessStore>((set, get) => {
  const chess = new Chess()
  let insights: ChessInsight[] = []
  let whiteEval: number | null = null
  let expectedSan = ''

  const getTargets = (square: string | null) => {
    if (!square) return []
    return chess.moves({ square: square as never, verbose: true }) as Array<{ to: string; captured?: string }>
  }

  const getCheckedSquare = () => {
    if (!chess.inCheck()) return null
    const turn = chess.turn()
    const found = chess
      .board()
      .flat()
      .find((cell) => cell && cell.type === 'k' && cell.color === turn)
    return found ? found.square : null
  }

  const getBoard = (selected: string | null): ChessCell[] => {
    const targets = getTargets(selected)
    const targetMap = new Map(targets.map((move) => [move.to, !!move.captured]))
    const history = chess.history({ verbose: true }) as Array<{ from: string; to: string }>
    const last = history[history.length - 1] ?? null
    const checkedSquare = getCheckedSquare()

    return chess
      .board()
      .flat()
      .map((cell, index) => {
        const file = index % 8
        const rank = Math.floor(index / 8)
        const square = `${'abcdefgh'[file]}${8 - rank}`
        return {
          square,
          piece: cell ? { type: cell.type, color: cell.color as ChessColor } : null,
          isDark: (file + rank) % 2 === 1,
          isSelected: square === selected,
          isTarget: targetMap.has(square),
          isCapture: targetMap.get(square) === true,
          isLastMove: !!last && (last.from === square || last.to === square),
          isCheck: square === checkedSquare,
        }
      })
  }

  const getCaptured = (color: ChessColor) =>
    (chess.history({ verbose: true }) as Array<{ color: string; captured?: string }>)
      .filter((move) => move.color === color && move.captured)
      .map((move) => move.captured as string)

  const getResult = () => {
    if (chess.isCheckmate()) {
      const isPlayerWin = chess.turn() !== PLAYER_COLOR
      return {
        title: isPlayerWin ? 'Checkmate! You win' : 'Checkmate',
        subtitle: isPlayerWin ? 'Well played, the king is trapped.' : 'Raja Anda terkunci. Try again.',
      }
    }
    if (chess.isStalemate()) return { title: 'Draw', subtitle: 'Stalemate, no legal moves left.' }
    if (chess.isInsufficientMaterial()) return { title: 'Draw', subtitle: 'Insufficient material to checkmate.' }
    if (chess.isThreefoldRepetition()) return { title: 'Draw', subtitle: 'Threefold repetition.' }
    if (chess.isDraw()) return { title: 'Draw', subtitle: 'Fifty-move rule reached.' }
    return { title: '', subtitle: '' }
  }

  const getData = (selected: string | null, pendingPromotion: DataChessGame['pendingPromotion']): DataChessGame => {
    const history = chess.history({ verbose: true }) as Array<{ from: string; to: string }>
    const last = history[history.length - 1] ?? null
    const result = getResult()

    return {
      board: getBoard(selected),
      turn: chess.turn() as ChessColor,
      selected,
      lastMove: last ? { from: last.from, to: last.to } : null,
      moveTotal: history.length,
      capturedByPlayer: getCaptured('w'),
      capturedByEngine: getCaptured('b'),
      pendingPromotion,
      isCheck: chess.inCheck(),
      isFinished: chess.isGameOver(),
      resultTitle: result.title,
      resultSubtitle: result.subtitle,
      fen: chess.fen(),
      insights,
    }
  }

  const updateGame = (selected: string | null, pendingPromotion: DataChessGame['pendingPromotion'] = null) =>
    set({
      chessGame: {
        status: 'success',
        statusTitle: '',
        statusSubtitle: '',
        data: getData(selected, pendingPromotion),
      },
    })

  const getIsPromotion = (from: string, to: string) => {
    const moves = chess.moves({ square: from as never, verbose: true }) as Array<{ to: string; promotion?: string }>
    return moves.some((move) => move.to === to && !!move.promotion)
  }

  // Rangkai alasan langkah dari motif catur dasar supaya mudah dipelajari pemain.
  const getReasons = (move: {
    color: string
    from: string
    to: string
    piece: string
    captured?: string
    promotion?: string
    flags: string
    before: string
  }) => {
    const enemy = move.color === 'w' ? 'b' : 'w'
    const name = (piece: string) => PIECE_NAMES[piece] ?? 'piece'
    const before = new Chess(move.before)
    const reasons: string[] = []

    if (chess.isCheckmate()) reasons.push('Checkmate — the enemy king has no legal escape left.')
    else if (chess.inCheck()) reasons.push('Delivers check, so the opponent must answer the threat on the king first.')

    if (move.captured) {
      reasons.push(`Wins the ${name(move.captured)} on ${move.to}, worth ${PIECE_VALUES[move.captured]} points.`)
    }
    if (move.flags.includes('k')) reasons.push('Kingside castling: the king hides behind pawns and the rook joins in.')
    if (move.flags.includes('q')) reasons.push('Queenside castling: the king steps aside and the rook takes the centre file.')
    if (move.promotion) reasons.push(`Promotes the pawn into a ${name(move.promotion)} and changes the material balance.`)
    if (CENTER_SQUARES.includes(move.to) && 'pnb'.includes(move.piece)) {
      reasons.push(`Claims the centre on ${move.to}; central squares radiate control over the whole board.`)
    }
    if ('nb'.includes(move.piece) && move.from[1] === (move.color === 'w' ? '1' : '8')) {
      reasons.push(`Develops the ${name(move.piece)} off the back rank so the pieces start working together.`)
    }
    if (before.isAttacked(move.from as never, enemy as never)) {
      reasons.push(`Moves the ${name(move.piece)} away from ${move.from}, where it was under attack.`)
    }

    const guards = chess.attackers(move.to as never, move.color as never) as string[]
    if (chess.isAttacked(move.to as never, enemy as never) && !guards.length) {
      reasons.push(`Watch out: the ${name(move.piece)} on ${move.to} is attacked and nothing defends it.`)
    }
    if (!reasons.length) {
      reasons.push(`Quiet move: the ${name(move.piece)} improves its square without changing material yet.`)
    }
    return reasons
  }

  // Cari bidak lawan yang kini diserang oleh bidak yang baru saja melangkah.
  const getThreat = (move: { color: string; to: string }) => {
    const enemy = move.color === 'w' ? 'b' : 'w'
    const targets = chess
      .board()
      .flat()
      .filter((cell) => cell && cell.color === enemy && cell.type !== 'k')
      .map((cell) => cell as { square: string; type: string })
      .filter((cell) => (chess.attackers(cell.square as never, move.color as never) as string[]).includes(move.to))
      .map((cell) => `${PIECE_NAMES[cell.type]} on ${cell.square}`)

    if (!targets.length) return ''
    const head = targets.slice(0, -1).join(', ')
    const tail = targets[targets.length - 1]
    return `Creates a threat against the ${head ? `${head} and the ${tail}` : tail}.`
  }

  const getInsight = (move: {
    color: string
    from: string
    to: string
    piece: string
    san: string
    captured?: string
    promotion?: string
    flags: string
    before: string
  }): ChessInsight => {
    const isPlayer = move.color === PLAYER_COLOR
    const counter = expectedSan && expectedSan !== move.san ? `Answered ${move.san} instead of the predicted ${expectedSan}.` : ''

    return {
      id: `${chess.history().length}-${move.san}`,
      turnLabel: `Move ${Math.ceil(chess.history().length / 2)}`,
      moverLabel: isPlayer ? 'White' : 'Black',
      color: move.color as ChessColor,
      san: move.san,
      reasons: getReasons(move),
      threat: getThreat(move),
      plan: '',
      expectedReply: '',
      counter,
      evalText: '',
      qualityLabel: '',
      qualityTone: '#a29d93',
    }
  }

  const setInsight = (from: string, to: string, promotion?: string) => {
    const move = chess.move({ from, to, promotion: promotion ?? 'q' }) as unknown as Parameters<typeof getInsight>[0]
    insights = [...insights, getInsight(move)]
    expectedSan = ''
  }

  return {
    chessGame: {
      status: 'loading',
      statusTitle: 'Preparing board',
      statusSubtitle: 'Please wait a moment.',
      data: null,
    },

    setChessInit: () => {
      chess.reset()
      insights = []
      whiteEval = null
      expectedSan = ''
      updateGame(null)
    },

    setChessRestart: () => {
      chess.reset()
      insights = []
      whiteEval = null
      expectedSan = ''
      updateGame(null)
    },

    setChessSelect: (square) => {
      const data = get().chessGame.data
      if (!data || data.isFinished || data.pendingPromotion) return

      const piece = chess.get(square as never)
      if (piece && piece.color === chess.turn()) {
        updateGame(data.selected === square ? null : square)
        return
      }
      updateGame(null)
    },

    setChessMove: (from, to, promotion) => {
      const data = get().chessGame.data
      if (!data || data.isFinished) return

      if (!promotion && getIsPromotion(from, to)) {
        updateGame(null, { from, to })
        return
      }

      try {
        setInsight(from, to, promotion)
      } catch {
        updateGame(null)
        return
      }
      updateGame(null)
    },

    setChessPromotion: (piece) => {
      const data = get().chessGame.data
      if (!data?.pendingPromotion) return
      const { from, to } = data.pendingPromotion
      try {
        setInsight(from, to, piece)
      } catch {
        updateGame(null)
        return
      }
      updateGame(null)
    },

    // Lengkapi insight langkah terakhir dengan skor engine, mutu langkah, dan rencana lanjutan.
    setChessAnalysis: (payload) => {
      const target = insights[insights.length - 1]
      if (!target || payload.fen !== chess.fen()) return

      const turn = chess.turn()
      const getSigned = (value: number) => (turn === 'w' ? value : -value)

      const getEvalText = () => {
        if (payload.scoreMate !== null) {
          const mateFor = getSigned(payload.scoreMate) > 0 ? 'White' : 'Black'
          return `Mate in ${Math.abs(payload.scoreMate)} for ${mateFor}`
        }
        const pawns = getSigned(payload.scoreCp ?? 0) / 100
        if (Math.abs(pawns) < 0.2) return 'Balanced position (0.0)'
        return `${pawns > 0 ? 'White' : 'Black'} is better (${pawns > 0 ? '+' : ''}${pawns.toFixed(2)})`
      }

      const getQuality = (score: number) => {
        if (whiteEval === null) return { label: 'Opening move', tone: '#a29d93' }
        const loss = (whiteEval - score) * (target.color === 'w' ? 1 : -1)
        return QUALITY_TIERS.find((tier) => loss <= tier.maxLoss) ?? BLUNDER_TIER
      }

      const getSanLine = () => {
        const replay = new Chess(payload.fen)
        const line: string[] = []
        payload.pv.slice(0, 5).forEach((uci) => {
          try {
            const step = replay.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? 'q' })
            line.push(step.san)
          } catch {
            /* PV bisa memuat langkah yang tidak lagi legal, cukup hentikan rangkaian. */
          }
        })
        return line
      }

      const mateScore = payload.scoreMate !== null ? (payload.scoreMate > 0 ? 40 : -40) : null
      const score = getSigned(mateScore ?? (payload.scoreCp ?? 0) / 100)
      const quality = getQuality(score)
      const line = getSanLine()

      expectedSan = line[0] ?? ''
      whiteEval = score
      insights = insights.map((insight, index) =>
        index !== insights.length - 1
          ? insight
          : {
              ...insight,
              evalText: getEvalText(),
              qualityLabel: quality.label,
              qualityTone: quality.tone,
              expectedReply: line[0] ? `Expected reply: ${line[0]}.` : '',
              plan: line.length > 1 ? `Engine line (depth ${payload.depth}): ${line.join(' ')}` : '',
            },
      )
      updateGame(get().chessGame.data?.selected ?? null)
    },

    setChessUndo: () => {
      const data = get().chessGame.data
      if (!data) return
      chess.undo()
      if (chess.turn() !== PLAYER_COLOR) chess.undo()
      insights = insights.slice(0, chess.history().length)
      whiteEval = null
      expectedSan = ''
      updateGame(null)
    },
  }
})
