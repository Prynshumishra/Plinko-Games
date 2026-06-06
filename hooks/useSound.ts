'use client'
import { useState, useEffect } from 'react'

export function useSound() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('plinko-muted')
    if (stored === 'true') setMuted(true)
  }, [])

  const toggle = () => {
    setMuted((m) => {
      localStorage.setItem('plinko-muted', String(!m))
      return !m
    })
  }

  return { muted, toggle }
}
