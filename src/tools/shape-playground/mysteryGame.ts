import type { PictureRegion } from './mysteryPictureData'

export const retryDelayMs = 5000

export interface PictureProgress {
  solved: string[]
  colored: string[]
}

export function checkAnswer(region: PictureRegion, value: number, retryAt: number, now: number): 'wait' | 'wrong' | 'correct' {
  if (now < retryAt) return 'wait'
  return value === region.addends[0] + region.addends[1] ? 'correct' : 'wrong'
}

export function solveRegion(progress: PictureProgress, region: PictureRegion): PictureProgress {
  if (progress.solved.includes(region.id)) return progress
  return { ...progress, solved: [...progress.solved, region.id] }
}

export function colorRegion(progress: PictureProgress, region: PictureRegion, colorAnswer: number | null): PictureProgress {
  if (!progress.solved.includes(region.id) || progress.colored.includes(region.id) || colorAnswer !== region.addends[0] + region.addends[1]) return progress
  return { ...progress, colored: [...progress.colored, region.id] }
}
