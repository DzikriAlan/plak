import type { UnoCard, UnoColor, UnoValue } from '@/features/uno/types/unoTypes'

export type UnoRoomPlayer = {
  seat: string
  hand: UnoCard[]
  hasCalledUno: boolean
}

export type UnoRoomState = {
  players: UnoRoomPlayer[]
  drawPile: UnoCard[]
  discardPile: UnoCard[]
  activeColor: UnoColor
  currentSeat: string
  direction: number
  hasDrawnThisTurn: boolean
  lastAction: string
}

export type UnoRoomMove = {
  action: string
  cardId?: string
  color?: string
}

export type UnoRoomResolvedMove = {
  state: UnoRoomState
  turn: string
  moveTotal: number
  isFinished: boolean
  winner: string
}

const COLORS: UnoColor[] = ['red', 'yellow', 'green', 'blue']
const NUMBERS: UnoValue[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
const ACTIONS: UnoValue[] = ['skip', 'reverse', 'draw2']
const HAND_SIZE = 7

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

export const getUnoRoomIsPlayable = (card: UnoCard, activeColor: UnoColor, topCard: UnoCard | undefined) => {
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

const getSeatIndex = (state: UnoRoomState, seat: string) => state.players.findIndex((player) => player.seat === seat)

const getNextSeat = (state: UnoRoomState, seat: string, step: number) => {
  const total = state.players.length
  const index = getSeatIndex(state, seat)
  const next = (((index + state.direction * step) % total) + total) % total
  return state.players[next].seat
}

// Kartu dibagikan di server supaya isi tangan lawan tidak pernah dikirim ke klien lain.
export const getUnoRoomNewState = (seats: string[]): UnoRoomState => {
  let deck = getDeck()
  const players = seats.map((seat) => {
    const hand = deck.slice(-HAND_SIZE)
    deck = deck.slice(0, -HAND_SIZE)
    return { seat, hand, hasCalledUno: false }
  })

  let starter = deck[deck.length - 1]
  while (starter && (starter.value === 'wild' || starter.value === 'wild4')) {
    deck = [starter, ...deck.slice(0, -1)]
    starter = deck[deck.length - 1]
  }
  deck = deck.slice(0, -1)

  return {
    players,
    drawPile: deck,
    discardPile: starter ? [starter] : [],
    activeColor: starter?.color ?? 'red',
    currentSeat: seats[0] ?? 'p1',
    direction: 1,
    hasDrawnThisTurn: false,
    lastAction: 'Permainan dimulai',
  }
}

const getAppliedPlay = (state: UnoRoomState, seat: string, card: UnoCard, chosenColor: UnoColor | null) => {
  const players = state.players.map((player) => ({ ...player, hand: [...player.hand] }))
  const index = players.findIndex((player) => player.seat === seat)
  const actor = players[index]
  const working = { ...state, players }

  actor.hand = actor.hand.filter((item) => item.id !== card.id)
  let drawPile = state.drawPile
  let discardPile = [...state.discardPile, { ...card, color: chosenColor ?? card.color }]
  let direction = state.direction
  let step = 1
  let lastAction = `${seat} membuang ${card.value}`

  if (card.value === 'reverse') {
    direction = players.length > 2 ? -direction : direction
    step = players.length > 2 ? 1 : 2
    lastAction = `${seat} membalik arah`
  }
  if (card.value === 'skip') {
    step = 2
    lastAction = `${seat} melewati pemain berikutnya`
  }
  if (card.value === 'draw2' || card.value === 'wild4') {
    const victimSeat = getNextSeat({ ...working, direction }, seat, 1)
    const victimIndex = players.findIndex((player) => player.seat === victimSeat)
    const drawTotal = card.value === 'wild4' ? 4 : 2
    const result = getDrawnCards(drawPile, discardPile, drawTotal)
    drawPile = result.drawPile
    discardPile = result.discardPile
    players[victimIndex].hand = [...players[victimIndex].hand, ...result.drawn]
    players[victimIndex].hasCalledUno = false
    step = 2
    lastAction = `${victimSeat} menarik ${drawTotal} kartu`
  }

  // Lupa meneriakkan UNO membuat pemain menarik dua kartu tambahan.
  if (actor.hand.length === 1 && !actor.hasCalledUno) {
    const penalty = getDrawnCards(drawPile, discardPile, 2)
    drawPile = penalty.drawPile
    discardPile = penalty.discardPile
    actor.hand = [...actor.hand, ...penalty.drawn]
    lastAction = `${seat} lupa bilang UNO, menarik 2 kartu`
  }
  if (actor.hand.length !== 1) actor.hasCalledUno = false

  const winner = actor.hand.length ? '' : seat
  const nextState: UnoRoomState = {
    ...state,
    players,
    drawPile,
    discardPile,
    activeColor: chosenColor ?? card.color ?? state.activeColor,
    direction,
    hasDrawnThisTurn: false,
    currentSeat: seat,
    lastAction: winner ? `${seat} menang!` : lastAction,
  }
  nextState.currentSeat = winner ? seat : getNextSeat(nextState, seat, step)
  return { state: nextState, winner }
}

export const getUnoRoomAppliedMove = (
  state: UnoRoomState,
  seat: string,
  move: UnoRoomMove,
  moveTotal: number,
): UnoRoomResolvedMove | null => {
  if (getSeatIndex(state, seat) < 0) return null

  const player = state.players.find((item) => item.seat === seat)
  if (!player) return null

  // Teriakan UNO boleh dilakukan kapan saja saat kartu tinggal dua.
  if (move.action === 'uno') {
    if (player.hand.length !== 2) return null
    const players = state.players.map((item) =>
      item.seat === seat ? { ...item, hasCalledUno: true } : { ...item, hand: [...item.hand] },
    )
    return {
      state: { ...state, players, lastAction: `${seat} bilang UNO!` },
      turn: state.currentSeat,
      moveTotal,
      isFinished: false,
      winner: '',
    }
  }

  if (state.currentSeat !== seat) return null

  if (move.action === 'play') {
    const card = player.hand.find((item) => item.id === move.cardId)
    const topCard = state.discardPile[state.discardPile.length - 1]
    if (!card || !getUnoRoomIsPlayable(card, state.activeColor, topCard)) return null

    const isWild = card.value === 'wild' || card.value === 'wild4'
    const chosenColor = COLORS.includes(move.color as UnoColor) ? (move.color as UnoColor) : null
    if (isWild && !chosenColor) return null

    const applied = getAppliedPlay(state, seat, card, isWild ? chosenColor : null)
    return {
      state: applied.state,
      turn: applied.state.currentSeat,
      moveTotal: moveTotal + 1,
      isFinished: !!applied.winner,
      winner: applied.winner,
    }
  }

  if (move.action === 'draw') {
    if (state.hasDrawnThisTurn) return null
    const result = getDrawnCards(state.drawPile, state.discardPile, 1)
    const players = state.players.map((item) =>
      item.seat === seat
        ? { ...item, hand: [...item.hand, ...result.drawn], hasCalledUno: false }
        : { ...item, hand: [...item.hand] },
    )
    const drawn = result.drawn[0]
    const topCard = result.discardPile[result.discardPile.length - 1]
    const isPlayable = !!drawn && getUnoRoomIsPlayable(drawn, state.activeColor, topCard)
    const nextState: UnoRoomState = {
      ...state,
      players,
      drawPile: result.drawPile,
      discardPile: result.discardPile,
      hasDrawnThisTurn: true,
      currentSeat: seat,
      lastAction: isPlayable ? `${seat} menarik kartu dan masih bisa membuang` : `${seat} menarik kartu`,
    }
    if (!isPlayable) {
      nextState.currentSeat = getNextSeat(nextState, seat, 1)
      nextState.hasDrawnThisTurn = false
    }
    return { state: nextState, turn: nextState.currentSeat, moveTotal: moveTotal + 1, isFinished: false, winner: '' }
  }

  if (move.action === 'pass') {
    if (!state.hasDrawnThisTurn) return null
    const nextState: UnoRoomState = { ...state, hasDrawnThisTurn: false, lastAction: `${seat} melewati giliran` }
    nextState.currentSeat = getNextSeat(nextState, seat, 1)
    return { state: nextState, turn: nextState.currentSeat, moveTotal: moveTotal + 1, isFinished: false, winner: '' }
  }

  return null
}

// Setiap pemain hanya menerima kartunya sendiri, lawan cukup jumlah kartunya.
export const getUnoRoomView = (state: UnoRoomState, seat: string | null) => {
  const topCard = state.discardPile[state.discardPile.length - 1] ?? null
  const own = state.players.find((player) => player.seat === seat)
  return {
    hand: own ? own.hand : [],
    hasCalledUno: own ? own.hasCalledUno : false,
    opponents: state.players
      .filter((player) => player.seat !== seat)
      .map((player) => ({ seat: player.seat, cardTotal: player.hand.length, hasCalledUno: player.hasCalledUno })),
    topCard,
    activeColor: state.activeColor,
    drawTotal: state.drawPile.length,
    discardTotal: state.discardPile.length,
    hasDrawnThisTurn: state.hasDrawnThisTurn,
    lastAction: state.lastAction,
  }
}
