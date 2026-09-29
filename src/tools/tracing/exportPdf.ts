import { jsPDF } from 'jspdf'
import type { TracingAssignment } from '../../data/tracingAssets'
import { drawStroke, type Stroke } from './tracingStrokes'

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export async function exportAssignmentAsPdf(
  assignment: TracingAssignment,
  strokesByFile: Record<string, Stroke[]>,
): Promise<void> {
  let doc: jsPDF | undefined

  for (const image of assignment.images) {
    const img = await loadImage(image.url)
    const width = img.naturalWidth
    const height = img.naturalHeight

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) continue

    ctx.drawImage(img, 0, 0, width, height)
    for (const stroke of strokesByFile[image.fileName] ?? []) {
      drawStroke(ctx, stroke, width, height)
    }
    const dataUrl = canvas.toDataURL('image/png')

    if (!doc) {
      doc = new jsPDF({ unit: 'px', format: [width, height], orientation: width >= height ? 'landscape' : 'portrait' })
    } else {
      doc.addPage([width, height], width >= height ? 'landscape' : 'portrait')
    }
    doc.addImage(dataUrl, 'PNG', 0, 0, width, height)
  }

  doc?.save(`${assignment.name}.pdf`)
}
