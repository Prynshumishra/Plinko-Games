'use client'

export type Risk = 'low' | 'medium' | 'high'

const RISKS: { value: Risk; label: string; color: string }[] = [
  { value: 'low',    label: 'Low',  color: 'text-green-400' },
  { value: 'medium', label: 'Med',  color: 'text-yellow-400' },
  { value: 'high',   label: 'High', color: 'text-red-400' },
]

interface Props {
  risk:     Risk
  onChange: (r: Risk) => void
  disabled: boolean
}

export function RiskSelector({ risk, onChange, disabled }: Props) {
  return (
    <div>
      <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Risk</label>
      <div className="grid grid-cols-3 gap-1 p-1 bg-bg rounded-lg border border-slate-800">
        {RISKS.map((r) => (
          <button
            key={r.value}
            onClick={() => onChange(r.value)}
            disabled={disabled}
            className={`py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-40 ${
              risk === r.value
                ? `bg-surface2 ${r.color} shadow-sm ring-1 ring-white/10`
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
