'use client'
import { useEffect } from 'react'

interface Handlers {
  onLeft?: () => void
  onRight?: () => void
  onSpace?: () => void
  onT?: () => void
  onG?: () => void
}

export function useKeyboard(handlers: Handlers) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowLeft') handlers.onLeft?.()
      if (e.key === 'ArrowRight') handlers.onRight?.()
      if (e.key === ' ') {
        e.preventDefault()
        handlers.onSpace?.()
      }
      if (e.key === 't' || e.key === 'T') handlers.onT?.()
      if (e.key === 'g' || e.key === 'G') handlers.onG?.()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [handlers])
}
