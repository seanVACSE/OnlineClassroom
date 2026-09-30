import { jsPDF } from 'jspdf'
import type { TracingAssignment } from '../../data/tracingAssets'
import { drawStroke, type Stroke } from './tracingStrokes'

const MAX_EXPORT_DIMENSION = 1400
const JPEG_QUALITY = 0.82

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
    const scale = Math.min(1, MAX_EXPORT_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.round(img.naturalWidth * scale)
    const height = Math.round(img.naturalHeight * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) continue

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    const strokesCanvas = document.createElement('canvas')
    strokesCanvas.width = width
    strokesCanvas.height = height
    const strokesCtx = strokesCanvas.getContext('2d')
    if (!strokesCtx) continue
    for (const stroke of strokesByFile[image.fileName] ?? []) {
      drawStroke(strokesCtx, stroke, width, height)
    }
    ctx.drawImage(strokesCanvas, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)

    if (!doc) {
      doc = new jsPDF({ unit: 'px', format: [width, height], orientation: width >= height ? 'landscape' : 'portrait' })
    } else {
      doc.addPage([width, height], width >= height ? 'landscape' : 'portrait')
    }
    doc.addImage(dataUrl, 'JPEG', 0, 0, width, height)
  }

  return doc
}
