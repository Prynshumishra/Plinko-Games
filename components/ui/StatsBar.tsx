'use client'

interface Props {
  balance: number
  profit:  number
  rounds:  number
}

export function StatsBar({ balance, profit, rounds }: Props) {
  const profitCls = profit > 0 ? 'text-green-400' : profit < 0 ? 'text-red-400' : 'text-slate-400'

  return (
    <div className="flex items-center justify-between bg-surface border border-slate-800/60 rounded-xl px-4 py-2.5 mb-4">
      <div className="flex items-center gap-5 sm:gap-8">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide leading-none mb-0.5">Balance</p>
          <p className="text-sm font-bold text-white tabular-nums">{balance.toLocaleString()} cr</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide leading-none mb-0.5">Session</p>
          <p className={`text-sm font-bold tabular-nums ${profitCls}`}>
            {profit >= 0 ? '+' : ''}{profit.toLocaleString()} cr
          </p>
        </div>
        <div className="hidden sm:block">
          <p className="text-xs text-slate-500 uppercase tracking-wide leading-none mb-0.5">Rounds</p>
          <p className="text-sm font-bold text-slate-300 tabular-nums">{rounds}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-slate-500">Live</span>
      </div>
    </div>
  )
}
