export type Direction = 'across' | 'down'

export interface CrosswordWord {
  id: string
  number: number
  direction: Direction
  row: number
  col: number
  answer: string
  clue: string
}

export const crosswordSize = 11

export const crosswordWords: CrosswordWord[] = [
  { id: 'autumn', number: 1, direction: 'across', row: 0, col: 4, answer: 'AUTUMN', clue: 'Another name for the season called fall.' },
  { id: 'turkey', number: 2, direction: 'down', row: 0, col: 6, answer: 'TURKEY', clue: 'A bird that gobbles.' },
  { id: 'family', number: 3, direction: 'down', row: 2, col: 0, answer: 'FAMILY', clue: 'The people in your household or relatives are your _____.' },
  { id: 'share', number: 4, direction: 'across', row: 2, col: 3, answer: 'SHARE', clue: 'To let someone else have or use some of what you have.' },
  { id: 'harvest', number: 5, direction: 'down', row: 2, col: 4, answer: 'HARVEST', clue: 'The time when farmers gather crops from the fields.' },
  { id: 'feast', number: 6, direction: 'down', row: 3, col: 10, answer: 'FEAST', clue: 'A very big special meal.' },
  { id: 'pie', number: 7, direction: 'across', row: 4, col: 8, answer: 'PIE', clue: 'A dessert with a crust and a sweet filling.' },
  { id: 'pumpkin', number: 7, direction: 'down', row: 4, col: 8, answer: 'PUMPKIN', clue: 'A big orange squash often used in a fall pie.' },
  { id: 'leaves', number: 8, direction: 'across', row: 6, col: 0, answer: 'LEAVES', clue: 'These can change color and fall from trees.' },
  { id: 'apple', number: 9, direction: 'down', row: 6, col: 2, answer: 'APPLE', clue: 'A crunchy fruit that can be red, green, or yellow.' },
  { id: 'thanks', number: 10, direction: 'across', row: 8, col: 4, answer: 'THANKS', clue: 'What you say when someone does something kind for you.' },
  { id: 'corn', number: 11, direction: 'across', row: 10, col: 5, answer: 'CORN', clue: 'A vegetable with kernels on a cob.' },
]

export function wordCells(word: CrosswordWord): { row: number; col: number; letter: string }[] {
  return [...word.answer].map((letter, index) => ({
    row: word.row + (word.direction === 'down' ? index : 0),
    col: word.col + (word.direction === 'across' ? index : 0),
    letter,
  }))
}

export function matchesAnswer(value: string, word: CrosswordWord): boolean {
  return value.trim().toUpperCase() === word.answer
}
