import { create } from 'zustand'
import type { DataUnoGame, UnoCard, UnoColor, UnoGame, UnoPlayer, UnoValue } from '../types/unoTypes'

interface UnoStore {
  unoGame: UnoGame
  setUnoInit: () => void
  setUnoPlayCard: (cardId: string) => void
  setUnoPickColor: (color: UnoColor) => void
  setUnoDrawCard: () => void
  setUnoPass: () => void
  setUnoCallUno: () => void
  setUnoBotTurn: () => void
  setUnoRestart: () => void
}

const COLORS: UnoColor[] = ['red', 'yellow', 'green', 'blue']
const NUMBERS: UnoValue[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
const ACTIONS: UnoValue[] = ['skip', 'reverse', 'draw2']
const HAND_SIZE = 7
const BOT_NAMES = ['Budi', 'Sinta', 'Rama']

export const useUnoStates = create<UnoStore>((set, get) => {
  const getShuffled = <Item>(items: Item[]) => {
    const copy = [...items]
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1))
      const holder = copy[index]
      copy[index] = copy[swap]
      copy[swap] = holder
    }
    return copy
  }

  const getDeck = () => {
    const deck: UnoCard[] = []
    let serial = 0
    const getCard = (color: UnoColor | null, value: UnoValue) => {
      serial += 1
      return { id: `${color ?? 'wild'}-${value}-${serial}`, color, value }
    }

    COLORS.forEach((color) => {
      deck.push(getCard(color, '0'))
      NUMBERS.forEach((value) => {
        deck.push(getCard(color, value))
        deck.push(getCard(color, value))
      })
      ACTIONS.forEach((value) => {
        deck.push(getCard(color, value))
        deck.push(getCard(color, value))
      })
    })
    for (let index = 0; index < 4; index += 1) {
      deck.push(getCard(null, 'wild'))
      deck.push(getCard(null, 'wild4'))
    }
    return getShuffled(deck)
  }

  const getRoomCode = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let index = 0; index < 6; index += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return code
  }

  const getIsPlayable = (card: UnoCard, activeColor: UnoColor, topCard: UnoCard | undefined) => {
    if (card.value === 'wild' || card.value === 'wild4') return true
    if (card.color === activeColor) return true
    return !!topCard && topCard.value === card.value
  }

  const getRefilledPiles = (drawPile: UnoCard[], discardPile: UnoCard[]) => {
    if (drawPile.length) return { drawPile, discardPile }
    const top = discardPile[discardPile.length - 1]
    const rest = discardPile.slice(0, -1).map((card) => ({
      ...card,
      color: card.value === 'wild' || card.value === 'wild4' ? null : card.color,
    }))
    return { drawPile: getShuffled(rest), discardPile: top ? [top] : [] }
  }

  const getDrawnCards = (drawPile: UnoCard[], discardPile: UnoCard[], total: number) => {
    let pile = drawPile
    let discard = discardPile
    const drawn: UnoCard[] = []
    for (let index = 0; index < total; index += 1) {
      const refilled = getRefilledPiles(pile, discard)
      pile = refilled.drawPile
      discard = refilled.discardPile
      const card = pile[pile.length - 1]
      if (!card) break
      pile = pile.slice(0, -1)
      drawn.push(card)
    }
    return { drawPile: pile, discardPile: discard, drawn }
  }

  const getNextPlayer = (current: number, direction: number, total: number, step: number) =>
    (((current + direction * step) % total) + total) % total

  const getNewGame = () => {
    let deck = getDeck()
    const players: UnoPlayer[] = [
      { id: 0, name: 'Anda', isHuman: true, hand: [], hasCalledUno: false },
      ...BOT_NAMES.map((name, index) => ({
        id: index + 1,
        name,
        isHuman: false,
        hand: [],
        hasCalledUno: false,
      })),
    ]

    players.forEach((player) => {
      player.hand = deck.slice(-HAND_SIZE)
      deck = deck.slice(0, -HAND_SIZE)
    })

    let starter = deck[deck.length - 1]
    while (starter && (starter.value === 'wild' || starter.value === 'wild4')) {
      deck = [starter, ...deck.slice(0, -1)]
      starter = deck[deck.length - 1]
    }
    deck = deck.slice(0, -1)

    const data: DataUnoGame = {
      roomCode: getRoomCode(),
      players,
      drawPile: deck,
      discardPile: starter ? [starter] : [],
      activeColor: starter?.color ?? 'red',
      currentPlayer: 0,
      direction: 1,
      pendingWildCardId: null,
      hasDrawnThisTurn: false,
      winnerId: null,
      lastAction: 'Permainan dimulai. Giliran Anda!',
    }
    return data
  }

  const getAppliedPlay = (data: DataUnoGame, playerIndex: number, card: UnoCard, chosenColor: UnoColor | null) => {
    const players = data.players.map((player) => ({ ...player, hand: [...player.hand] }))
    const actor = players[playerIndex]
    const total = players.length

    actor.hand = actor.hand.filter((item) => item.id !== card.id)
    const discardPile = [...data.discardPile, { ...card, color: chosenColor ?? card.color }]
    let drawPile = data.drawPile
    let workingDiscard = discardPile
    let direction = data.direction
    let step = 1
    let lastAction = `${actor.name} membuang ${card.value}`

    if (card.value === 'reverse') {
      direction = total > 2 ? -direction : direction
      step = total > 2 ? 1 : 2
      lastAction = `${actor.name} membalik arah`
    }
    if (card.value === 'skip') {
      step = 2
      lastAction = `${actor.name} melewati pemain berikutnya`
    }
    if (card.value === 'draw2' || card.value === 'wild4') {
      const victimIndex = getNextPlayer(playerIndex, direction, total, 1)
      const total4 = card.value === 'wild4' ? 4 : 2
      const result = getDrawnCards(drawPile, workingDiscard, total4)
      drawPile = result.drawPile
      workingDiscard = result.discardPile
      players[victimIndex].hand = [...players[victimIndex].hand, ...result.drawn]
      players[victimIndex].hasCalledUno = false
      step = 2
      lastAction = `${players[victimIndex].name} ambil ${total4} kartu`
    }

    if (actor.hand.length === 1 && !actor.hasCalledUno) {
      const penalty = getDrawnCards(drawPile, workingDiscard, 2)
      drawPile = penalty.drawPile
      workingDiscard = penalty.discardPile
      actor.hand = [...actor.hand, ...penalty.drawn]
      lastAction = `${actor.name} lupa bilang UNO, ambil 2 kartu`
    }
    if (actor.hand.length !== 1) actor.hasCalledUno = false

    const winnerId = actor.hand.length ? null : actor.id
    const activeColor = chosenColor ?? card.color ?? data.activeColor

    return {
      ...data,
      players,
      drawPile,
      discardPile: workingDiscard,
      activeColor,
      direction,
      currentPlayer: winnerId === null ? getNextPlayer(playerIndex, direction, total, step) : playerIndex,
      pendingWildCardId: null,
      hasDrawnThisTurn: false,
      winnerId,
      lastAction: winnerId === null ? lastAction : `${actor.name} menang!`,
    }
  }

  const getBotChoice = (data: DataUnoGame, player: UnoPlayer) => {
    const topCard = data.discardPile[data.discardPile.length - 1]
    const playable = player.hand.filter((card) => getIsPlayable(card, data.activeColor, topCard))
    if (!playable.length) return null

    const getColorScore = (color: UnoColor) => player.hand.filter((card) => card.color === color).length
    const getPriority = (card: UnoCard) => {
      if (card.value === 'wild4') return 1
      if (card.value === 'draw2' || card.value === 'skip' || card.value === 'reverse') return 3
      if (card.value === 'wild') return 2
      return 4
    }

    const sorted = [...playable].sort((left, right) => {
      const priority = getPriority(right) - getPriority(left)
      if (priority !== 0) return priority
      return getColorScore(right.color ?? 'red') - getColorScore(left.color ?? 'red')
    })
    const card = sorted[0]
    const chosenColor =
      card.value === 'wild' || card.value === 'wild4'
        ? [...COLORS].sort((left, right) => getColorScore(right) - getColorScore(left))[0]
        : null
    return { card, chosenColor }
  }

  return {
    unoGame: {
      status: 'loading',
      statusTitle: 'Menyiapkan meja',
      statusSubtitle: 'Mohon tunggu sebentar.',
      data: null,
    },

    setUnoInit: () =>
      set({
        unoGame: { status: 'success', statusTitle: '', statusSubtitle: '', data: getNewGame() },
      }),

    setUnoRestart: () =>
      set({
        unoGame: { status: 'success', statusTitle: '', statusSubtitle: '', data: getNewGame() },
      }),

    setUnoPlayCard: (cardId) => {
      const data = get().unoGame.data
      if (!data || data.winnerId !== null || data.pendingWildCardId) return

      const getRejected = (message: string) =>
        set((state) => ({ unoGame: { ...state.unoGame, data: { ...data, lastAction: message } } }))

      if (data.currentPlayer !== 0) {
        getRejected('Tunggu giliran Anda')
        return
      }

      const player = data.players[0]
      const card = player.hand.find((item) => item.id === cardId)
      const topCard = data.discardPile[data.discardPile.length - 1]
      if (!card) return
      if (!getIsPlayable(card, data.activeColor, topCard)) {
        getRejected('Kartu itu tidak cocok, pilih warna atau angka yang sama')
        return
      }

      if (card.value === 'wild' || card.value === 'wild4') {
        set((state) => ({ unoGame: { ...state.unoGame, data: { ...data, pendingWildCardId: card.id } } }))
        return
      }

      set((state) => ({ unoGame: { ...state.unoGame, data: getAppliedPlay(data, 0, card, null) } }))
    },

    setUnoPickColor: (color) => {
      const data = get().unoGame.data
      if (!data || !data.pendingWildCardId) return
      const card = data.players[0].hand.find((item) => item.id === data.pendingWildCardId)
      if (!card) return
      set((state) => ({ unoGame: { ...state.unoGame, data: getAppliedPlay(data, 0, card, color) } }))
    },

    setUnoDrawCard: () => {
      const data = get().unoGame.data
      if (!data || data.winnerId !== null || data.currentPlayer !== 0 || data.hasDrawnThisTurn) return

      const result = getDrawnCards(data.drawPile, data.discardPile, 1)
      const players = data.players.map((player) => ({ ...player, hand: [...player.hand] }))
      players[0].hand = [...players[0].hand, ...result.drawn]
      players[0].hasCalledUno = false
      const topCard = result.discardPile[result.discardPile.length - 1]
      const drawn = result.drawn[0]
      const isPlayable = !!drawn && getIsPlayable(drawn, data.activeColor, topCard)

      set((state) => ({
        unoGame: {
          ...state.unoGame,
          data: {
            ...data,
            players,
            drawPile: result.drawPile,
            discardPile: result.discardPile,
            hasDrawnThisTurn: true,
            currentPlayer: isPlayable ? 0 : getNextPlayer(0, data.direction, players.length, 1),
            lastAction: isPlayable ? 'Anda ambil kartu, masih bisa dimainkan' : 'Anda ambil kartu',
          },
        },
      }))
    },

    setUnoPass: () => {
      const data = get().unoGame.data
      if (!data || data.winnerId !== null || data.currentPlayer !== 0 || !data.hasDrawnThisTurn) return
      set((state) => ({
        unoGame: {
          ...state.unoGame,
          data: {
            ...data,
            hasDrawnThisTurn: false,
            currentPlayer: getNextPlayer(0, data.direction, data.players.length, 1),
            lastAction: 'Anda melewati giliran',
          },
        },
      }))
    },

    setUnoCallUno: () => {
      const data = get().unoGame.data
      if (!data || data.winnerId !== null || data.players[0].hand.length !== 2) return
      const players = data.players.map((player) => ({ ...player, hand: [...player.hand] }))
      players[0].hasCalledUno = true
      set((state) => ({
        unoGame: { ...state.unoGame, data: { ...data, players, lastAction: 'Anda bilang UNO!' } },
      }))
    },

    setUnoBotTurn: () => {
      const data = get().unoGame.data
      if (!data || data.winnerId !== null || data.currentPlayer === 0) return

      const index = data.currentPlayer
      const player = data.players[index]
      const choice = getBotChoice(data, player)

      if (choice) {
        const players = data.players.map((item) => ({ ...item, hand: [...item.hand] }))
        players[index].hasCalledUno = players[index].hand.length === 2
        const withCall = { ...data, players }
        set((state) => ({
          unoGame: { ...state.unoGame, data: getAppliedPlay(withCall, index, choice.card, choice.chosenColor) },
        }))
        return
      }

      const result = getDrawnCards(data.drawPile, data.discardPile, 1)
      const players = data.players.map((item) => ({ ...item, hand: [...item.hand] }))
      players[index].hand = [...players[index].hand, ...result.drawn]
      players[index].hasCalledUno = false
      const topCard = result.discardPile[result.discardPile.length - 1]
      const drawn = result.drawn[0]

      if (drawn && getIsPlayable(drawn, data.activeColor, topCard)) {
        const drawnData = { ...data, players, drawPile: result.drawPile, discardPile: result.discardPile }
        const chosenColor =
          drawn.value === 'wild' || drawn.value === 'wild4'
            ? [...COLORS].sort(
                (left, right) =>
                  players[index].hand.filter((card) => card.color === right).length -
                  players[index].hand.filter((card) => card.color === left).length,
              )[0]
            : null
        set((state) => ({
          unoGame: { ...state.unoGame, data: getAppliedPlay(drawnData, index, drawn, chosenColor) },
        }))
        return
      }

      set((state) => ({
        unoGame: {
          ...state.unoGame,
          data: {
            ...data,
            players,
            drawPile: result.drawPile,
            discardPile: result.discardPile,
            currentPlayer: getNextPlayer(index, data.direction, players.length, 1),
            lastAction: `${player.name} ambil kartu`,
          },
        },
      }))
    },
  }
})
