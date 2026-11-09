export const SHAPE_TYPES = ['circle', 'square', 'triangle', 'rectangle', 'oval', 'star', 'heart', 'diamond', 'pentagon', 'hexagon'] as const

export type ShapeType = typeof SHAPE_TYPES[number]

export interface PlaygroundShape {
  id: string
  type: ShapeType
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  color: string
}

export const COLORS = [
  { name: 'Red', value: '#e65e55' },
  { name: 'Orange', value: '#f49a49' },
  { name: 'Yellow', value: '#f5cb55' },
  { name: 'Green', value: '#70ad78' },
  { name: 'Teal', value: '#56aaa5' },
  { name: 'Blue', value: '#619bd2' },
  { name: 'Purple', value: '#a184bd' },
  { name: 'Pink', value: '#e99aac' },
  { name: 'Brown', value: '#a47a62' },
  { name: 'Black', value: '#35433d' },
  { name: 'White', value: '#ffffff' },
] as const