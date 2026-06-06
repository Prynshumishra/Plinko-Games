'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { BallAnimator, type PathEntry } from './BallAnimator'
import { ConfettiLayer } from './ConfettiLayer'
import { playTick, playWin } from './SoundManager'

const ROWS = 12
const CANVAS_W = 560
const CANVAS_H = 620
const PEG_R = 5
const BALL_R = 10
const PAYTABLE = [10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10]

function binColor(mult: number): string {
  if (mult >= 10) return '#ef4444'
  if (mult >= 5) return '#f97316'
  if (mult >= 3) return '#eab308'
  if (mult >= 1.5) return '#22c55e'
  if (mult >= 1) return '#6366f1'
  return '#475569'
}

interface Props {
  path: PathEntry[] | null
  binIndex: number | null
  muted: boolean
  isGolden: boolean
  onAnimationDone?: () => void
}

export function PlinkoCanvas({ path, binIndex, muted, isGolden, onAnimationDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const pegPositions = useRef<{ x: number; y: number }[][]>([])
  const binCenters = useRef<number[]>([])
  const animRef = useRef<number>(0)
  const [confetti, setConfetti] = useState(false)
  const [confettiPos, setConfettiPos] = useState({ x: 280, y: CANVAS_H - 60 })

  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const buildBoard = useCallback(() => {
    const offscreen = document.createElement('canvas')
    offscreen.width = CANVAS_W
    offscreen.height = CANVAS_H
    const ctx = offscreen.getContext('2d')!

    const marginX = 40
    const marginY = 40
    const usableW = CANVAS_W - marginX * 2
    const usableH = CANVAS_H - marginY * 2 - 60

    pegPositions.current = []
    binCenters.current = []

    for (let r = 0; r < ROWS; r++) {
      const row: { x: number; y: number }[] = []
      const pegs = r + 1
      const y = marginY + (r / (ROWS - 1)) * usableH
      for (let p = 0; p < pegs; p++) {
        const x =
          marginX + usableW / 2 - ((pegs - 1) / 2 - p) * (usableW / (ROWS + 1))
        row.push({ x, y })
        ctx.beginPath()
        ctx.arc(x, y, PEG_R, 0, Math.PI * 2)
        ctx.fillStyle = '#6366f1'
        ctx.fill()
      }
      pegPositions.current.push(row)
    }

    // Bins
    const BINS = ROWS + 1
    const binW = usableW / BINS
    const binY = marginY + usableH + 15
    for (let b = 0; b < BINS; b++) {
      const x = marginX + b * binW
      binCenters.current.push(x + binW / 2)
      ctx.fillStyle = binColor(PAYTABLE[b])
      ctx.fillRect(x + 2, binY, binW - 4, 40)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${PAYTABLE[b]}×`, x + binW / 2, binY + 26)
    }

    offscreenRef.current = offscreen
  }, [])

  useEffect(() => {
    buildBoard()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    if (offscreenRef.current) ctx.drawImage(offscreenRef.current, 0, 0)
  }, [buildBoard])

  useEffect(() => {
    if (!path || binIndex === null) return
    cancelAnimationFrame(animRef.current)

    const animator = new BallAnimator(
      path,
      pegPositions.current,
      binCenters.current,
      reducedMotion
    )
    animator.start()

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let lastRow = -1

    const animate = (now: number) => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      if (offscreenRef.current) ctx.drawImage(offscreenRef.current, 0, 0)

      const state = animator.getState(now)

      // Glow peg on new row contact
      if (state.row !== lastRow && state.row >= 0 && state.row < ROWS) {
        lastRow = state.row
        playTick(muted)
        const pos = (() => {
          let p = 0
          for (let r = 0; r < state.row; r++) if (path[r].decision === 'Right') p++
          return p
        })()
        const pegPos = pegPositions.current[state.row]?.[Math.min(pos, state.row)]
        if (pegPos) {
          ctx.beginPath()
          ctx.arc(pegPos.x, pegPos.y, PEG_R + 5, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(99,102,241,0.45)'
          ctx.fill()
        }
      }

      // Draw golden trail
      if (isGolden) {
        ctx.beginPath()
        ctx.arc(state.x, state.y + 8, BALL_R * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(253,224,71,0.25)'
        ctx.fill()
      }

      // Draw ball
      const gradient = ctx.createRadialGradient(state.x - 3, state.y - 3, 1, state.x, state.y, BALL_R)
      if (isGolden) {
        gradient.addColorStop(0, '#fef08a')
        gradient.addColorStop(1, '#d97706')
      } else {
        gradient.addColorStop(0, '#c7d2fe')
        gradient.addColorStop(1, '#4338ca')
      }
      ctx.beginPath()
      ctx.arc(state.x, state.y, BALL_R, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      if (state.done) {
        playWin(muted)
        setConfettiPos({ x: state.x, y: CANVAS_H - 60 })
        setConfetti(true)
        setTimeout(() => setConfetti(false), 2500)
        onAnimationDone?.()
        return
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [path, binIndex, muted, isGolden, reducedMotion, onAnimationDone])

  return (
    <div className="relative w-full" style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ width: '100%', height: '100%' }}
        className="rounded-xl border border-slate-800"
      />
      <ConfettiLayer trigger={confetti} x={confettiPos.x} y={confettiPos.y} width={CANVAS_W} height={CANVAS_H} />
    </div>
  )
}
