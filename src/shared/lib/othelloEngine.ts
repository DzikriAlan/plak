export type OthelloSeat = 'p1' | 'p2'

export type OthelloResolvedMove = {
  cells: string[]
  turn: OthelloSeat
  moveTotal: number
  captureTotal: number
  isFinished: boolean
  winner: string
}

export const OTHELLO_SIZE = 8
export const OTHELLO_CELL_TOTAL = OTHELLO_SIZE * OTHELLO_SIZE

// Delapan arah mata angin dipakai untuk menelusuri jepitan bidak lawan.
const DIRECTIONS = [
  { row: -1, column: -1 },
  { row: -1, column: 0 },
  { row: -1, column: 1 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
  { row: 1, column: -1 },
  { row: 1, column: 0 },
  { row: 1, column: 1 },
]

// Sudut papan tidak bisa dibalik lagi, jadi bobotnya paling besar bagi lawan komputer.
const WEIGHTS = [
  120, -20, 20, 5, 5, 20, -20, 120,
  -20, -40, -5, -5, -5, -5, -40, -20,
  20, -5, 15, 3, 3, 15, -5, 20,
  5, -5, 3, 3, 3, 3, -5, 5,
  5, -5, 3, 3, 3, 3, -5, 5,
  20, -5, 15, 3, 3, 15, -5, 20,
  -20, -40, -5, -5, -5, -5, -40, -20,
  120, -20, 20, 5, 5, 20, -20, 120,
]

export const getOthelloRow = (index: number) => Math.floor(index / OTHELLO_SIZE)

export const getOthelloColumn = (index: number) => index % OTHELLO_SIZE

const getRivalSeat = (seat: OthelloSeat): OthelloSeat => (seat === 'p1' ? 'p2' : 'p1')

export const getOthelloNewCells = () => {
  const cells = new Array<string>(OTHELLO_CELL_TOTAL).fill('')
  cells[27] = 'p2'
  cells[28] = 'p1'
  cells[35] = 'p1'
  cells[36] = 'p2'
  return cells
}

// Satu langkah sah bila menjepit minimal satu bidak lawan pada salah satu arah.
export const getOthelloFlips = (cells: string[], seat: string, index: number) => {
  if (index < 0 || index >= OTHELLO_CELL_TOTAL || cells[index]) return []
  const rival = seat === 'p1' ? 'p2' : 'p1'
  const row = getOthelloRow(index)
  const column = getOthelloColumn(index)

  return DIRECTIONS.flatMap((direction) => {
    const line: number[] = []
    let nextRow = row + direction.row
    let nextColumn = column + direction.column

    while (nextRow >= 0 && nextRow < OTHELLO_SIZE && nextColumn >= 0 && nextColumn < OTHELLO_SIZE) {
      const step = nextRow * OTHELLO_SIZE + nextColumn
      if (cells[step] === rival) {
        line.push(step)
        nextRow += direction.row
        nextColumn += direction.column
        continue
      }
      return cells[step] === seat ? line : []
    }
    return []
  })
}

export const getOthelloLegalMoves = (cells: string[], seat: string) =>
  cells
    .map((owner, index) => index)
    .filter((index) => !cells[index] && getOthelloFlips(cells, seat, index).length > 0)

export const getOthelloSeatTotal = (cells: string[], seat: string) =>
  cells.filter((owner) => owner === seat).length

export const getOthelloIsMoveAllowed = (cells: string[], seat: string, index: number) =>
  Number.isInteger(index) && getOthelloFlips(cells, seat, index).length > 0

// Satu langkah diselesaikan penuh supaya papan kedua pemain selalu sama persis.
export const getOthelloResolvedMove = (
  cells: string[],
  seat: OthelloSeat,
  index: number,
  moveTotal: number,
): OthelloResolvedMove => {
  const flips = getOthelloFlips(cells, seat, index)
  const next = [...cells]
  next[index] = seat
  flips.forEach((step) => {
    next[step] = seat
  })

  // Pemain yang tidak punya langkah sah dilewati; bila keduanya buntu permainan berakhir.
  const rival = getRivalSeat(seat)
  const isRivalStuck = !getOthelloLegalMoves(next, rival).length
  const isSeatStuck = !getOthelloLegalMoves(next, seat).length
  const isFinished = isRivalStuck && isSeatStuck
  const turn = isRivalStuck ? seat : rival
  const hostTotal = getOthelloSeatTotal(next, 'p1')
  const guestTotal = getOthelloSeatTotal(next, 'p2')

  return {
    cells: next,
    turn,
    moveTotal: moveTotal + 1,
    captureTotal: flips.length,
    isFinished,
    winner: isFinished ? (hostTotal === guestTotal ? 'draw' : hostTotal > guestTotal ? 'p1' : 'p2') : '',
  }
}

// Lawan komputer memilih petak dengan bobot posisi tertinggi, bukan sekadar balikan terbanyak.
export const getOthelloBestMove = (cells: string[], seat: OthelloSeat) => {
  const moves = getOthelloLegalMoves(cells, seat)
  if (!moves.length) return -1

  const candidates = moves.map((index) => {
    const resolved = getOthelloResolvedMove(cells, seat, index, 0)
    const rivalMoves = getOthelloLegalMoves(resolved.cells, seat === 'p1' ? 'p2' : 'p1').length
    return { index, score: WEIGHTS[index] + resolved.captureTotal - rivalMoves * 2 + Math.random() }
  })
  return candidates.sort((left, right) => right.score - left.score)[0].index
}
