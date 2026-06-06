'use client'
import { useState, useCallback, useRef } from 'react'

export type GamePhase =
  | 'IDLE'
  | 'COMMITTING'
  | 'READY_TO_DROP'
  | 'STARTING'
  | 'ANIMATING'
  | 'REVEALING'
  | 'RESULT'

export interface PathEntry {
  row: number
  decision: 'Left' | 'Right'
  rnd: number
  bias: number
}

export interface RoundResult {
  roundId: string
  commitHex: string
  nonce: string
  binIndex: number
  pathJson: PathEntry[]
  pegMapHash: string
  payoutMultiplier: number
  serverSeed: string
  betCents: number
}

export function useGameState() {
  const [phase, setPhase] = useState<GamePhase>('IDLE')
  const [result, setResult] = useState<RoundResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const roundRef = useRef<{ id: string; commitHex: string; nonce: string } | null>(null)

  const commit = useCallback(async () => {
    setPhase('COMMITTING')
    setError(null)
    try {
      const res = await fetch('/api/rounds/commit', { method: 'POST' })
      const data = await res.json()
      roundRef.current = { id: data.roundId, commitHex: data.commitHex, nonce: data.nonce }
      setPhase('READY_TO_DROP')
    } catch {
      setError('Failed to commit. Retry.')
      setPhase('IDLE')
    }
  }, [])

  const drop = useCallback(async (clientSeed: string, betCents: number, dropColumn: number) => {
    if (!roundRef.current) return
    setPhase('STARTING')
    try {
      const res = await fetch(`/api/rounds/${roundRef.current.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientSeed, betCents, dropColumn }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Start failed')
      setPhase('ANIMATING')

      // Wait for animation to finish (12 rows × 210ms + 500ms buffer)
      await new Promise<void>((resolve) => {
        setTimeout(resolve, data.pathJson.length * 210 + 500)
      })

      setPhase('REVEALING')
      const revRes = await fetch(`/api/rounds/${roundRef.current.id}/reveal`, { method: 'POST' })
      const revData = await revRes.json()
      if (!revRes.ok) throw new Error(revData.error ?? 'Reveal failed')

      setResult({
        roundId: roundRef.current.id,
        commitHex: roundRef.current.commitHex,
        nonce: roundRef.current.nonce,
        binIndex: data.binIndex,
        pathJson: data.pathJson,
        pegMapHash: data.pegMapHash,
        payoutMultiplier: data.payoutMultiplier,
        serverSeed: revData.serverSeed,
        betCents,
      })
      setPhase('RESULT')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Drop failed. Retry.')
      setPhase('IDLE')
    }
  }, [])

  const reset = useCallback(async () => {
    setResult(null)
    setError(null)
    await commit()
  }, [commit])

  return { phase, result, error, commit, drop, reset }
}
