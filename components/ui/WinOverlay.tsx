'use client'
import { useEffect, useState } from 'react'

interface Props {
  multiplier: number
  betCents:   number
  binIndex:   number
  show:       boolean
}

export function WinOverlay({ multiplier, betCents, binIndex, show }: Props) {
  const [visible, setVisible] = useState(false)
  const [key, setKey]         = useState(0)

  useEffect(() => {
    if (!show) return
    setKey((k) => k + 1)
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2600)
    return () => clearTimeout(t)
  }, [show])

  if (!visible) return null

  const payout  = Math.round(betCents * multiplier)
  const profit  = payout - betCents
  const isBig   = multiplier >= 5
  const isWin   = multiplier >= 1
  const label   = multiplier >= 50 ? '🔥 INSANE WIN'
                : multiplier >= 10 ? '🔥 JACKPOT'
                : multiplier >= 5  ? '✨ BIG WIN'
                : multiplier >= 1  ? 'WIN'
                : ''

  const containerCls = isBig
    ? 'bg-yellow-950/90 border-yellow-500/50 glow-gold'
    : isWin
    ? 'bg-green-950/90 border-green-700/50 glow-win'
    : 'bg-slate-900/90 border-slate-700/40'

  return (
    <div
      key={key}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
    >
      <div className={`animate-win-pop animate-win-fade flex flex-col items-center gap-1.5 px-10 py-6 rounded-2xl border ${containerCls}`}>
        {label && (
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
            {label}
          </span>
        )}
        <span
          className={`text-6xl font-black tabular-nums ${
            isBig ? 'text-gradient' : isWin ? 'text-green-400' : 'text-slate-400'
          }`}
        >
          {multiplier}×
        </span>
        {isWin ? (
          <span className="text-sm font-semibold text-slate-200">
            +{profit} cr
          </span>
        ) : (
          <span className="text-sm text-slate-500">better luck next time</span>
        )}
        <span className="text-xs text-slate-600 mt-0.5">bin {binIndex}</span>
      </div>
    </div>
  )
}
