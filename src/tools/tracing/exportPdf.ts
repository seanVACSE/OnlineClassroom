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
  const doc = await buildAssignmentPdf(assignment, strokesByFile)
  doc?.save(`${assignment.name}.pdf`)
}

// Returns the assignment PDF as a base64 string (no data URL prefix) for uploading.
export async function exportAssignmentAsPdfBase64(
  assignment: TracingAssignment,
  strokesByFile: Record<string, Stroke[]>,
): Promise<string> {
  const doc = await buildAssignmentPdf(assignment, strokesByFile)
  if (!doc) return ''
  return doc.output('datauristring').split(',')[1] ?? ''
}

async function buildAssignmentPdf(
  assignment: TracingAssignment,
  strokesByFile: Record<string, Stroke[]>,
): Promise<jsPDF | undefined> {
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

  return doc
}
