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

export function saveStrokes(assignmentId: string, fileName: string, strokes: Stroke[]): void {
  try {
    localStorage.setItem(storageKey(assignmentId, fileName), JSON.stringify(strokes))
  } catch {
    // Ignore quota/availability errors (e.g. private browsing) — drawing still works in-memory.
  }
}

export function clearStrokes(assignmentId: string, fileName: string): void {
  try {
    localStorage.removeItem(storageKey(assignmentId, fileName))
  } catch {
    // Ignore storage errors.
  }
}
