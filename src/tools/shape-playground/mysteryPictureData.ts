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
  details?: string[]
}

export const answerColors: Record<number, { name: string; fill: string }> = {
  2: { name: 'light blue', fill: '#deeff4' },
  3: { name: 'blue', fill: '#8bc8e8' },
  4: { name: 'blue-gray', fill: '#71859b' },
  5: { name: 'red', fill: '#e98172' },
  6: { name: 'brown', fill: '#ad7854' },
  7: { name: 'orange', fill: '#f3b26d' },
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

const penguins: PictureRegion[] = [
  ...skyRegions([[100, 40], [700, 40], [45, 290], [755, 290]]),
  { id: 'sun', name: 'sun', path: 'M 670 55 a 48 48 0 1 0 0 96 a 48 48 0 1 0 0 -96', labelX: 670, labelY: 103, addends: [5, 4] },
  { id: 'ice-left', name: 'left ice hill', path: 'M 0 320 Q 55 285 110 315 Q 160 260 230 320 L 290 360 H 0 Z', labelX: 110, labelY: 330, addends: [1, 1] },
  { id: 'ice-right', name: 'right ice hill', path: 'M 530 350 Q 600 270 650 320 Q 715 275 800 325 V 365 Z', labelX: 748, labelY: 343, addends: [0, 2] },
  { id: 'ice-front-left', name: 'left ice floe', path: 'M 0 390 Q 115 370 245 395 Q 320 410 400 400 V 520 H 0 Z', labelX: 90, labelY: 455, addends: [1, 1] },
  { id: 'ice-front-right', name: 'right ice floe', path: 'M 400 400 Q 510 380 620 400 Q 710 385 800 400 V 520 H 400 Z', labelX: 705, labelY: 455, addends: [2, 0] },
  { id: 'big-left-wing', name: 'big penguin left flipper', path: 'M 270 225 C 220 225 190 300 202 347 C 208 370 235 354 268 317 Z', labelX: 226, labelY: 300, addends: [2, 2] },
  { id: 'big-right-wing', name: 'big penguin right flipper', path: 'M 430 225 C 480 225 510 300 498 347 C 492 370 465 354 432 317 Z', labelX: 474, labelY: 300, addends: [3, 1] },
  { id: 'big-left-foot', name: 'big penguin left foot', path: 'M 270 375 Q 235 390 235 414 Q 275 430 320 405 L 320 375 Z', labelX: 273, labelY: 402, addends: [4, 3] },
  { id: 'big-right-foot', name: 'big penguin right foot', path: 'M 380 375 L 380 405 Q 425 430 465 414 Q 465 390 430 375 Z', labelX: 427, labelY: 402, addends: [5, 2] },
  { id: 'big-body', name: 'big penguin body', path: 'M 250 270 C 250 190 290 145 350 145 C 410 145 450 190 450 270 L 450 326 C 450 388 412 407 350 407 C 288 407 250 388 250 326 Z', labelX: 275, labelY: 345, addends: [0, 4] },
  { id: 'big-belly', name: 'big penguin belly', path: 'M 350 230 C 305 230 286 275 290 333 C 292 373 313 389 350 389 C 387 389 408 373 410 333 C 414 275 395 230 350 230 Z', labelX: 350, labelY: 320, addends: [1, 1] },
  { id: 'big-face', name: 'big penguin face', path: 'M 285 215 C 278 167 313 160 350 188 C 387 160 422 167 415 215 C 410 254 378 270 350 270 C 322 270 290 254 285 215 Z', labelX: 308, labelY: 235, addends: [2, 0] },
  { id: 'big-beak', name: 'big penguin beak', path: 'M 323 218 Q 350 205 377 218 L 350 240 Z', labelX: 350, labelY: 223, addends: [3, 4] },
  { id: 'small-left-wing', name: 'little penguin left flipper', path: 'M 555 300 Q 510 305 506 365 Q 512 383 554 349 Z', labelX: 521, labelY: 350, addends: [1, 3] },
  { id: 'small-right-wing', name: 'little penguin right flipper', path: 'M 655 300 Q 700 305 704 365 Q 698 383 656 349 Z', labelX: 682, labelY: 345, addends: [2, 2] },
  { id: 'small-left-foot', name: 'little penguin left foot', path: 'M 552 389 Q 530 403 534 417 Q 560 429 588 410 L 588 389 Z', labelX: 561, labelY: 406, addends: [1, 6] },
  { id: 'small-right-foot', name: 'little penguin right foot', path: 'M 622 389 L 622 410 Q 650 429 676 417 Q 680 403 658 389 Z', labelX: 649, labelY: 406, addends: [0, 7] },
  { id: 'small-body', name: 'little penguin body', path: 'M 542 318 C 542 258 564 225 605 225 C 646 225 668 258 668 318 V 365 C 668 400 643 412 605 412 C 567 412 542 400 542 365 Z', labelX: 558, labelY: 327, addends: [4, 0] },
  { id: 'small-belly', name: 'little penguin belly', path: 'M 605 300 C 578 300 572 330 573 362 C 574 384 586 399 605 399 C 624 399 636 384 637 362 C 638 330 632 300 605 300 Z', labelX: 605, labelY: 359, addends: [0, 2] },
  { id: 'small-face', name: 'little penguin face', path: 'M 562 274 C 560 244 581 240 605 255 C 629 240 650 244 648 274 C 646 298 627 308 605 308 C 583 308 564 298 562 274 Z', labelX: 572, labelY: 287, addends: [1, 1] },
  { id: 'small-beak', name: 'little penguin beak', path: 'M 582 275 Q 605 266 628 275 L 605 291 Z', labelX: 613, labelY: 277, addends: [6, 1] },
  { id: 'fish', name: 'fish on ice', path: 'M 135 390 Q 160 365 190 390 Q 160 415 135 390 Z M 135 390 L 115 375 V 405 Z', labelX: 160, labelY: 390, addends: [2, 1] },
]

const turtle: PictureRegion[] = [
  ...skyRegions([[60, 40], [710, 40], [40, 285], [760, 300]]),
  { id: 'bubble', name: 'large ocean bubble', path: 'M 210 45 a 35 35 0 1 0 0 70 a 35 35 0 1 0 0 -70', labelX: 210, labelY: 80, addends: [1, 2] },
  { id: 'sand-left', name: 'left sandy seabed', path: 'M 0 435 Q 110 400 220 440 Q 310 420 400 440 V 520 H 0 Z', labelX: 110, labelY: 475, addends: [4, 5] },
  { id: 'sand-right', name: 'right sandy seabed', path: 'M 400 440 Q 510 405 610 440 Q 710 410 800 435 V 520 H 400 Z', labelX: 690, labelY: 478, addends: [7, 2] },
  { id: 'seaweed-left', name: 'left seaweed', path: 'M 80 447 Q 45 403 80 365 Q 106 338 86 305 Q 137 342 105 380 Q 90 405 120 440 Z', labelX: 93, labelY: 393, addends: [3, 5] },
  { id: 'seaweed-right', name: 'right seaweed', path: 'M 700 448 Q 665 405 690 370 Q 710 345 690 320 Q 745 345 718 383 Q 705 407 740 440 Z', labelX: 706, labelY: 406, addends: [4, 4] },
  { id: 'fish-left', name: 'small fish on left', path: 'M 60 160 Q 105 115 160 160 Q 105 205 60 160 Z M 60 160 L 25 135 V 185 Z', labelX: 110, labelY: 160, addends: [2, 3] },
  { id: 'fish-right', name: 'small fish on right', path: 'M 640 175 Q 690 130 740 175 Q 690 220 640 175 Z M 740 175 L 775 150 V 200 Z', labelX: 690, labelY: 175, addends: [4, 5] },
  { id: 'coral-left', name: 'left coral', path: 'M 150 440 V 408 Q 130 398 133 375 Q 140 360 153 377 L 165 392 V 358 Q 170 340 182 358 V 395 L 196 377 Q 211 366 211 384 Q 209 405 190 414 V 440 Z', labelX: 174, labelY: 421, addends: [2, 3] },
  { id: 'coral-right', name: 'right coral', path: 'M 555 440 V 405 Q 535 394 538 373 Q 545 358 558 375 L 570 390 V 356 Q 575 338 587 356 V 393 L 601 375 Q 616 364 616 382 Q 614 403 595 412 V 440 Z', labelX: 575, labelY: 420, addends: [1, 4] },
  { id: 'back-flipper', name: 'turtle back flipper', path: 'M 290 270 Q 220 280 210 340 Q 215 362 242 352 Q 286 338 325 305 Z', labelX: 251, labelY: 326, addends: [4, 4] },
  { id: 'front-flipper', name: 'turtle front flipper', path: 'M 445 275 Q 510 300 520 370 Q 515 390 490 377 Q 452 356 410 310 Z', labelX: 479, labelY: 350, addends: [5, 3] },
  { id: 'tail', name: 'turtle tail', path: 'M 250 240 Q 215 230 198 250 Q 218 272 255 265 Z', labelX: 226, labelY: 250, addends: [6, 2] },
  { id: 'head', name: 'turtle head', path: 'M 485 202 Q 515 160 555 180 Q 590 195 585 235 Q 580 265 540 270 Q 510 270 482 245 Z', labelX: 543, labelY: 225, addends: [7, 1] },
  { id: 'shell-top', name: 'top of turtle shell', path: 'M 248 230 C 268 150 335 128 390 130 C 445 132 492 160 510 230 L 450 220 L 420 190 H 340 L 305 220 Z', labelX: 390, labelY: 160, addends: [4, 2] },
  { id: 'shell-center', name: 'center of turtle shell', path: 'M 340 190 H 420 L 450 245 L 420 300 H 340 L 310 245 Z', labelX: 380, labelY: 245, addends: [5, 1] },
  { id: 'shell-left', name: 'left side of turtle shell', path: 'M 248 230 L 305 220 L 340 190 L 310 245 L 340 300 L 300 310 Q 260 290 248 230 Z', labelX: 280, labelY: 264, addends: [3, 3] },
  { id: 'shell-right', name: 'right side of turtle shell', path: 'M 420 190 L 450 220 L 510 230 Q 500 290 460 310 L 420 300 L 450 245 Z', labelX: 477, labelY: 264, addends: [0, 6] },
  { id: 'shell-bottom', name: 'bottom of turtle shell', path: 'M 300 310 L 340 300 H 420 L 460 310 Q 385 347 300 310 Z', labelX: 380, labelY: 315, addends: [2, 4] },
  { id: 'starfish', name: 'starfish', path: 'M 290 395 L 301 418 L 327 420 L 307 436 L 313 460 L 290 447 L 267 460 L 273 436 L 253 420 L 279 418 Z', labelX: 290, labelY: 427, addends: [4, 3] },
  { id: 'shell', name: 'seashell', path: 'M 420 462 Q 420 405 458 405 Q 496 405 496 462 Z', labelX: 458, labelY: 441, addends: [3, 4] },
]

export const mysteryPuzzles: MysteryPuzzle[] = [
  { id: 'house', difficulty: 'Easy', regions: house },
  { id: 'garden', difficulty: 'Medium', regions: garden },
  { id: 'rocket', difficulty: 'Medium', regions: rocket },
  { id: 'penguins', difficulty: 'Medium', regions: penguins, details: [
    'M 310 208 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 380 208 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
    'M 578 267 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 624 267 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
  ] },
  { id: 'turtle', difficulty: 'Medium', regions: turtle, details: [
    'M 557 204 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 130 149 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M 666 164 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
  ] },
]
