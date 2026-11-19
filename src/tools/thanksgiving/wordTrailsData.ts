export interface TrailWord {
  word: string
  cells: number[]
  special?: boolean
}

export interface TrailPuzzle {
  id: string
  name: string
  theme: string
  rows: string[]
  words: TrailWord[]
}

export const trailPuzzles: TrailPuzzle[] = [
  {
    id: 'foods',
    name: 'Thanksgiving Foods',
    theme: 'What might you find on a Thanksgiving table?',
    rows: ['DKEMSA', 'IRYAMH', 'NGUTYE', 'NRANIP', 'EVRRLS', 'RYCOOL'],
    words: [
      { word: 'DINNER', cells: [0, 6, 12, 18, 24, 30], special: true },
      { word: 'TURKEY', cells: [15, 14, 7, 1, 2, 8] },
      { word: 'GRAVY', cells: [13, 19, 20, 25, 31] },
      { word: 'CORN', cells: [32, 33, 26, 21] },
      { word: 'ROLLS', cells: [27, 34, 35, 28, 29] },
      { word: 'PIE', cells: [23, 22, 17] },
      { word: 'YAMS', cells: [16, 9, 3, 4] },
      { word: 'HAM', cells: [11, 5, 10] },
    ],
  },
  {
    id: 'fall',
    name: 'Fall Things',
    theme: 'What might you see or feel in the fall?',
    rows: ['AUPSEA', 'UMPLEV', 'TKNNHY', 'UIAIDA', 'MCNPWE', 'NORAPL'],
    words: [
      { word: 'AUTUMN', cells: [0, 6, 12, 18, 24, 30], special: true },
      { word: 'LEAVES', cells: [9, 4, 5, 11, 10, 3] },
      { word: 'PUMPKIN', cells: [2, 1, 7, 8, 13, 19, 14] },
      { word: 'ACORN', cells: [20, 25, 31, 32, 26] },
      { word: 'APPLE', cells: [33, 27, 34, 35, 29] },
      { word: 'WIND', cells: [28, 21, 15, 22] },
      { word: 'HAY', cells: [16, 23, 17] },
    ],
  },
]

export function adjacent(a: number, b: number, columns: number): boolean {
  const rowDistance = Math.abs(Math.floor(a / columns) - Math.floor(b / columns))
  const colDistance = Math.abs(a % columns - b % columns)
  return a !== b && rowDistance <= 1 && colDistance <= 1
}

export function extendTrail(path: number[], cell: number, columns: number): number[] {
  if (!path.length) return [cell]
  if (path.length > 1 && path[path.length - 2] === cell) return path.slice(0, -1)
  if (path.includes(cell) || !adjacent(path[path.length - 1], cell, columns)) return path
  return [...path, cell]
}

export function matchingTrail(puzzle: TrailPuzzle, path: number[]): TrailWord | undefined {
  return puzzle.words.find((word) => word.cells.length === path.length &&
    (word.cells.every((cell, index) => cell === path[index]) ||
     word.cells.every((cell, index) => cell === path[path.length - 1 - index])))
}
