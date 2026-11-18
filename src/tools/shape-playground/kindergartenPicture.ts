import { answerColors, type PictureRegion } from './mysteryPictureData.ts'

export const kindergartenColors: Record<number, { name: string; fill: string }> = {
  ...answerColors,
  0: { name: 'white', fill: '#ffffff' },
  1: { name: 'pink', fill: '#f3a9c5' },
}

export function kindergartenNumber(puzzleId: string, region: PictureRegion): number {
  if (puzzleId === 'house' && (region.id === 'window-left' || region.id === 'window-right')) return 0
  if (puzzleId === 'garden' && (region.id === 'cloud-left' || region.id === 'cloud-right')) return 0
  if (puzzleId === 'garden' && region.id.startsWith('right-petal-')) return 1
  return region.addends[0] + region.addends[1]
}
