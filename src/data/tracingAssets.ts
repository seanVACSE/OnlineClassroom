export interface TracingImage {
  fileName: string
  url: string
}

export interface TracingAssignment {
  id: string
  name: string
  images: TracingImage[]
}

// Splits filenames into text/number chunks so "2.png" sorts before "10.png".
function compareNatural(a: string, b: string): number {
  const chunk = /(\d+)|(\D+)/g
  const aParts = a.match(chunk) ?? []
  const bParts = b.match(chunk) ?? []
  const len = Math.max(aParts.length, bParts.length)
  for (let i = 0; i < len; i += 1) {
    const aPart = aParts[i] ?? ''
    const bPart = bParts[i] ?? ''
    const aNum = Number(aPart)
    const bNum = Number(bPart)
    const bothNumeric = !Number.isNaN(aNum) && !Number.isNaN(bNum) && aPart !== '' && bPart !== ''
    if (bothNumeric) {
      if (aNum !== bNum) return aNum - bNum
    } else if (aPart !== bPart) {
      return aPart < bPart ? -1 : 1
    }
  }
  return 0
}

const modules = import.meta.glob('/src/assets/tracings/*/*.png', { eager: true, import: 'default' }) as Record<string, string>

function buildAssignments(): TracingAssignment[] {
  const byFolder = new Map<string, TracingImage[]>()

  for (const [path, url] of Object.entries(modules)) {
    const match = path.match(/\/tracings\/([^/]+)\/([^/]+)$/)
    if (!match) continue
    const [, folder, fileName] = match
    if (!byFolder.has(folder)) byFolder.set(folder, [])
    byFolder.get(folder)!.push({ fileName, url })
  }

  return Array.from(byFolder.entries())
    .sort(([a], [b]) => compareNatural(a, b))
    .map(([folder, images]) => ({
      id: folder,
      name: folder,
      images: images.sort((a, b) => compareNatural(a.fileName, b.fileName)),
    }))
}

export const tracingAssignments: TracingAssignment[] = buildAssignments()

export function getTracingAssignment(id: string): TracingAssignment | undefined {
  return tracingAssignments.find((assignment) => assignment.id === id)
}
