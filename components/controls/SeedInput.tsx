'use client'

interface Props {
  clientSeed: string
  commitHex: string | null
  nonce: string | null
  onChange: (s: string) => void
}

export function SeedInput({ clientSeed, commitHex, nonce, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Client Seed</label>
        <input
          value={clientSeed}
          onChange={(e) => onChange(e.target.value.slice(0, 128))}
          className="w-full bg-bg border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent"
          placeholder="Your seed..."
        />
      </div>
      {commitHex && (
        <div className="text-xs text-slate-500 break-all">
          <span className="text-slate-400">Server commit:</span> {commitHex}
        </div>
      )}
      {nonce && (
        <div className="text-xs text-slate-500">
          <span className="text-slate-400">Nonce:</span> {nonce}
        </div>
      )}
    </div>
  )
}
