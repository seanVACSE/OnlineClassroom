export interface PictureRegion {
  id: string
  name: string
  path: string
  labelX: number
  labelY: number
  addends: [number, number]
}

export interface MysteryPuzzle {
  id: string
  difficulty: 'Easy' | 'Medium'
  regions: PictureRegion[]
}

export const answerColors: Record<number, { name: string; fill: string }> = {
  3: { name: 'blue', fill: '#8bc8e8' },
  5: { name: 'red', fill: '#e98172' },
  6: { name: 'brown', fill: '#ad7854' },
  8: { name: 'green', fill: '#8acb88' },
  9: { name: 'yellow', fill: '#f5d875' },
}

function skyRegions(labels: [[number, number], [number, number], [number, number], [number, number]]): PictureRegion[] {
  const sections: Omit<PictureRegion, 'labelX' | 'labelY'>[] = [
    { id: 'sky-top-left', name: 'upper left sky', path: 'M 0 0 H 400 V 260 H 0 Z', addends: [0, 3] },
    { id: 'sky-top-right', name: 'upper right sky', path: 'M 400 0 H 800 V 260 H 400 Z', addends: [1, 2] },
    { id: 'sky-bottom-left', name: 'lower left sky', path: 'M 0 260 H 400 V 520 H 0 Z', addends: [2, 1] },
    { id: 'sky-bottom-right', name: 'lower right sky', path: 'M 400 260 H 800 V 520 H 400 Z', addends: [3, 0] },
  ]
  return sections.map((section, index) => ({ ...section, labelX: labels[index][0], labelY: labels[index][1] }))
}

const house: PictureRegion[] = [
  ...skyRegions([[200, 45], [540, 50], [195, 350], [675, 350]]),
  { id: 'sun', name: 'sun', path: 'M 670 48 a 46 46 0 1 0 0 92 a 46 46 0 1 0 0 -92', labelX: 670, labelY: 94, addends: [5, 4] },
  { id: 'roof-left', name: 'left roof', path: 'M 210 230 L 400 105 L 400 230 Z', labelX: 345, labelY: 204, addends: [2, 3] },
  { id: 'roof-right', name: 'right roof', path: 'M 400 105 L 590 230 L 400 230 Z', labelX: 455, labelY: 204, addends: [4, 1] },
  { id: 'wall-left', name: 'left wall', path: 'M 230 230 H 400 V 315 H 370 V 420 H 230 Z M 255 280 H 325 V 350 H 255 Z', labelX: 350, labelY: 265, addends: [4, 5] },
  { id: 'wall-right', name: 'right wall', path: 'M 400 230 H 570 V 420 H 430 V 315 H 400 Z M 475 280 H 545 V 350 H 475 Z', labelX: 450, labelY: 265, addends: [6, 3] },
  { id: 'window-left', name: 'left window', path: 'M 255 280 H 325 V 350 H 255 Z', labelX: 290, labelY: 315, addends: [1, 2] },
  { id: 'window-right', name: 'right window', path: 'M 475 280 H 545 V 350 H 475 Z', labelX: 510, labelY: 315, addends: [0, 3] },
  { id: 'door', name: 'door', path: 'M 370 315 H 430 V 420 H 370 Z', labelX: 400, labelY: 360, addends: [4, 2] },
  { id: 'tree-left', name: 'left tree top', path: 'M 110 110 C 45 110 35 175 60 205 C 30 255 65 290 110 280 Z', labelX: 80, labelY: 211, addends: [3, 5] },
  { id: 'tree-right', name: 'right tree top', path: 'M 110 110 C 175 110 185 175 160 205 C 190 255 155 290 110 280 Z', labelX: 140, labelY: 211, addends: [6, 2] },
  { id: 'trunk', name: 'tree trunk', path: 'M 90 280 H 130 V 420 H 90 Z', labelX: 110, labelY: 350, addends: [5, 1] },
  { id: 'grass-left', name: 'left grass', path: 'M 15 420 H 400 V 505 H 15 Z', labelX: 205, labelY: 465, addends: [7, 1] },
  { id: 'grass-right', name: 'right grass', path: 'M 400 420 H 785 V 505 H 400 Z', labelX: 590, labelY: 465, addends: [4, 4] },
]

