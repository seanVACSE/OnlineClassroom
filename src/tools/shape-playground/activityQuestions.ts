export const activityShapes = ['circle', 'square', 'triangle', 'star'] as const
export type ActivityShape = typeof activityShapes[number]
export const activityColors = ['red', 'blue', 'yellow', 'purple'] as const
export type ActivityColor = typeof activityColors[number]

export interface ColoredShape {
  shape: ActivityShape
  color: ActivityColor
}

export interface CountingQuestion {
  target: ActivityShape
  color?: ActivityColor
  shapes: ColoredShape[]
  answer: number
  choices: number[]
}

export interface SortingQuestion {
  sortBy: 'shape' | 'color'
  bins: [ActivityShape, ActivityShape] | [ActivityColor, ActivityColor]
  shapes: ColoredShape[]
}

export interface PatternQuestion {
  pattern: ActivityShape[]
  answer: ActivityShape
  choices: ActivityShape[]
}

const countingCounts = [3, 5, 4, 6, 5, 7, 6, 8, 7, 8]

export const countingQuestions: CountingQuestion[] = countingCounts.map((answer, index) => {
  const target = activityShapes[index % activityShapes.length]
  const other = activityShapes[(index + 1) % activityShapes.length]
  const color = index >= 4 ? activityColors[(index + 2) % activityColors.length] : undefined
  const targetColor = color ?? activityColors[index % activityColors.length]
  const otherColor = activityColors[(activityColors.indexOf(targetColor) + 1) % activityColors.length]
  const shapes: ColoredShape[] = []
  for (let i = 0; i < answer; i++) {
    shapes.push({ shape: target, color: color ?? activityColors[(index + i) % activityColors.length] })
    if (i === 0) shapes.push({ shape: other, color: targetColor })
    if (i === 1) shapes.push({ shape: color ? target : other, color: otherColor })
    if (i === 2) shapes.push({ shape: other, color: otherColor })
  }
  const choices = [answer - 1, answer, answer + 1]
  const shift = index % choices.length
  return { target, color, shapes, answer, choices: [...choices.slice(shift), ...choices.slice(0, shift)] }
})

export const sortingQuestions: SortingQuestion[] = [
  { sortBy: 'shape', bins: ['circle', 'square'], shapes: [
    { shape: 'circle', color: 'red' }, { shape: 'square', color: 'blue' }, { shape: 'circle', color: 'yellow' },
    { shape: 'square', color: 'red' }, { shape: 'square', color: 'yellow' }, { shape: 'circle', color: 'blue' },
  ] },
  { sortBy: 'color', bins: ['yellow', 'blue'], shapes: [
    { shape: 'circle', color: 'yellow' }, { shape: 'star', color: 'blue' }, { shape: 'square', color: 'yellow' },
    { shape: 'circle', color: 'blue' }, { shape: 'triangle', color: 'yellow' }, { shape: 'square', color: 'blue' },
  ] },
  { sortBy: 'shape', bins: ['triangle', 'star'], shapes: [
    { shape: 'star', color: 'purple' }, { shape: 'triangle', color: 'purple' }, { shape: 'star', color: 'red' },
    { shape: 'triangle', color: 'blue' }, { shape: 'triangle', color: 'red' }, { shape: 'star', color: 'blue' },
  ] },
  { sortBy: 'color', bins: ['red', 'purple'], shapes: [
    { shape: 'star', color: 'red' }, { shape: 'star', color: 'purple' }, { shape: 'circle', color: 'red' },
    { shape: 'triangle', color: 'purple' }, { shape: 'square', color: 'red' }, { shape: 'circle', color: 'purple' },
  ] },
  { sortBy: 'shape', bins: ['square', 'star'], shapes: [
    { shape: 'square', color: 'blue' }, { shape: 'star', color: 'blue' }, { shape: 'star', color: 'yellow' },
    { shape: 'square', color: 'purple' }, { shape: 'star', color: 'purple' }, { shape: 'square', color: 'yellow' },
  ] },
  { sortBy: 'color', bins: ['blue', 'yellow'], shapes: [
    { shape: 'triangle', color: 'blue' }, { shape: 'triangle', color: 'yellow' }, { shape: 'star', color: 'yellow' },
    { shape: 'square', color: 'blue' }, { shape: 'circle', color: 'yellow' }, { shape: 'star', color: 'blue' },
  ] },
]

export const patternQuestions: PatternQuestion[] = Array.from({ length: 10 }, (_, index) => {
  const first = activityShapes[index % activityShapes.length]
  const second = activityShapes[(index + 1) % activityShapes.length]
  const third = activityShapes[(index + 2) % activityShapes.length]
  const pattern = index < 5
    ? [first, second, first, second, first]
    : [first, first, second, first, first]
  const answer = second
  const choices = [first, second, third]
  const shift = index % choices.length
  return { pattern, answer, choices: [...choices.slice(shift), ...choices.slice(0, shift)] }
})
