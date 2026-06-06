'use client'
import { useState, useEffect } from 'react'

interface StoredFields {
  binIndex: number
  pegMapHash: string
  dropColumn: number
  payoutMultiplier: number
  betCents: number
  commitHex: string
}

interface VerifyResult {
  commitHex: string
  combinedSeed: string
  pegMapHash: string
  binIndex: number
  path: { row: number; decision: string; rnd: number; bias: number }[]
  match?: boolean
  stored?: StoredFields
}

interface Props {
  initialServerSeed?: string
  initialClientSeed?: string
  initialNonce?: string
  initialDropColumn?: string
  initialRoundId?: string
}

export function VerifierForm({
  initialServerSeed = '',
  initialClientSeed = '',
  initialNonce = '',
  initialDropColumn = '6',
  initialRoundId = '',
}: Props) {
  const [serverSeed, setServerSeed] = useState(initialServerSeed)
  const [clientSeed, setClientSeed] = useState(initialClientSeed)
  const [nonce, setNonce] = useState(initialNonce)
  const [dropColumn, setDropColumn] = useState(initialDropColumn)
  const [roundId, setRoundId] = useState(initialRoundId)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Auto-submit if all required fields are pre-filled from URL
  const [autoSubmitted, setAutoSubmitted] = useState(false)
  useEffect(() => {
    if (autoSubmitted || !initialServerSeed || !initialClientSeed || !initialNonce) return
    setAutoSubmitted(true)
    const params = new URLSearchParams({ serverSeed: initialServerSeed, clientSeed: initialClientSeed, nonce: initialNonce, dropColumn: initialDropColumn })
    if (initialRoundId) params.set('roundId', initialRoundId)
    setLoading(true)
    fetch(`/api/verify?${params}`)
      .then((r) => r.json())
      .then((data) => setResult(data))
      .catch(() => setErr('Auto-verify failed'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    try {
      const params = new URLSearchParams({ serverSeed, clientSeed, nonce, dropColumn })
      if (roundId) params.set('roundId', roundId)
      const res = await fetch(`/api/verify?${params}`)
      const data = await res.json()
      if (!res.ok) { setErr(data.error); return }
      setResult(data)
    } catch {
      setErr('Request failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, value: string, onChange: (v: string) => void, placeholder = '') => (
    <div>
      <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent font-mono"
      />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <form onSubmit={submit} className="bg-surface rounded-xl p-6 border border-slate-800 flex flex-col gap-4">
        {field('Server Seed (revealed after game)', serverSeed, setServerSeed, 'Paste from game result...')}
        {field('Client Seed', clientSeed, setClientSeed, 'my-lucky-seed')}
        {field('Nonce', nonce, setNonce, '42')}
        {field('Drop Column (0–12)', dropColumn, setDropColumn, '6')}
        {field('Round ID (optional — enables DB match check)', roundId, setRoundId, 'cuid...')}

        <button
          type="submit"
          disabled={loading}
          className="py-2.5 bg-accent rounded-lg text-white font-medium text-sm disabled:opacity-40 hover:bg-accent/90 transition-colors"
        >
          {loading ? 'Verifying...' : 'Verify Fairness'}
        </button>

        {err && <p className="text-red-400 text-sm">{err}</p>}
      </form>

      {result && (
        <div className="mt-6 bg-surface rounded-xl p-6 border border-slate-800 flex flex-col gap-5">
          {/* Match banner */}
          {result.match !== undefined && (
            <div className={`flex items-center gap-2 text-base font-bold rounded-lg px-4 py-3 ${result.match ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
              {result.match ? '✅ Verified — outcome matches stored round' : '❌ Mismatch detected'}
            </div>
          )}

          {/* Side-by-side comparison when roundId was provided */}
          {result.stored && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Stored vs Recomputed</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-500 font-medium uppercase tracking-wide">Field</div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-500 font-medium uppercase tracking-wide">Stored (DB)</span>
                  <span className="text-slate-500 font-medium uppercase tracking-wide">Recomputed</span>
                </div>

                {([
                  ['Bin Index', String(result.stored.binIndex), String(result.binIndex)],
                  ['Drop Column', String(result.stored.dropColumn), '-'],
                  ['Payout', `${result.stored.payoutMultiplier}×`, '-'],
                  ['Commit', result.stored.commitHex.slice(0, 16) + '…', result.commitHex.slice(0, 16) + '…'],
                  ['Peg Map Hash', result.stored.pegMapHash.slice(0, 16) + '…', result.pegMapHash.slice(0, 16) + '…'],
                ] as [string, string, string][]).map(([label, storedVal, recomputed]) => {
                  const match = recomputed === '-' || storedVal === recomputed
                  return (
                    <div key={label} className="contents">
                      <div className="text-slate-400 py-1.5 border-t border-slate-800/60">{label}</div>
                      <div className="grid grid-cols-2 gap-2 py-1.5 border-t border-slate-800/60">
                        <span className="font-mono text-slate-300">{storedVal}</span>
                        <span className={`font-mono ${recomputed === '-' ? 'text-slate-600' : match ? 'text-green-400' : 'text-red-400'}`}>
                          {recomputed === '-' ? '—' : recomputed}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Derived values */}
          <div className="text-xs text-slate-400 space-y-1.5">
            <p className="text-slate-300 font-medium uppercase tracking-wide text-xs mb-2">Derived Values</p>
            {[
              ['Commit', result.commitHex],
              ['Combined Seed', result.combinedSeed],
              ['Peg Map Hash', result.pegMapHash],
            ].map(([label, val]) => (
              <div key={label}>
                <span className="text-slate-300 font-medium">{label}: </span>
                <span className="break-all font-mono">{val}</span>
              </div>
            ))}
            <div>
              <span className="text-slate-300 font-medium">Bin Index: </span>
              <span className="text-white font-bold text-sm">{result.binIndex}</span>
            </div>
          </div>

          {/* Path replay */}
          <div>
            <p className="text-xs text-slate-400 mb-3 uppercase tracking-wide">Path Replay (12 rows)</p>
            <div className="flex flex-col gap-1.5">
              {result.path.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 w-6 shrink-0">R{entry.row}</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${entry.decision === 'Left' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-violet-900/50 text-violet-300'}`}>
                    {entry.decision === 'Left' ? '← Left' : 'Right →'}
                  </span>
                  <span className="text-slate-600 font-mono">rnd={entry.rnd.toFixed(6)} bias={entry.bias.toFixed(6)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
