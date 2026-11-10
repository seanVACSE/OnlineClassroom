export const activityShapes = ['circle', 'square', 'triangle', 'star'] as const
export type ActivityShape = typeof activityShapes[number]

export interface CountingQuestion {
  target: ActivityShape
  shapes: ActivityShape[]
  answer: number
  choices: number[]
}

export interface PatternQuestion {
  pattern: ActivityShape[]
  answer: ActivityShape
  choices: ActivityShape[]
}

const countingCounts = [1, 2, 3, 4, 5, 2, 4, 3, 5, 4]

export const countingQuestions: CountingQuestion[] = countingCounts.map((answer, index) => {
  const target = activityShapes[index % activityShapes.length]
  const other = activityShapes[(index + 1) % activityShapes.length]
  const shapes: ActivityShape[] = []
  for (let i = 0; i < answer; i++) {
    shapes.push(target)
    if (i < 2) shapes.push(other)
  }
  const choices = answer === 1 ? [1, 2, 3] : [answer - 1, answer, answer + 1]
  const shift = index % choices.length
  return { target, shapes, answer, choices: [...choices.slice(shift), ...choices.slice(0, shift)] }
})

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
