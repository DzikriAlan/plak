export type RubikFaceKey = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

export type RubikAxis = 'x' | 'y' | 'z'

// Selain enam sisi luar, tiga lapisan tengah ikut didukung supaya usapan di baris tengah tetap bisa memutar.
export type RubikTurnKey = RubikFaceKey | 'M' | 'E' | 'S'

export const RUBIK_SIZE = 3
export const RUBIK_FACE_TOTAL = RUBIK_SIZE * RUBIK_SIZE
export const RUBIK_FACES: RubikFaceKey[] = ['U', 'R', 'F', 'D', 'L', 'B']

// Warna standar kubus: putih di atas, kuning di bawah, dan empat sisi mengelilinginya.
export const RUBIK_COLORS: Record<RubikFaceKey, string> = {
  U: '#f2ede1',
  R: '#e0452a',
  F: '#2f8f46',
  D: '#f0b429',
  L: '#e8862c',
  B: '#3b6fd4',
}

// Setiap putaran adalah rotasi 90 derajat satu lapisan; tanda negatif berarti searah jarum jam
// bila dilihat dari arah sumbu positif.
export const RUBIK_TURNS: Record<RubikTurnKey, { axis: RubikAxis; layer: number; sign: number }> = {
  U: { axis: 'y', layer: 1, sign: -1 },
  D: { axis: 'y', layer: -1, sign: 1 },
  R: { axis: 'x', layer: 1, sign: -1 },
  L: { axis: 'x', layer: -1, sign: 1 },
  F: { axis: 'z', layer: 1, sign: -1 },
  B: { axis: 'z', layer: -1, sign: 1 },
  M: { axis: 'x', layer: 0, sign: 1 },
  E: { axis: 'y', layer: 0, sign: 1 },
  S: { axis: 'z', layer: 0, sign: -1 },
}

const AXIS_SLOT: Record<RubikAxis, number> = { x: 0, y: 1, z: 2 }

// Satu stiker dikenali dari kubus kecil yang ditempelinya dan arah hadapnya, sehingga seluruh
// aturan putaran cukup diturunkan dari rotasi ruang, bukan dari daftar siklus yang ditulis tangan.
export const getRubikStickerPlace = (face: RubikFaceKey, index: number) => {
  const across = (index % RUBIK_SIZE) - 1
  const down = Math.floor(index / RUBIK_SIZE) - 1
  if (face === 'U') return { position: [across, 1, down], normal: [0, 1, 0] }
  if (face === 'D') return { position: [across, -1, -down], normal: [0, -1, 0] }
  if (face === 'F') return { position: [across, -down, 1], normal: [0, 0, 1] }
  if (face === 'B') return { position: [-across, -down, -1], normal: [0, 0, -1] }
  if (face === 'R') return { position: [1, -down, -across], normal: [1, 0, 0] }
  return { position: [-1, -down, across], normal: [-1, 0, 0] }
}

const getPlaceKey = (position: number[], normal: number[]) => `${position.join(',')}|${normal.join(',')}`

const getSlotMap = () => {
  const slots = new Map<string, number>()
  RUBIK_FACES.forEach((face, faceIndex) => {
    for (let index = 0; index < RUBIK_FACE_TOTAL; index += 1) {
      const place = getRubikStickerPlace(face, index)
      slots.set(getPlaceKey(place.position, place.normal), faceIndex * RUBIK_FACE_TOTAL + index)
    }
  })
  return slots
}

const SLOTS = getSlotMap()

const getRotatedVector = (vector: number[], axis: RubikAxis, sign: number) => {
  const [x, y, z] = vector
  if (axis === 'x') return [x, -z * sign, y * sign]
  if (axis === 'y') return [z * sign, y, -x * sign]
  return [-y * sign, x * sign, z]
}

const permutations = new Map<string, number[]>()

// Perpindahan stiker dihitung sekali per jenis putaran, lalu dipakai ulang setiap langkah.
const getPermutation = (turn: RubikTurnKey, isPrime: boolean) => {
  const cacheKey = `${turn}${isPrime ? "'" : ''}`
  const cached = permutations.get(cacheKey)
  if (cached) return cached

  const setting = RUBIK_TURNS[turn]
  const sign = isPrime ? -setting.sign : setting.sign
  const slot = AXIS_SLOT[setting.axis]
  const permutation = new Array<number>(RUBIK_FACES.length * RUBIK_FACE_TOTAL)

  RUBIK_FACES.forEach((face, faceIndex) => {
    for (let index = 0; index < RUBIK_FACE_TOTAL; index += 1) {
      const source = faceIndex * RUBIK_FACE_TOTAL + index
      const place = getRubikStickerPlace(face, index)
      if (place.position[slot] !== setting.layer) {
        permutation[source] = source
        continue
      }
      const position = getRotatedVector(place.position, setting.axis, sign)
      const normal = getRotatedVector(place.normal, setting.axis, sign)
      permutation[source] = SLOTS.get(getPlaceKey(position, normal)) ?? source
    }
  })

  permutations.set(cacheKey, permutation)
  return permutation
}

export const getRubikSolvedFacelets = () =>
  RUBIK_FACES.flatMap((face) => new Array<string>(RUBIK_FACE_TOTAL).fill(face))

// Kubus dianggap rapi bila setiap sisinya berwarna seragam, termasuk saat lapisan tengah ikut diputar.
export const getRubikIsSolved = (facelets: string[]) =>
  RUBIK_FACES.every((face, index) => {
    const start = index * RUBIK_FACE_TOTAL
    const first = facelets[start]
    return facelets.slice(start, start + RUBIK_FACE_TOTAL).every((sticker) => sticker === first)
  })

export const getRubikTurnedFacelets = (facelets: string[], turn: RubikTurnKey, isPrime: boolean) => {
  const permutation = getPermutation(turn, isPrime)
  const next = [...facelets]
  permutation.forEach((target, source) => {
    next[target] = facelets[source]
  })
  return next
}

// Acakan dibuat tanpa mengulang sisi yang sama berturut-turut supaya benar-benar teraduk.
export const getRubikScramble = (total: number) => {
  const moves: Array<{ turn: RubikTurnKey; isPrime: boolean }> = []
  let lastFace: RubikFaceKey | null = null
  for (let step = 0; step < total; step += 1) {
    const options = RUBIK_FACES.filter((face) => face !== lastFace)
    const face = options[Math.floor(Math.random() * options.length)]
    moves.push({ turn: face, isPrime: Math.random() < 0.5 })
    lastFace = face
  }
  return moves
}
