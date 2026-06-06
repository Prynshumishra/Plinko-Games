import { VerifierForm } from '@/components/ui/VerifierForm'

interface Props {
  searchParams: { [key: string]: string | undefined }
}

export default function VerifyPage({ searchParams }: Props) {
  return (
    <main className="min-h-screen bg-bg p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <a href="/" className="text-slate-500 hover:text-white text-sm transition-colors">
            ← Back to Game
          </a>
          <h1 className="text-2xl font-bold text-white">
            Verify <span className="text-accent">Fairness</span>
          </h1>
        </div>

        <p className="text-slate-400 text-sm mb-6 max-w-xl leading-relaxed">
          After playing, click <em>&quot;Verify this round&quot;</em> or paste the seeds manually.
          We rerun the exact same engine (xorshift32 seeded from SHA-256) and show you every
          row decision the ball made — proving we could not have changed the outcome after you
          submitted your seed.
        </p>

        <VerifierForm
          initialServerSeed={searchParams.serverSeed ?? ''}
          initialClientSeed={searchParams.clientSeed ?? ''}
          initialNonce={searchParams.nonce ?? ''}
          initialDropColumn={searchParams.dropColumn ?? '6'}
          initialRoundId={searchParams.roundId ?? ''}
        />
      </div>
    </main>
  )
}