const garden: PictureRegion[] = [
  ...skyRegions([[35, 40], [480, 40], [70, 315], [730, 315]]),
  { id: 'sun', name: 'sun', path: 'M 670 50 a 50 50 0 1 0 0 100 a 50 50 0 1 0 0 -100', labelX: 670, labelY: 100, addends: [7, 2] },
  { id: 'cloud-left', name: 'left cloud', path: 'M 55 115 Q 45 85 80 80 Q 90 45 125 65 Q 150 45 170 80 Q 205 80 200 115 Z', labelX: 125, labelY: 98, addends: [2, 1] },
  { id: 'cloud-right', name: 'right cloud', path: 'M 260 100 Q 250 70 285 65 Q 295 30 330 50 Q 355 30 375 65 Q 410 65 405 100 Z', labelX: 330, labelY: 83, addends: [3, 0] },
  { id: 'left-stem', name: 'left flower stem', path: 'M 235 270 H 275 V 440 H 235 Z', labelX: 255, labelY: 377, addends: [5, 3] },
  { id: 'left-leaf', name: 'left flower leaf', path: 'M 235 385 Q 150 390 160 325 Q 215 322 235 365 Z', labelX: 200, labelY: 355, addends: [4, 4] },
  { id: 'left-leaf-right', name: 'right leaf of left flower', path: 'M 275 395 Q 355 395 350 330 Q 295 328 275 375 Z', labelX: 310, labelY: 361, addends: [6, 2] },
  { id: 'left-petal-top', name: 'top petal of left flower', path: 'M 235 205 C 205 160 220 130 255 130 C 290 130 305 160 275 205 Z', labelX: 255, labelY: 171, addends: [3, 2] },
  { id: 'left-petal-left', name: 'left petal of left flower', path: 'M 220 205 C 170 175 140 195 145 225 C 150 255 180 265 220 240 Z', labelX: 183, labelY: 223, addends: [4, 1] },
  { id: 'left-petal-right', name: 'right petal of left flower', path: 'M 290 205 C 340 175 370 195 365 225 C 360 255 330 265 290 240 Z', labelX: 327, labelY: 223, addends: [0, 5] },
  { id: 'left-petal-bottom', name: 'bottom petal of left flower', path: 'M 235 250 C 205 295 220 325 255 325 C 290 325 305 295 275 250 Z', labelX: 255, labelY: 292, addends: [2, 3] },
  { id: 'left-center', name: 'center of left flower', path: 'M 255 195 a 33 33 0 1 0 0 66 a 33 33 0 1 0 0 -66', labelX: 255, labelY: 228, addends: [4, 5] },
  { id: 'right-stem', name: 'right flower stem', path: 'M 525 290 H 565 V 440 H 525 Z', labelX: 545, labelY: 389, addends: [7, 1] },
  { id: 'right-leaf-left', name: 'left leaf of right flower', path: 'M 525 405 Q 445 405 450 345 Q 505 340 525 380 Z', labelX: 490, labelY: 372, addends: [2, 6] },
  { id: 'right-leaf', name: 'right flower leaf', path: 'M 565 395 Q 650 400 645 340 Q 590 335 565 375 Z', labelX: 610, labelY: 369, addends: [3, 5] },
  { id: 'right-petal-top', name: 'top petal of right flower', path: 'M 525 225 C 495 180 510 150 545 150 C 580 150 595 180 565 225 Z', labelX: 545, labelY: 191, addends: [2, 1] },
  { id: 'right-petal-left', name: 'left petal of right flower', path: 'M 510 225 C 460 195 430 215 435 245 C 440 275 470 285 510 260 Z', labelX: 473, labelY: 243, addends: [1, 2] },
  { id: 'right-petal-right', name: 'right petal of right flower', path: 'M 580 225 C 630 195 660 215 655 245 C 650 275 620 285 580 260 Z', labelX: 617, labelY: 243, addends: [0, 3] },
  { id: 'right-petal-bottom', name: 'bottom petal of right flower', path: 'M 525 270 C 495 315 510 345 545 345 C 580 345 595 315 565 270 Z', labelX: 545, labelY: 312, addends: [3, 0] },
  { id: 'right-center', name: 'center of right flower', path: 'M 545 215 a 33 33 0 1 0 0 66 a 33 33 0 1 0 0 -66', labelX: 545, labelY: 248, addends: [6, 3] },
  { id: 'grass-left', name: 'left grass', path: 'M 15 440 H 400 V 505 H 15 Z', labelX: 200, labelY: 473, addends: [1, 7] },
  { id: 'grass-right', name: 'right grass', path: 'M 400 440 H 785 V 505 H 400 Z', labelX: 600, labelY: 473, addends: [5, 3] },
]

