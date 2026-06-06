export interface PathEntry {
  row: number
  decision: 'Left' | 'Right'
  rnd: number
  bias: number
}

export interface BallState {
  x: number
  y: number
  row: number
  done: boolean
}

const ROW_MS = 200

export class BallAnimator {
  private path: PathEntry[]
  private pegPositions: { x: number; y: number }[][]
  private binCenters: number[]
  private startTime: number = 0
  private reducedMotion: boolean

  constructor(
    path: PathEntry[],
    pegPositions: { x: number; y: number }[][],
    binCenters: number[],
    reducedMotion: boolean
  ) {
    this.path = path
    this.pegPositions = pegPositions
    this.binCenters = binCenters
    this.reducedMotion = reducedMotion
  }

  start() {
    this.startTime = performance.now()
  }

  getState(now: number): BallState {
    const elapsed = now - this.startTime
    const ROWS = this.path.length

    if (this.reducedMotion) {
      const row = Math.min(Math.floor(elapsed / 100), ROWS - 1)
      const peg = this.pegPositions[row]?.[0] ?? { x: 0, y: 0 }
      const done = elapsed > ROWS * 100 + 300
      const binX = done ? this.binCenters[this.finalBinIndex()] : peg.x
      return { x: binX, y: peg.y, row, done }
    }

    const totalDuration = ROWS * ROW_MS + ROW_MS
    if (elapsed >= totalDuration) {
      return { x: this.binCenters[this.finalBinIndex()], y: 9999, row: ROWS, done: true }
    }

    const rowF = elapsed / ROW_MS
    const row = Math.min(Math.floor(rowF), ROWS - 1)
    const t = rowF - row

    const pos = this.posAtRow(row)
    const fromPeg = this.pegPositions[row]?.[Math.min(pos, row)] ?? { x: 0, y: 0 }
    const nextRow = row + 1
    const nextPos = this.path[row]?.decision === 'Right' ? pos + 1 : pos
    const toPeg =
      nextRow < ROWS
        ? (this.pegPositions[nextRow]?.[Math.min(nextPos, nextRow)] ?? fromPeg)
        : { x: this.binCenters[this.finalBinIndex()], y: fromPeg.y + 50 }

    const cx = (fromPeg.x + toPeg.x) / 2
    const cy = fromPeg.y - 15
    const x = (1 - t) ** 2 * fromPeg.x + 2 * (1 - t) * t * cx + t ** 2 * toPeg.x
    const y = (1 - t) ** 2 * fromPeg.y + 2 * (1 - t) * t * cy + t ** 2 * toPeg.y

    return { x, y, row, done: false }
  }

  private posAtRow(row: number): number {
    let pos = 0
    for (let r = 0; r < row; r++) {
      if (this.path[r].decision === 'Right') pos++
    }
    return pos
  }

  finalBinIndex(): number {
    let pos = 0
    for (const e of this.path) if (e.decision === 'Right') pos++
    return pos
  }
}
