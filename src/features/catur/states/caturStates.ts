import { create } from 'zustand'
import { Chess } from 'chess.js'
import type { CaturCell, CaturColor, DataCaturGame, CaturGame } from '../types/caturTypes'

interface CaturStore {
  caturGame: CaturGame
  setCaturInit: () => void
  setCaturSelect: (square: string) => void
  setCaturMove: (from: string, to: string, promotion?: string) => void
  setCaturPromotion: (piece: string) => void
  setCaturUndo: () => void
  setCaturRestart: () => void
}

const PLAYER_COLOR: CaturColor = 'w'

export const useCaturStates = create<CaturStore>((set, get) => {
  const chess = new Chess()

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

  const getBoard = (selected: string | null): CaturCell[] => {
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
          piece: cell ? { type: cell.type, color: cell.color as CaturColor } : null,
          isDark: (file + rank) % 2 === 1,
          isSelected: square === selected,
          isTarget: targetMap.has(square),
          isCapture: targetMap.get(square) === true,
          isLastMove: !!last && (last.from === square || last.to === square),
          isCheck: square === checkedSquare,
        }
      })
  }

  const getCaptured = (color: CaturColor) =>
    (chess.history({ verbose: true }) as Array<{ color: string; captured?: string }>)
      .filter((move) => move.color === color && move.captured)
      .map((move) => move.captured as string)

  const getResult = () => {
    if (chess.isCheckmate()) {
      const isPlayerWin = chess.turn() !== PLAYER_COLOR
      return {
        title: isPlayerWin ? 'Skakmat! Anda menang' : 'Skakmat',
        subtitle: isPlayerWin ? 'Luar biasa, rajanya terkunci.' : 'Raja Anda terkunci. Coba lagi.',
      }
    }
    if (chess.isStalemate()) return { title: 'Remis', subtitle: 'Stalemate, tidak ada langkah sah.' }
    if (chess.isInsufficientMaterial()) return { title: 'Remis', subtitle: 'Materi tidak cukup untuk skakmat.' }
    if (chess.isThreefoldRepetition()) return { title: 'Remis', subtitle: 'Posisi berulang tiga kali.' }
    if (chess.isDraw()) return { title: 'Remis', subtitle: 'Aturan lima puluh langkah tercapai.' }
    return { title: '', subtitle: '' }
  }

  const getData = (selected: string | null, pendingPromotion: DataCaturGame['pendingPromotion']): DataCaturGame => {
    const history = chess.history({ verbose: true }) as Array<{ from: string; to: string }>
    const last = history[history.length - 1] ?? null
    const result = getResult()

    return {
      board: getBoard(selected),
      turn: chess.turn() as CaturColor,
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
    }
  }

  const updateGame = (selected: string | null, pendingPromotion: DataCaturGame['pendingPromotion'] = null) =>
    set({
      caturGame: {
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

  return {
    caturGame: {
      status: 'loading',
      statusTitle: 'Menyiapkan papan',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },

    setCaturInit: () => {
      chess.reset()
      updateGame(null)
    },

    setCaturRestart: () => {
      chess.reset()
      updateGame(null)
    },

    setCaturSelect: (square) => {
      const data = get().caturGame.data
      if (!data || data.isFinished || data.pendingPromotion) return

      const piece = chess.get(square as never)
      if (piece && piece.color === chess.turn()) {
        updateGame(data.selected === square ? null : square)
        return
      }
      updateGame(null)
    },

    setCaturMove: (from, to, promotion) => {
      const data = get().caturGame.data
      if (!data || data.isFinished) return

      if (!promotion && getIsPromotion(from, to)) {
        updateGame(null, { from, to })
        return
      }

      try {
        chess.move({ from, to, promotion: promotion ?? 'q' })
      } catch {
        updateGame(null)
        return
      }
      updateGame(null)
    },

    setCaturPromotion: (piece) => {
      const data = get().caturGame.data
      if (!data?.pendingPromotion) return
      const { from, to } = data.pendingPromotion
      try {
        chess.move({ from, to, promotion: piece })
      } catch {
        updateGame(null)
        return
      }
      updateGame(null)
    },

    setCaturUndo: () => {
      const data = get().caturGame.data
      if (!data) return
      chess.undo()
      if (chess.turn() !== PLAYER_COLOR) chess.undo()
      updateGame(null)
    },
  }
})