const rocket: PictureRegion[] = [
  ...skyRegions([[210, 40], [570, 40], [160, 450], [625, 275]]),
  { id: 'star-left', name: 'left star', path: 'M 100 48 L 112 77 L 143 80 L 119 100 L 126 130 L 100 113 L 74 130 L 81 100 L 57 80 L 88 77 Z', labelX: 100, labelY: 93, addends: [4, 5] },
  { id: 'star-right', name: 'right star', path: 'M 675 55 L 687 84 L 718 87 L 694 107 L 701 137 L 675 120 L 649 137 L 656 107 L 632 87 L 663 84 Z', labelX: 675, labelY: 100, addends: [7, 2] },
  { id: 'nose-left', name: 'left rocket nose', path: 'M 280 165 Q 300 90 400 35 V 165 Z', labelX: 350, labelY: 133, addends: [3, 2] },
  { id: 'nose-right', name: 'right rocket nose', path: 'M 400 35 Q 500 90 520 165 H 400 Z', labelX: 450, labelY: 133, addends: [1, 4] },
  { id: 'body-top-left', name: 'upper left rocket body', path: 'M 280 165 H 400 V 260 H 280 Z M 330 177 H 390 V 237 H 330 Z', labelX: 306, labelY: 222, addends: [4, 5] },
  { id: 'body-top-right', name: 'upper right rocket body', path: 'M 400 165 H 520 V 260 H 400 Z M 410 177 H 470 V 237 H 410 Z', labelX: 495, labelY: 222, addends: [8, 1] },
  { id: 'window-left', name: 'left rocket window', path: 'M 330 177 H 390 V 237 H 330 Z', labelX: 360, labelY: 207, addends: [2, 1] },
  { id: 'window-right', name: 'right rocket window', path: 'M 410 177 H 470 V 237 H 410 Z', labelX: 440, labelY: 207, addends: [0, 3] },
  { id: 'body-middle-left', name: 'middle left rocket body', path: 'M 280 260 H 400 V 325 H 280 Z', labelX: 340, labelY: 292, addends: [6, 3] },
  { id: 'body-middle-right', name: 'middle right rocket body', path: 'M 400 260 H 520 V 325 H 400 Z', labelX: 460, labelY: 292, addends: [5, 4] },
  { id: 'body-bottom-left', name: 'lower left rocket body', path: 'M 280 325 H 400 V 390 H 280 Z', labelX: 340, labelY: 357, addends: [7, 2] },
  { id: 'body-bottom-right', name: 'lower right rocket body', path: 'M 400 325 H 520 V 390 H 400 Z', labelX: 460, labelY: 357, addends: [4, 5] },
  { id: 'fin-left-top', name: 'upper left fin', path: 'M 280 265 L 215 325 H 280 Z', labelX: 255, labelY: 310, addends: [2, 3] },
  { id: 'fin-left-bottom', name: 'lower left fin', path: 'M 215 325 H 280 V 390 H 215 Z', labelX: 248, labelY: 357, addends: [5, 0] },
  { id: 'fin-right-top', name: 'upper right fin', path: 'M 520 265 L 585 325 H 520 Z', labelX: 545, labelY: 310, addends: [4, 1] },
  { id: 'fin-right-bottom', name: 'lower right fin', path: 'M 520 325 H 585 V 390 H 520 Z', labelX: 552, labelY: 357, addends: [3, 2] },
  { id: 'flame-left', name: 'left flame', path: 'M 305 390 H 365 L 335 485 Z', labelX: 335, labelY: 414, addends: [5, 4] },
  { id: 'flame-middle', name: 'middle flame', path: 'M 370 390 H 430 L 400 505 Z', labelX: 400, labelY: 415, addends: [1, 4] },
  { id: 'flame-right', name: 'right flame', path: 'M 435 390 H 495 L 465 485 Z', labelX: 465, labelY: 414, addends: [6, 3] },
  { id: 'planet', name: 'planet', path: 'M 685 325 a 65 65 0 1 0 0 130 a 65 65 0 1 0 0 -130', labelX: 685, labelY: 390, addends: [3, 3] },
  { id: 'moon', name: 'moon', path: 'M 90 300 C 10 330 20 430 110 440 C 70 400 70 345 90 300 Z', labelX: 62, labelY: 374, addends: [9, 0] },
]

export const mysteryPuzzles: MysteryPuzzle[] = [
  { id: 'house', difficulty: 'Easy', regions: house },
  { id: 'garden', difficulty: 'Medium', regions: garden },
  { id: 'rocket', difficulty: 'Medium', regions: rocket },
]
