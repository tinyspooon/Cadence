'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const PREVIEW_POSTS = [
  {
    name: 'Marcus Webb',
    role: 'VP of Sales · Arcflow',
    initial: 'M',
    color: 'from-[#FF5C35] to-[#FF8C5A]',
    body: "Most sales teams are optimising for the wrong thing.\n\nThey track activity. Dials, emails, tasks logged.\n\nThe teams that consistently hit quota track outcomes. Conversations that moved. Decisions that got made.\n\nSame effort. Completely different results.",
  },
  {
    name: 'Jamie Torres',
    role: 'Sales Manager · Veltrix',
    initial: 'J',
    color: 'from-[#7C4DFF] to-[#A67DFF]',
    body: "I used to think the best SDRs were the most persistent ones.\n\nI was wrong.\n\nThe best SDRs are the most prepared ones. They know the account before they pick up the phone.\n\nPreparation beats persistence every time.",
  },
  {
    name: 'Sarah Chen',
    role: 'Head of Revenue · Loopcast',
    initial: 'S',
    color: 'from-[#0EA47A] to-[#34C99A]',
    body: "Pipeline reviews shouldn't just be about what's in the funnel.\n\nThey should be about what's been removed from it.\n\nThe deals your team disqualified last week tell you more about your ICP than your CRM ever will.",
  },
]

export default function HomePage() {
  const [cardIndex, setCardIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCardIndex(i => (i + 1) % PREVIEW_POSTS.length)
        setFading(false)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const post = PREVIEW_POSTS[cardIndex]

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left */}
      <div className="flex flex-1 flex-col justify-center px-12 xl:px-24 py-12" style={{ maxWidth: '600px' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 2px 8px rgba(255,92,53,0.35)' }}>
            <LogoIcon />
          </div>
          <span className="font-serif text-[19px] font-extrabold text-text tracking-tight">
            Caden<em className="text-accent not-italic">ce</em>
          </span>
        </div>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-accent-light text-accent border border-accent/20 rounded-full px-3.5 py-1.5 text-xs font-bold mb-6 w-fit">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          AI content engine for sales professionals
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl xl:text-5xl font-extrabold tracking-[-2px] leading-[1.05] mb-4 text-text">
          Your sales team,<br />
          <em className="text-accent not-italic">building pipeline daily.</em>
        </h1>

        <p className="text-base text-muted leading-relaxed mb-2 max-w-[420px]">
          Cadence turns your team&apos;s real work stories into approved LinkedIn posts — in under 60 seconds. Consistent presence. More pipeline. Zero blank pages.
        </p>
        <p className="text-sm text-faint mb-8">
          Built for <strong className="text-text">sales leaders</strong> who know visibility drives revenue.
        </p>

        {/* CTAs */}
        <div className="flex gap-2.5 mb-7 flex-wrap">
          <Link href="/sign-up"
            className="bg-accent text-white font-bold text-sm px-7 py-3 rounded-xl hover:opacity-90 hover:-translate-y-px transition-all"
            style={{ boxShadow: '0 2px 8px rgba(255,92,53,0.3)' }}>
            Start free trial →
          </Link>
          <Link href="/sign-in"
            className="bg-transparent text-muted border border-border2 font-semibold text-sm px-6 py-3 rounded-xl hover:border-accent hover:text-accent hover:bg-accent-light transition-all">
            Sign in
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex">
            {['#FF5C35','#7C4DFF','#0EA47A','#D97706','#0A66C2'].map((color, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold -ml-1.5 first:ml-0"
                style={{ background: color }}>
                {['M','J','S','A','R'][i]}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted">
            Trusted by <strong className="text-text">240+ sales teams</strong> posting consistently
          </span>
        </div>

        <p className="mt-5 text-xs text-faint">
          14-day free trial · No credit card · $19.99/mo after
        </p>
      </div>

      {/* Right — animated preview card */}
      <div className="flex-1 flex items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFF4F0 0%, #F3EEFF 50%, #E8F9F4 100%)', minWidth: '400px' }}>
        <div className="absolute w-[400px] h-[400px] rounded-full -top-20 -right-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,92,53,0.07) 0%, transparent 70%)' }} />

        <div
          className="bg-white rounded-2xl p-6 w-full relative z-10 transition-opacity duration-300"
          style={{ maxWidth: '340px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', opacity: fading ? 0 : 1 }}>
          <div className="absolute -top-3 right-4 bg-accent text-white rounded-full px-3 py-1 text-xs font-bold"
            style={{ boxShadow: '0 2px 8px rgba(255,92,53,0.4)' }}>
            Today&apos;s post ✓
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${post.color}`}>
                {post.initial}
              </div>
              <div>
                <div className="text-sm font-bold text-text">{post.name}</div>
                <div className="text-xs text-muted">{post.role}</div>
              </div>
            </div>
            <div className="bg-[#EBF4FF] text-[#0A66C2] rounded px-2 py-1 text-xs font-bold">LinkedIn</div>
          </div>
          <p className="text-sm text-text leading-relaxed mb-4 whitespace-pre-line">{post.body}</p>
          <div className="flex gap-2">
            <div className="flex-1 py-2 rounded-lg border border-green-200 bg-green-50 text-xs font-bold text-green-700 text-center">✓ Approved</div>
            <div className="flex-1 py-2 rounded-lg border border-border2 text-xs font-bold text-muted text-center">Edit</div>
            <div className="flex-1 py-2 rounded-lg text-xs font-bold text-accent text-center" style={{ border: '1px solid rgba(255,92,53,0.25)', background: '#FFF0EC' }}>↻ Regen</div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
          {PREVIEW_POSTS.map((_, i) => (
            <button key={i} onClick={() => setCardIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === cardIndex ? 'bg-accent w-4' : 'bg-accent/30'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

function LogoIcon() {
  return (
    <svg viewBox="0 0 17 17" fill="none" className="w-[17px] h-[17px]">
      <rect x="2" y="3.5" width="13" height="2.5" rx="1.25" fill="white" />
      <rect x="2" y="7.25" width="9" height="2.5" rx="1.25" fill="white" />
      <rect x="2" y="11" width="11" height="2.5" rx="1.25" fill="white" />
      <path d="M12 13.5l1.2 1.2 2.3-2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
