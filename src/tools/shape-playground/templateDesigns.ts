export type TemplateShape = 'circle' | 'square' | 'triangle' | 'rectangle'

export interface TemplateSlot {
  id: string
  shape: TemplateShape
  x: number
  y: number
  width: number
  height: number
}

export interface ShapeTemplate {
  id: string
  name: string
  slots: TemplateSlot[]
}

export const templatePaths: Record<TemplateShape, string> = {
  circle: 'M 50 2 A 48 48 0 1 1 50 98 A 48 48 0 1 1 50 2 Z',
  square: 'M 2 2 H 98 V 98 H 2 Z',
  triangle: 'M 50 3 L 97 97 H 3 Z',
  rectangle: 'M 2 2 H 98 V 98 H 2 Z',
}

export const shapeTemplates: ShapeTemplate[] = [
  { id: 'house', name: 'Sunny House', slots: [
    { id: 'sun', shape: 'circle', x: 755, y: 30, width: 140, height: 140 },
    { id: 'roof', shape: 'triangle', x: 300, y: 45, width: 400, height: 190 },
    { id: 'house-left', shape: 'rectangle', x: 300, y: 235, width: 130, height: 240 },
    { id: 'house-right', shape: 'rectangle', x: 570, y: 235, width: 130, height: 240 },
    { id: 'above-door', shape: 'rectangle', x: 430, y: 235, width: 140, height: 80 },
    { id: 'door', shape: 'rectangle', x: 430, y: 315, width: 140, height: 160 },
    { id: 'tree-top', shape: 'circle', x: 65, y: 225, width: 180, height: 180 },
    { id: 'tree-trunk', shape: 'rectangle', x: 120, y: 405, width: 70, height: 160 },
  ] },
  { id: 'train', name: 'Shape Train', slots: [
    { id: 'smoke', shape: 'circle', x: 760, y: 35, width: 110, height: 110 },
    { id: 'chimney', shape: 'rectangle', x: 710, y: 155, width: 85, height: 130 },
    { id: 'car-left', shape: 'square', x: 55, y: 285, width: 190, height: 190 },
    { id: 'car-middle', shape: 'square', x: 270, y: 285, width: 190, height: 190 },
    { id: 'engine', shape: 'rectangle', x: 490, y: 285, width: 350, height: 190 },
    { id: 'wheel-left', shape: 'circle', x: 95, y: 475, width: 110, height: 110 },
    { id: 'wheel-middle', shape: 'circle', x: 310, y: 475, width: 110, height: 110 },
    { id: 'wheel-right', shape: 'circle', x: 590, y: 475, width: 110, height: 110 },
  ] },
  { id: 'rocket', name: 'Space Rocket', slots: [
    { id: 'moon', shape: 'circle', x: 70, y: 55, width: 150, height: 150 },
    { id: 'planet', shape: 'circle', x: 750, y: 70, width: 150, height: 150 },
    { id: 'nose', shape: 'triangle', x: 390, y: 25, width: 220, height: 155 },
    { id: 'upper-body', shape: 'square', x: 390, y: 180, width: 220, height: 220 },
    { id: 'lower-body', shape: 'rectangle', x: 390, y: 400, width: 220, height: 100 },
    { id: 'left-fin', shape: 'triangle', x: 230, y: 345, width: 160, height: 155 },
    { id: 'right-fin', shape: 'triangle', x: 610, y: 345, width: 160, height: 155 },
  ] },
]
