'use client'
import { useEffect, useState } from 'react'

interface RoundSummary {
  id: string
  binIndex: number
  payoutMultiplier: number
  betCents: number
  status: string
  dropColumn: number
}

export function RoundLog() {
  const [rounds, setRounds] = useState<RoundSummary[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/rounds?limit=10')
        if (res.ok) setRounds(await res.json())
      } catch {
        // silently fail — log is non-critical
      }
    }
    load()
    const id = setInterval(load, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-surface rounded-xl p-4 border border-slate-800">
      <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-3">Recent Rounds</h3>
      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
        {rounds.map((r) => (
          <div key={r.id} className="flex justify-between text-xs text-slate-400">
            <span>
              Col {r.dropColumn} → Bin {r.binIndex}
            </span>
            <span className={r.payoutMultiplier >= 3 ? 'text-yellow-400 font-bold' : ''}>
              {r.payoutMultiplier}×
            </span>
          </div>
        ))}
        {rounds.length === 0 && <p className="text-xs text-slate-600">No rounds yet</p>}
      </div>
    </div>
  )
}
