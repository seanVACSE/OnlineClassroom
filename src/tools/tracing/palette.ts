export interface TraceColor {
  name: string
  value: string
}

// Basic, easy-to-recognize colors for young students.
export const TRACE_COLORS: TraceColor[] = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#e4362b' },
  { name: 'Orange', value: '#f39621' },
  { name: 'Yellow', value: '#f5d020' },
  { name: 'Green', value: '#3fae4e' },
  { name: 'Light Blue', value: '#4bb4e6' },
  { name: 'Dark Blue', value: '#1f4fd8' },
  { name: 'Purple', value: '#8e4bd8' },
  { name: 'Pink', value: '#ec5ea3' },
  { name: 'Brown', value: '#8a5a34' },
  { name: 'White', value: '#ffffff' },
]

export const DEFAULT_TRACE_COLOR = TRACE_COLORS[0].value
