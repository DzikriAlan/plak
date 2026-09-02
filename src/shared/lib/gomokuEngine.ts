export type GomokuSeat = 'p1' | 'p2'

export type GomokuResolvedMove = {
  cells: string[]
  turn: GomokuSeat
  moveTotal: number
  winningLine: number[]
  isFinished: boolean
  winner: string
}

export const GOMOKU_SIZE = 15
export const GOMOKU_CELL_TOTAL = GOMOKU_SIZE * GOMOKU_SIZE
export const GOMOKU_WIN_TOTAL = 5

// Empat arah cukup karena setiap garis ditelusuri ke dua sisi sekaligus.
const DIRECTIONS = [
  { row: 0, column: 1 },
  { row: 1, column: 0 },
  { row: 1, column: 1 },
  { row: 1, column: -1 },
]

export const getGomokuRow = (index: number) => Math.floor(index / GOMOKU_SIZE)

export const getGomokuColumn = (index: number) => index % GOMOKU_SIZE

const getRivalSeat = (seat: GomokuSeat): GomokuSeat => (seat === 'p1' ? 'p2' : 'p1')

export const getGomokuNewCells = () => new Array<string>(GOMOKU_CELL_TOTAL).fill('')

export const getGomokuIsMoveAllowed = (cells: string[], index: number) =>
  Number.isInteger(index) && index >= 0 && index < GOMOKU_CELL_TOTAL && !cells[index]

// Garis kemenangan dikembalikan utuh supaya papan bisa menyorot lima batu penentu.
export const getGomokuWinningLine = (cells: string[], index: number) => {
  const seat = cells[index]
  if (!seat) return []
  const row = getGomokuRow(index)
  const column = getGomokuColumn(index)

  const getLine = (direction: { row: number; column: number }) => {
    const line = [index]
    const getSide = (sign: number) => {
      for (let step = 1; step < GOMOKU_SIZE; step += 1) {
        const nextRow = row + direction.row * step * sign
        const nextColumn = column + direction.column * step * sign
        if (nextRow < 0 || nextRow >= GOMOKU_SIZE || nextColumn < 0 || nextColumn >= GOMOKU_SIZE) return
        const cell = nextRow * GOMOKU_SIZE + nextColumn
        if (cells[cell] !== seat) return
        line.push(cell)
      }
    }
    getSide(1)
    getSide(-1)
    return line
  }

  const found = DIRECTIONS.map((direction) => getLine(direction)).find((line) => line.length >= GOMOKU_WIN_TOTAL)
  return found ? found.sort((left, right) => left - right) : []
}

export const getGomokuResolvedMove = (
  cells: string[],
  seat: GomokuSeat,
  index: number,
  moveTotal: number,
): GomokuResolvedMove => {
  const next = [...cells]
  next[index] = seat

  const winningLine = getGomokuWinningLine(next, index)
  const isBoardFull = next.every((cell) => !!cell)
  const isFinished = !!winningLine.length || isBoardFull

  return {
    cells: next,
    turn: isFinished ? seat : getRivalSeat(seat),
    moveTotal: moveTotal + 1,
    winningLine,
    isFinished,
    winner: winningLine.length ? seat : isBoardFull ? 'draw' : '',
  }
}

// Lawan komputer menilai setiap petak kosong dari panjang deretan yang bisa dibentuk kedua pihak.
export const getGomokuBestMove = (cells: string[], seat: GomokuSeat) => {
  const rival = getRivalSeat(seat)
  const center = Math.floor(GOMOKU_CELL_TOTAL / 2)
  if (cells.every((cell) => !cell)) return center

  const getRunScore = (index: number, target: string) => {
    const row = getGomokuRow(index)
    const column = getGomokuColumn(index)

    return DIRECTIONS.reduce((total, direction) => {
      let run = 0
      let openTotal = 0
      const getSide = (sign: number) => {
        for (let step = 1; step < GOMOKU_WIN_TOTAL; step += 1) {
          const nextRow = row + direction.row * step * sign
          const nextColumn = column + direction.column * step * sign
          if (nextRow < 0 || nextRow >= GOMOKU_SIZE || nextColumn < 0 || nextColumn >= GOMOKU_SIZE) return
          const cell = cells[nextRow * GOMOKU_SIZE + nextColumn]
          if (cell === target) {
            run += 1
            continue
          }
          if (!cell) openTotal += 1
          return
        }
      }
      getSide(1)
      getSide(-1)
      // Deretan yang lebih panjang dan masih punya ruang tumbuh dinilai jauh lebih berharga.
      const reach = Math.min(run, GOMOKU_WIN_TOTAL - 1)
      return total + Math.pow(10, reach) * (openTotal ? 1 : 0.2)
    }, 0)
  }

  const getIsNearStone = (index: number) => {
    const row = getGomokuRow(index)
    const column = getGomokuColumn(index)
    for (let stepRow = -2; stepRow <= 2; stepRow += 1) {
      for (let stepColumn = -2; stepColumn <= 2; stepColumn += 1) {
        const nextRow = row + stepRow
        const nextColumn = column + stepColumn
        if (nextRow < 0 || nextRow >= GOMOKU_SIZE || nextColumn < 0 || nextColumn >= GOMOKU_SIZE) continue
        if (cells[nextRow * GOMOKU_SIZE + nextColumn]) return true
      }
    }
    return false
  }

  const candidates = cells
    .map((cell, index) => ({ cell, index }))
    .filter((item) => !item.cell && getIsNearStone(item.index))
    .map((item) => ({
      index: item.index,
      // Menyerang sedikit lebih diutamakan daripada bertahan supaya bot tidak hanya menjegal.
      score: getRunScore(item.index, seat) * 1.2 + getRunScore(item.index, rival) + Math.random(),
    }))

  if (!candidates.length) return cells.findIndex((cell) => !cell)
  return candidates.sort((left, right) => right.score - left.score)[0].index
}
