const PAYTABLE = [10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10]

function color(m: number) {
  if (m >= 10) return 'text-red-400'
  if (m >= 5) return 'text-orange-400'
  if (m >= 3) return 'text-yellow-400'
  if (m >= 1.5) return 'text-green-400'
  if (m >= 1) return 'text-indigo-400'
  return 'text-slate-400'
}

export function PaytablePanel() {
  return (
    <div className="bg-surface rounded-xl p-4 border border-slate-800">
      <h3 className="text-xs text-slate-400 uppercase tracking-wide mb-3">Paytable</h3>
      <div className="grid grid-cols-13 gap-1">
        {PAYTABLE.map((m, i) => (
          <div key={i} className={`text-center text-xs font-bold ${color(m)}`}>
            {m}×
          </div>
        ))}
      </div>
    </div>
  )
}
