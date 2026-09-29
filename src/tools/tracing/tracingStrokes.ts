export type TraceTool = 'pen' | 'eraser'

export interface TracePoint {
  x: number
  y: number
}

export interface Stroke {
  tool: TraceTool
  color: string
  width: number
  points: TracePoint[]
}

const PEN_WIDTH_FRACTION = 0.006
const ERASER_WIDTH_FRACTION = 0.03

export function widthForTool(tool: TraceTool, canvasSize: number): number {
  const fraction = tool === 'pen' ? PEN_WIDTH_FRACTION : ERASER_WIDTH_FRACTION
  return Math.max(1, canvasSize * fraction)
}

function drawPath(ctx: CanvasRenderingContext2D, stroke: Stroke, width: number, height: number) {
  if (stroke.points.length === 0) return

  ctx.save()
  ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
  ctx.strokeStyle = stroke.color
  ctx.lineWidth = stroke.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  const [first, ...rest] = stroke.points
  ctx.moveTo(first.x * width, first.y * height)
  if (rest.length === 0) {
    // Single tap: draw a dot so a click still leaves a mark.
    ctx.lineTo(first.x * width + 0.01, first.y * height)
  }
  for (const point of rest) {
    ctx.lineTo(point.x * width, point.y * height)
  }
  ctx.stroke()
  ctx.restore()
}

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, width: number, height: number) {
  drawPath(ctx, stroke, width, height)
}

export function replayStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], width: number, height: number) {
  ctx.clearRect(0, 0, width, height)
  for (const stroke of strokes) {
    drawPath(ctx, stroke, width, height)
  }
}
