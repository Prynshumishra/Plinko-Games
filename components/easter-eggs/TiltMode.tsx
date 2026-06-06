'use client'
import { useState, useRef } from 'react'

export function useTilt() {
  const [tilt, setTilt] = useState(false)
  const dirRef = useRef(1)
  const toggle = () => {
    dirRef.current = Math.random() > 0.5 ? 1 : -1
    setTilt((t) => !t)
  }
  return { tilt, tiltDir: dirRef.current, toggle }
}

export function TiltWrapper({
  tilt,
  tiltDir,
  children,
}: {
  tilt: boolean
  tiltDir: number
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        transform: tilt ? `rotate(${tiltDir * 5}deg)` : 'none',
        filter: tilt ? 'sepia(0.4) contrast(1.2)' : 'none',
        transition: 'transform 0.3s ease, filter 0.3s ease',
      }}
    >
      {children}
    </div>
  )
}
