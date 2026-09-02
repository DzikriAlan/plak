export type DotsAndBoxesSeat = 'p1' | 'p2'

export type DotsAndBoxesResolvedMove = {
  lines: string[]
  owners: string[]
  turn: DotsAndBoxesSeat
  moveTotal: number
  captureTotal: number
  isFinished: boolean
  winner: string
}

export const DOTS_AND_BOXES_DOT_TOTAL = 5
export const DOTS_AND_BOXES_CELL_TOTAL = DOTS_AND_BOXES_DOT_TOTAL - 1
export const DOTS_AND_BOXES_BOX_TOTAL = DOTS_AND_BOXES_CELL_TOTAL * DOTS_AND_BOXES_CELL_TOTAL
// Garis mendatar disimpan lebih dulu, lalu garis tegak, supaya satu nomor cukup mewakili satu ruas.
export const DOTS_AND_BOXES_ROW_LINE_TOTAL = DOTS_AND_BOXES_DOT_TOTAL * DOTS_AND_BOXES_CELL_TOTAL
export const DOTS_AND_BOXES_LINE_TOTAL = DOTS_AND_BOXES_ROW_LINE_TOTAL * 2

export const getDotsAndBoxesRowLineIndex = (row: number, column: number) => row * DOTS_AND_BOXES_CELL_TOTAL + column

export const getDotsAndBoxesColumnLineIndex = (row: number, column: number) =>
  DOTS_AND_BOXES_ROW_LINE_TOTAL + row * DOTS_AND_BOXES_DOT_TOTAL + column

export const getDotsAndBoxesNewLines = () => new Array<string>(DOTS_AND_BOXES_LINE_TOTAL).fill('')

export const getDotsAndBoxesNewOwners = () => new Array<string>(DOTS_AND_BOXES_BOX_TOTAL).fill('')

export const getDotsAndBoxesBoxRow = (boxIndex: number) => Math.floor(boxIndex / DOTS_AND_BOXES_CELL_TOTAL)

export const getDotsAndBoxesBoxColumn = (boxIndex: number) => boxIndex % DOTS_AND_BOXES_CELL_TOTAL

// Empat ruas pembentuk satu kotak: atas, bawah, kiri, kanan.
export const getDotsAndBoxesBoxLines = (boxIndex: number) => {
  const row = getDotsAndBoxesBoxRow(boxIndex)
  const column = getDotsAndBoxesBoxColumn(boxIndex)
  return [
    getDotsAndBoxesRowLineIndex(row, column),
    getDotsAndBoxesRowLineIndex(row + 1, column),
    getDotsAndBoxesColumnLineIndex(row, column),
    getDotsAndBoxesColumnLineIndex(row, column + 1),
  ]
}

const getRivalSeat = (seat: DotsAndBoxesSeat): DotsAndBoxesSeat => (seat === 'p1' ? 'p2' : 'p1')

const getBoxIndexes = () => Array.from({ length: DOTS_AND_BOXES_BOX_TOTAL }, (_, index) => index)

const getSeatTotal = (owners: string[], seat: string) => owners.filter((owner) => owner === seat).length

export const getDotsAndBoxesIsMoveAllowed = (lines: string[], lineIndex: number) =>
  Number.isInteger(lineIndex) && lineIndex >= 0 && lineIndex < DOTS_AND_BOXES_LINE_TOTAL && !lines[lineIndex]

// Satu langkah diselesaikan penuh supaya papan pemain dan papan lawan selalu sama.
export const getDotsAndBoxesResolvedMove = (
  lines: string[],
  owners: string[],
  seat: DotsAndBoxesSeat,
  lineIndex: number,
  moveTotal: number,
): DotsAndBoxesResolvedMove => {
  const nextLines = [...lines]
  const nextOwners = [...owners]
  nextLines[lineIndex] = seat

  // Kotak yang keempat ruasnya baru saja lengkap menjadi milik pemain yang menutupnya.
  const captured = getBoxIndexes().filter(
    (boxIndex) => !nextOwners[boxIndex] && getDotsAndBoxesBoxLines(boxIndex).every((line) => nextLines[line]),
  )
  captured.forEach((boxIndex) => {
    nextOwners[boxIndex] = seat
  })

  // Menutup kotak memberi giliran tambahan, seperti aturan dots and boxes pada umumnya.
  const turn = captured.length ? seat : getRivalSeat(seat)
  const isFinished = nextOwners.every((owner) => !!owner)
  const hostTotal = getSeatTotal(nextOwners, 'p1')
  const guestTotal = getSeatTotal(nextOwners, 'p2')

  return {
    lines: nextLines,
    owners: nextOwners,
    turn,
    moveTotal: moveTotal + 1,
    captureTotal: captured.length,
    isFinished,
    winner: isFinished ? (hostTotal === guestTotal ? 'draw' : hostTotal > guestTotal ? 'p1' : 'p2') : '',
  }
}

// Lawan komputer mengutamakan kotak yang bisa langsung ditutup, lalu menghindari memberi umpan.
export const getDotsAndBoxesBestLine = (lines: string[], owners: string[]) => {
  const getSideTotal = (source: string[], boxIndex: number) =>
    getDotsAndBoxesBoxLines(boxIndex).filter((line) => source[line]).length

  const getBoxesOfLine = (lineIndex: number) =>
    getBoxIndexes().filter((boxIndex) => getDotsAndBoxesBoxLines(boxIndex).includes(lineIndex))

  const candidates = lines
    .map((owner, lineIndex) => ({ owner, lineIndex }))
    .filter((line) => !line.owner)
    .map((line) => {
      const next = [...lines]
      next[line.lineIndex] = 'p2'
      const boxes = getBoxesOfLine(line.lineIndex).filter((boxIndex) => !owners[boxIndex])
      const gain = boxes.filter((boxIndex) => getSideTotal(next, boxIndex) === 4).length
      const risk = boxes.filter((boxIndex) => getSideTotal(next, boxIndex) === 3).length
      return { lineIndex: line.lineIndex, score: gain * 10 - risk * 5 + Math.random() }
    })

  if (!candidates.length) return -1
  return candidates.sort((left, right) => right.score - left.score)[0].lineIndex
}
