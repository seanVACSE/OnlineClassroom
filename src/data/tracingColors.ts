// Pen color used per assignment folder. Edit here to change a specific assignment's color.
export const DEFAULT_TRACE_COLOR = '#1f6feb'

export const tracingColors: Record<string, string> = {
  Tracing1: '#1f6feb',
  Tracing2: '#d1622a',
}

export function getTracingColor(assignmentId: string): string {
  return tracingColors[assignmentId] ?? DEFAULT_TRACE_COLOR
}
