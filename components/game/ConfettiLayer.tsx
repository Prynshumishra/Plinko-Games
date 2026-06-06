'use client'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
}

const COLORS = ['#6366f1', '#8b5cf6', '#fbbf24', '#34d399', '#f472b6']

interface Props {
  trigger: boolean
  x: number
  y: number
  width: number
  height: number
}

export function ConfettiLayer({ trigger, x, y, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const raf = useRef<number>(0)

  useEffect(() => {
    if (!trigger) return
    for (let i = 0; i < 60; i++) {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 10 - 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      })
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current = particles.current.filter((p) => p.life > 0)
      for (const p of particles.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.4
        p.life -= 0.02
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, 6, 6)
      }
      ctx.globalAlpha = 1
      if (particles.current.length > 0) {
        raf.current = requestAnimationFrame(animate)
      }
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [trigger, x, y])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
    />
  )
}
