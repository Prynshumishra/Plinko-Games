'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useGameState } from '@/hooks/useGameState'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useSound } from '@/hooks/useSound'
import { PlinkoCanvas } from '@/components/game/PlinkoCanvas'
import { BetControls } from '@/components/controls/BetControls'
import { SeedInput } from '@/components/controls/SeedInput'
import { PaytablePanel } from '@/components/ui/PaytablePanel'
import { RoundLog } from '@/components/ui/RoundLog'
import { useTilt, TiltWrapper } from '@/components/easter-eggs/TiltMode'
import { GoldenBallTracker } from '@/components/easter-eggs/GoldenBall'

export default function GamePage() {
  const { phase, result, error, commit, drop, reset } = useGameState()
  const { muted, toggle: toggleMute } = useSound()
  const { tilt, tiltDir, toggle: toggleTilt } = useTilt()

  const [clientSeed, setClientSeed] = useState('my-lucky-seed')
  const [betCents, setBetCents] = useState(100)
  const [dropColumn, setDropColumn] = useState(6)
  const [isGolden, setIsGolden] = useState(false)

  const goldenTracker = useRef(new GoldenBallTracker())
  const hasCommitted = useRef(false)

  // Auto-commit on mount
  useEffect(() => {
    if (!hasCommitted.current) {
      hasCommitted.current = true
      commit()
    }
  }, [commit])

  const isReady = phase === 'READY_TO_DROP'
  const isAnimating = ['STARTING', 'ANIMATING', 'REVEALING'].includes(phase)
  const isCommitting = phase === 'COMMITTING'

  const handleDrop = useCallback(async () => {
    if (!isReady) return
    await drop(clientSeed, betCents, dropColumn)
  }, [isReady, clientSeed, betCents, dropColumn, drop])

  const handleReset = useCallback(async () => {
    if (result) {
      const wasGolden = goldenTracker.current.record(result.binIndex)
      setIsGolden(wasGolden)
    }
    await reset()
  }, [result, reset])

  useKeyboard({
    onLeft: () => setDropColumn((c) => Math.max(0, c - 1)),
    onRight: () => setDropColumn((c) => Math.min(12, c + 1)),
    onSpace: handleDrop,
    onT: toggleTilt,
  })

  const activeCommitHex = result?.commitHex ?? null
  const activeNonce = result?.nonce ?? null

  const phaseLabel: Record<typeof phase, string> = {
    IDLE: 'Idle',
    COMMITTING: 'Committing...',
    READY_TO_DROP: 'Ready to Drop',
    STARTING: 'Starting...',
    ANIMATING: 'Animating...',
    REVEALING: 'Revealing...',
    RESULT: 'Result',
  }

  return (
    <main className="min-h-screen bg-bg p-3 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Plinko <span className="text-accent">Provably Fair</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">Commit-reveal RNG · SHA-256 · xorshift32</p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-xs text-slate-500 px-2 py-1 bg-surface rounded border border-slate-800 hidden sm:inline">
              {phaseLabel[phase]}
            </span>
            <button
              onClick={toggleMute}
              className="px-2.5 py-1.5 rounded-lg bg-surface border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors"
              title="Toggle sound"
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <a
              href="/verify"
              className="px-2.5 py-1.5 rounded-lg bg-surface border border-slate-700 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Verify →
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 md:gap-6">
          {/* Left: canvas + result */}
          <div className="flex flex-col gap-4">
            <TiltWrapper tilt={tilt} tiltDir={tiltDir}>
              <PlinkoCanvas
                path={result?.pathJson ?? null}
                binIndex={result?.binIndex ?? null}
                muted={muted}
                isGolden={isGolden}
              />
            </TiltWrapper>

            {error && (
              <div className="bg-red-950 border border-red-800 rounded-xl p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {phase === 'RESULT' && result && (
              <div className="bg-surface rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Result</p>
                  <p
                    className={`text-2xl font-bold ${
                      result.payoutMultiplier >= 3 ? 'text-yellow-400' : 'text-white'
                    }`}
                  >
                    {result.payoutMultiplier}× payout
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Bin {result.binIndex} · Server seed revealed
                  </p>
                  <p className="text-slate-600 text-xs break-all mt-1 font-mono">
                    {result.serverSeed.slice(0, 32)}…
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-accent rounded-lg text-white text-sm font-medium hover:bg-accent/90 transition-colors"
                  >
                    Play Again
                  </button>
                  <a
                    href={`/verify?serverSeed=${result.serverSeed}&clientSeed=${encodeURIComponent(clientSeed)}&nonce=${result.nonce}&dropColumn=${result.binIndex}&roundId=${result.roundId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-surface border border-slate-700 rounded-lg text-slate-400 text-xs text-center hover:text-white transition-colors"
                  >
                    Verify this round
                  </a>
                </div>
              </div>
            )}

            {isCommitting && (
              <div className="text-center text-slate-400 text-sm py-4">Generating commit...</div>
            )}
          </div>

          {/* Right: controls */}
          <div className="flex flex-col gap-4">
            <div className="bg-surface rounded-xl p-4 border border-slate-800">
              <SeedInput
                clientSeed={clientSeed}
                commitHex={activeCommitHex}
                nonce={activeNonce}
                onChange={setClientSeed}
              />
            </div>

            <div className="bg-surface rounded-xl p-4 border border-slate-800">
              <BetControls
                betCents={betCents}
                dropColumn={dropColumn}
                onBet={setBetCents}
                onColumn={setDropColumn}
                onDrop={handleDrop}
                disabled={!isReady || isAnimating}
              />
            </div>

            <PaytablePanel />
            <RoundLog />

            {isGolden && (
              <div className="bg-yellow-950 border border-yellow-700 rounded-xl p-3 text-center text-yellow-300 text-xs font-medium">
                ✨ Golden Ball activated! (3× center landings)
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
