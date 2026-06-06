'use client'

const BET_OPTIONS = [50, 100, 200, 500, 1000]

interface Props {
  betCents: number
  dropColumn: number
  onBet: (b: number) => void
  onColumn: (c: number) => void
  onDrop: () => void
  disabled: boolean
}

export function BetControls({ betCents, dropColumn, onBet, onColumn, onDrop, disabled }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Bet (credits)</label>
        <div className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
          {BET_OPTIONS.map((b) => (
            <button
              key={b}
              onClick={() => onBet(b)}
              className={`py-1.5 rounded-lg text-sm font-medium transition-colors ${
                betCents === b
                  ? 'bg-accent text-white'
                  : 'bg-bg border border-slate-700 text-slate-300 hover:border-accent'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">
          Column: <span className="text-white font-bold">{dropColumn}</span>
        </label>
        <input
          type="range"
          min={0}
          max={12}
          value={dropColumn}
          onChange={(e) => onColumn(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>0 (left edge)</span>
          <span>6 (center)</span>
          <span>12 (right edge)</span>
        </div>
      </div>

      <button
        onClick={onDrop}
        disabled={disabled}
        className="w-full py-3 rounded-xl bg-accent hover:bg-accent/90 active:scale-95 text-white font-bold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Drop Ball
      </button>
      <p className="text-center text-xs text-slate-600">← → to change column · Space to drop · T to tilt</p>
    </div>
  )
}
