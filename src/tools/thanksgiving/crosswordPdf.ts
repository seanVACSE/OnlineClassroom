import { jsPDF } from 'jspdf'
import { buildCrosswordCells, revealedLetter, type CrosswordWord } from './crosswordData'

export function crosswordPdfBase64(name: string, size: number, words: CrosswordWord[], solved: string[]): string {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' })
  const margin = 30
  const cellSize = Math.min(28, 500 / size)
  const gridWidth = cellSize * size
  const x = (792 - gridWidth) / 2
  const y = 92

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Thanksgiving Crossword - Grades 4-6', margin, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(`Student: ${name}`, margin, 49, { maxWidth: 450 })
  doc.text(`${solved.length} of ${words.length} words solved`, 762, 49, { align: 'right' })
  for (const cell of buildCrosswordCells(size, words)) {
    if (!cell.words.length) continue
    const left = x + cell.col * cellSize
    const top = y + cell.row * cellSize
    doc.setDrawColor(85, 100, 90)
    doc.rect(left, top, cellSize, cellSize)
    if (cell.number) {
      doc.setFontSize(9)
      doc.text(String(cell.number), left + 2, top + 9)
    }
    const letter = revealedLetter(cell, solved)
    if (letter) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(letter, left + cellSize - 3, top + cellSize - 3, { align: 'right' })
      doc.setFont('helvetica', 'normal')
    }
  }

  doc.addPage('letter', 'portrait')
  doc.setFontSize(17)
  doc.setFont('helvetica', 'bold')
  doc.text('Clues', 40, 45)
  let cursor = 70
  for (const direction of ['across', 'down'] as const) {
    if (cursor > 730) { doc.addPage('letter', 'portrait'); cursor = 45 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(direction === 'across' ? 'Across' : 'Down', 40, cursor)
    cursor += 22
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    for (const word of words.filter((item) => item.direction === direction)) {
      const lines: string[] = doc.splitTextToSize(`${word.number}. ${word.clue} (${word.answer.length})${solved.includes(word.id) ? ' - solved' : ''}`, 532)
      if (cursor + lines.length * 15 > 752) { doc.addPage('letter', 'portrait'); cursor = 45 }
      doc.text(lines, 40, cursor)
      cursor += lines.length * 15 + 6
    }
    cursor += 10
  }
  return doc.output('datauristring').split(',')[1]
}
