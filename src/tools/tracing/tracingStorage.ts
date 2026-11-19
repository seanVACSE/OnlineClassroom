import type { Stroke } from './tracingStrokes'

function storageKey(assignmentId: string, fileName: string): string {
  return `vacse:tracing:${assignmentId}:${fileName}`
}

export function loadStrokes(assignmentId: string, fileName: string): Stroke[] {
  try {
    const raw = localStorage.getItem(storageKey(assignmentId, fileName))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStrokes(assignmentId: string, fileName: string, strokes: Stroke[]): boolean {
  try {
    localStorage.setItem(storageKey(assignmentId, fileName), JSON.stringify(strokes))
    return true
  } catch (error) {
    console.error('[tracing] could not save drawing', error)
    return false
  }
}

export function clearStrokes(assignmentId: string, fileName: string): boolean {
  try {
    localStorage.removeItem(storageKey(assignmentId, fileName))
    return true
  } catch (error) {
    console.error('[tracing] could not clear saved drawing', error)
    return false
  }
}
