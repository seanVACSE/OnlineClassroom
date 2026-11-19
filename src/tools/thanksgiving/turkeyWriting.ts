export interface TurkeyWriting {
  turkeyName: string
  disguise: string
  reason: string
}

export const emptyTurkeyWriting: TurkeyWriting = { turkeyName: '', disguise: '', reason: '' }

export function turkeyWritingKey(fileName: string): string {
  return `vacse:thanksgiving:turkey-writing:${fileName}`
}

export function loadTurkeyWriting(fileName: string): TurkeyWriting {
  const raw = localStorage.getItem(turkeyWritingKey(fileName))
  if (!raw) return { ...emptyTurkeyWriting }
  const value: unknown = JSON.parse(raw)
  if (typeof value !== 'object' || value === null ||
      !('turkeyName' in value) || typeof value.turkeyName !== 'string' ||
      !('disguise' in value) || typeof value.disguise !== 'string' ||
      !('reason' in value) || typeof value.reason !== 'string') {
    throw new Error('Saved writing is invalid.')
  }
  return { turkeyName: value.turkeyName, disguise: value.disguise, reason: value.reason }
}

export function saveTurkeyWriting(fileName: string, value: TurkeyWriting): void {
  localStorage.setItem(turkeyWritingKey(fileName), JSON.stringify(value))
}
