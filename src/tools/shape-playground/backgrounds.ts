export interface PlaygroundBackground {
  id: string
  name: string
  url?: string
}

const images = import.meta.glob('/src/assets/shape-playground/backgrounds/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export const playgroundBackgrounds: PlaygroundBackground[] = [
  { id: 'blank', name: 'Blank canvas' },
  ...Object.entries(images)
    .sort(([first], [second]) => first.localeCompare(second, undefined, { numeric: true }))
    .map(([path, url]) => {
      const fileName = path.split('/').pop()!
      return {
        id: fileName,
        name: fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        url,
      }
    }),
]