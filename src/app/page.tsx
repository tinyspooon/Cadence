import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col justify-center px-[8%] max-w-[580px]">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 17 17" fill="none" className="w-[17px] h-[17px]">
              <rect x="2" y="3.5" width="13" height="2.5" rx="1.25" fill="white" />
              <rect x="2" y="7.25" width="9" height="2.5" rx="1.25" fill="white" />
              <rect x="2" y="11" width="11" height="2.5" rx="1.25" fill="white" />
              <path d="M12 13.5l1.2 1.2 2.3-2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-serif text-[19px] font-extrabold text-text tracking-tight">
            Caden<em className="text-accent not-italic">ce</em>
          </span>
        </div>

        <div className="inline-flex items-center gap-2 bg-accent-light text-accent border border-accent/20 rounded-full px-3.5 py-1.5 text-xs font-bold mb-7 w-fit">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          LinkedIn voice engine for SDR teams
        </div>

        <h1 className="font-serif text-5xl font-extrabold tracking-[-2px] leading-[1.05] mb-4 text-text">
          Your reps, posting<br />
          <em className="text-accent not-italic">every single day.</em>
        </h1>

        <p className="text-base text-muted leading-relaxed mb-2 max-w-[400px]">
          Cadence turns real work stories into approved LinkedIn posts — in under 60 seconds. No blank pages. No generic AI slop.
        </p>
        <p className="text-sm text-faint mb-8">
          Built for <strong className="text-text">sales managers</strong> who know pipeline starts with presence.
        </p>

        <div className="flex gap-2.5 mb-7">
          <Link href="/sign-up" className="btn-primary">
            Start free trial →
          </Link>
          <Link href="/sign-in" className="btn-ghost">
            Sign in
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex">
            {['#FF5C35','#7C4DFF','#0EA47A','#D97706','#0A66C2'].map((color, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold -ml-1.5 first:ml-0" style={{ background: color }}>
                {['O','K','B','D','L'][i]}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted">
            Trusted by <strong className="text-text">240+ SDR teams</strong> posting consistently
          </span>
        </div>

        <p className="mt-6 text-xs text-faint">
          14-day free trial · No credit card · $39/mo after
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF4F0 0%, #F3EEFF 50%, #E8F9F4 100%)' }}>
        <div className="bg-white rounded-2xl p-6 max-w-[320px] w-full relative z-10" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <div className="absolute -top-3 right-4 bg-accent text-white rounded-full px-3 py-1 text-xs font-bold">
            Today&apos;s post ✓
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #FF5C35, #FF8C5A)' }}>O</div>
              <div>
                <div className="text-sm font-bold text-text">Oli Elliott</div>
                <div className="text-xs text-muted">Head of SDR · Pepper</div>
              </div>
            </div>
            <div className="bg-[#EBF4FF] text-[#0A66C2] rounded px-2 py-1 text-xs font-bold">LinkedIn</div>
          </div>
          <p className="text-sm text-text leading-relaxed mb-4">
            I&apos;ve managed SDR teams long enough to know this:<br /><br />
            The reps who hit quota consistently aren&apos;t the ones with the best pitch. They do the work nobody else wants to do.<br /><br />
            Same inputs. Completely different outputs.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 py-2 rounded-lg border border-green-200 bg-green-50 text-xs font-bold text-green-700 text-center">✓ Approved</div>
            <div className="flex-1 py-2 rounded-lg border border-border2 text-xs font-bold text-muted text-center">Edit</div>
            <div className="flex-1 py-2 rounded-lg text-xs font-bold text-accent text-center" style={{ border: '1px solid rgba(255,92,53,0.25)', background: '#FFF0EC' }}>↺ Regen</div>
          </div>
        </div>
      </div>
    </div>
  )
}