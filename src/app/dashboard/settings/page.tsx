'use client'

import { useState, useEffect } from 'react'

// ── Types ──────────────────────────────────────────
type PlatformKey = 'linkedin' | 'x' | 'instagram' | 'facebook' | 'tiktok'

interface Platform {
  key: PlatformKey
  name: string
  icon: React.ReactNode
  desc: string
  postMethod: 'compose' | 'copy'
}

// ── Helpers ────────────────────────────────────────
function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
      connected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-surface text-faint border border-border'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-faint'}`} />
      {connected ? 'Connected' : 'Not set up'}
    </div>
  )
}

function SettingsCard({ icon, title, desc, connected, children }: {
  icon: React.ReactNode; title: string; desc: string; connected?: boolean; children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-text">{title}</div>
          <div className="text-xs text-muted mt-0.5 leading-snug">{desc}</div>
        </div>
        {connected !== undefined && <StatusBadge connected={connected} />}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

const ALL_TOPICS = [
  'SDR coaching', 'Pipeline strategy', 'Sales leadership', 'Cold outreach',
  'Team culture', 'AI in sales', 'Hiring & talent', 'Quota attainment',
  'Revenue ops', 'Founder mindset', 'Sales ops', 'Customer success',
  'Prospecting', 'Discovery calls', 'Negotiation', 'Sales enablement',
]

const PLATFORMS: Platform[] = [
  {
    key: 'linkedin', name: 'LinkedIn', postMethod: 'compose',
    desc: 'Opens LinkedIn\'s compose window with text pre-copied',
    icon: <div className="w-9 h-9 rounded-xl bg-[#EBF4FF] flex items-center justify-center">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.024-3.037-1.852-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    </div>
  },
  {
    key: 'x', name: 'X (Twitter)', postMethod: 'compose',
    desc: 'Uses tweet intent URL — text pre-fills the composer, no API needed',
    icon: <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.826L2.25 2.25h6.89l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
      </svg>
    </div>
  },
  {
    key: 'instagram', name: 'Instagram', postMethod: 'copy',
    desc: 'Copies post text — paste into the Instagram app to post',
    icon: <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </div>
  },
  {
    key: 'facebook', name: 'Facebook', postMethod: 'copy',
    desc: 'Copies post text — paste into Facebook to post',
    icon: <div className="w-9 h-9 rounded-xl bg-[#E7F0FF] flex items-center justify-center">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    </div>
  },
  {
    key: 'tiktok', name: 'TikTok', postMethod: 'copy',
    desc: 'Copies caption text — paste into TikTok when posting a video',
    icon: <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
      </svg>
    </div>
  },
]

export default function SettingsPage() {
  // Profile
  const [name, setName]       = useState('')
  const [role, setRole]       = useState('')
  const [company, setCompany] = useState('')

  // Company context
  const [companyOneLiner, setOneLiner]   = useState('')
  const [problemSolved, setProblem]      = useState('')
  const [targetCustomer, setTarget]      = useState('')
  const [differentiator, setDiff]        = useState('')
  const [contentMix, setContentMix]      = useState(80) // 80 = 80% thought leadership, 20% product
  const [postsPerDay, setPostsPerDay]         = useState(1)
  const [activeDays, setActiveDays]           = useState<number[]>([1,2,3,4,5]) // Mon=1, Tue=2... Sun=7
  const [platformAlloc, setPlatformAlloc]     = useState<Record<PlatformKey, number>>({ linkedin: 1, x: 0, instagram: 0, facebook: 0, tiktok: 0 })
  const [enabledPlatforms, setEnabledPlatforms] = useState<Set<PlatformKey>>(new Set<PlatformKey>(['linkedin']))

  // Platform connections
  const [li, setLi]     = useState('')
  const [xHandle, setX] = useState('')

  // Topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['SDR coaching', 'Pipeline strategy', 'Sales leadership', 'Cold outreach'])
  const [customTopic, setCustomTopic]       = useState('')

  const [saved, setSaved] = useState(false)

  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const totalAllocated = Object.values(platformAlloc).reduce((a, b) => a + b, 0)

  function toggleDay(i: number) {
    const day = i + 1 // 1=Mon, 2=Tue ... 7=Sun
    setActiveDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort())
  }

  function togglePlatform(key: PlatformKey) {
    setEnabledPlatforms(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
        setPlatformAlloc(a => ({ ...a, [key]: 0 }))
      } else {
        next.add(key)
      }
      return next
    })
  }

  function toggleTopic(t: string) {
    setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function addCustomTopic() {
    const t = customTopic.trim()
    if (!t || selectedTopics.includes(t)) return
    setSelectedTopics(prev => [...prev, t])
    setCustomTopic('')
  }

  async function handleSave() {
    setSaved(true)
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, role, company,
          company_one_liner: companyOneLiner,
          problem_solved: problemSolved,
          target_customer: targetCustomer,
          differentiator: differentiator,
          content_mix: contentMix,
          posts_per_day: postsPerDay,
          active_days: activeDays,
          enabled_platforms: Array.from(enabledPlatforms),
          linkedin_url: li,
          x_handle: xHandle,
          topics: selectedTopics,
        }),
      })
    } catch (e) {
      console.warn('Failed to save profile:', e)
    }
    setTimeout(() => setSaved(false), 2000)
  }

  // Load profile on mount
  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(({ profile }) => {
      if (!profile) return
      if (profile.name) setName(profile.name)
      if (profile.role) setRole(profile.role)
      if (profile.company) setCompany(profile.company)
      if (profile.company_one_liner) setOneLiner(profile.company_one_liner)
      if (profile.problem_solved) setProblem(profile.problem_solved)
      if (profile.target_customer) setTarget(profile.target_customer)
      if (profile.differentiator) setDiff(profile.differentiator)
      if (profile.content_mix) setContentMix(profile.content_mix)
      if (profile.posts_per_day) setPostsPerDay(profile.posts_per_day)
      if (profile.active_days?.length) setActiveDays(profile.active_days)
      if (profile.enabled_platforms) setEnabledPlatforms(new Set<PlatformKey>(profile.enabled_platforms))
      if (profile.linkedin_url) setLi(profile.linkedin_url)
      if (profile.x_handle) setX(profile.x_handle)
      if (profile.topics?.length) setSelectedTopics(profile.topics)
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-bg">

      {/* Topbar */}
      <div className="bg-white border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-serif text-xl font-extrabold tracking-tight text-text leading-tight">Settings</h1>
          <p className="text-xs text-muted">Account, platforms, schedule, and topics</p>
        </div>
        <button onClick={handleSave} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${saved ? 'bg-green-600 text-white' : 'bg-accent text-white hover:opacity-90'}`}>
          {saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-4">

        {/* ── Profile ── */}
        <SettingsCard
          icon={<div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>}
          title="Your profile"
          desc="Used in every post Cadence generates — be specific"
        >
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wide mb-1.5">Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                className="w-full px-3 py-2.5 bg-white border-2 border-border2 rounded-xl text-sm text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wide mb-1.5">Role / Title</label>
              <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="Your role"
                className="w-full px-3 py-2.5 bg-white border-2 border-border2 rounded-xl text-sm text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text uppercase tracking-wide mb-1.5">Company</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Your company"
              className="w-full px-3 py-2.5 bg-white border-2 border-border2 rounded-xl text-sm text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all" />
          </div>
        </SettingsCard>

        {/* ── Company context ── */}
        <SettingsCard
          icon={<div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="6" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 6V5a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>}
          title="Company context"
          desc="Cadence uses this to weave your product naturally into posts — when relevant"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wide mb-1.5">One-liner description</label>
              <input type="text" value={companyOneLiner} onChange={e => setOneLiner(e.target.value)}
                placeholder="e.g. Pepper is AI-powered order management for food distributors"
                className="w-full px-3 py-2.5 bg-white border-2 border-border2 rounded-xl text-sm text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wide mb-1.5">Problem you solve</label>
              <textarea value={problemSolved} onChange={e => setProblem(e.target.value)} rows={2}
                placeholder="e.g. Independent food distributors are stuck on phone orders and spreadsheets — losing customers to faster competitors"
                className="w-full px-3 py-2.5 bg-white border-2 border-border2 rounded-xl text-sm text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wide mb-1.5">Target customer</label>
              <input type="text" value={targetCustomer} onChange={e => setTarget(e.target.value)}
                placeholder="e.g. Independent food & beverage distributors with 10-100 employees"
                className="w-full px-3 py-2.5 bg-white border-2 border-border2 rounded-xl text-sm text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text uppercase tracking-wide mb-1.5">Key differentiator</label>
              <input type="text" value={differentiator} onChange={e => setDiff(e.target.value)}
                placeholder="e.g. The only platform built specifically for independent distributors — not adapted from enterprise software"
                className="w-full px-3 py-2.5 bg-white border-2 border-border2 rounded-xl text-sm text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all" />
            </div>
          </div>

          {/* Content mix slider */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-semibold text-text">Content mix</div>
                <div className="text-xs text-faint">How often should posts mention your product?</div>
              </div>
              <div className="text-xs font-bold text-accent font-mono">
                {contentMix}% thought leadership · {100 - contentMix}% product
              </div>
            </div>
            <input type="range" min={50} max={95} step={5} value={contentMix}
              onChange={e => setContentMix(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: '#FF5C35' }} />
            <div className="flex justify-between text-[10px] text-faint mt-1.5">
              <span>Pipeline focused (50/50)</span>
              <span>Balanced (70/30)</span>
              <span>Brand builder (95/5)</span>
            </div>
            <div className="mt-3 p-3 bg-bg rounded-xl text-xs text-muted leading-relaxed">
              {contentMix >= 90
                ? '✦ Almost all posts will be pure thought leadership — your product is barely mentioned. Great for building credibility first.'
                : contentMix >= 75
                ? '✦ Mostly thought leadership with occasional natural product references. Recommended for most sales professionals.'
                : contentMix >= 60
                ? '✦ Balanced mix — Cadence will weave your product into roughly 1 in 3 posts. Good for active pipeline generation.'
                : '✦ Product-forward — most posts will connect back to what you sell. Best for founders and high-intent outreach.'}
            </div>
          </div>
        </SettingsCard>

        {/* ── Posting schedule ── */}
        <SettingsCard
          icon={<div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 2v4M13 2v4M3 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>}
          title="Posting schedule"
          desc="How many posts per day and which days of the week"
        >
          {/* Posts per day */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-2">Posts per day</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setPostsPerDay(n)}
                  className={`w-10 h-10 rounded-xl border text-sm font-bold transition-all ${
                    postsPerDay === n ? 'bg-accent-light border-accent text-accent' : 'bg-white border-border2 text-muted hover:border-accent hover:text-accent'
                  }`}>{n}</button>
              ))}
            </div>
          </div>

          {/* Active days */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-2">Active days</label>
            <div className="flex gap-1.5">
              {DAYS.map((d, i) => (
                <button key={d} onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                    activeDays.includes(i + 1)
                      ? 'bg-accent-light border-accent text-accent'
                      : 'bg-white border-border2 text-muted hover:border-accent hover:text-accent'
                  }`}>{d}</button>
              ))}
            </div>
          </div>
        </SettingsCard>

        {/* ── Platforms ── */}
        <SettingsCard
          icon={<div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-600" viewBox="0 0 20 20" fill="none">
              <circle cx="5" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="15" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 9l6-3M7 11l6 3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>}
          title="Platforms"
          desc="Choose which platforms to post on and how many posts go to each"
        >
          <div className="space-y-3">
            {PLATFORMS.map(p => {
              const enabled = enabledPlatforms.has(p.key)
              return (
                <div key={p.key} className={`rounded-xl border p-3 transition-all ${enabled ? 'border-border2 bg-white' : 'border-border bg-bg opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    {p.icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text">{p.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          p.postMethod === 'compose' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {p.postMethod === 'compose' ? '↗ Auto-compose' : '📋 Copy & paste'}
                        </span>
                      </div>
                      <div className="text-xs text-faint mt-0.5">{p.desc}</div>
                    </div>
                    {/* Toggle */}
                    <div onClick={() => togglePlatform(p.key)}
                      className={`w-9 h-5 rounded-full flex-shrink-0 relative transition-colors duration-200 cursor-pointer ${enabled ? 'bg-green-500' : 'bg-border2'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </div>

                  {/* Posts allocation — only when enabled and postsPerDay > 1 */}
                  {enabled && postsPerDay > 1 && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-3">
                      <span className="text-xs text-muted flex-1">Posts per day on {p.name}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: postsPerDay + 1 }, (_, n) => (
                          <button key={n} onClick={() => setPlatformAlloc(prev => ({ ...prev, [p.key]: n }))}
                            className={`w-7 h-7 rounded-lg border text-xs font-bold transition-all ${
                              platformAlloc[p.key] === n ? 'bg-accent-light border-accent text-accent' : 'bg-white border-border2 text-muted hover:border-accent'
                            }`}>{n}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connection fields */}
                  {enabled && p.key === 'linkedin' && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <input type="text" value={li} onChange={e => setLi(e.target.value)} placeholder="https://linkedin.com/in/yourname"
                        className="w-full px-3 py-2 bg-bg border border-border2 rounded-xl text-xs focus:outline-none focus:border-accent transition-all" />
                    </div>
                  )}
                  {enabled && p.key === 'x' && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                      <span className="text-sm font-semibold text-muted">@</span>
                      <input type="text" value={xHandle} onChange={e => setX(e.target.value.replace('@',''))} placeholder="yourhandle"
                        className="flex-1 px-3 py-2 bg-bg border border-border2 rounded-xl text-xs focus:outline-none focus:border-accent transition-all" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Allocation summary */}
          {postsPerDay > 1 && enabledPlatforms.size > 0 && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-semibold ${
              totalAllocated === postsPerDay ? 'bg-green-50 text-green-700' :
              totalAllocated > postsPerDay  ? 'bg-red-50 text-red-600' :
                                               'bg-amber-50 text-amber-700'
            }`}>
              {totalAllocated === postsPerDay
                ? `✓ ${postsPerDay} post${postsPerDay > 1 ? 's' : ''}/day allocated across platforms`
                : totalAllocated > postsPerDay
                ? `⚠ Over-allocated: ${totalAllocated} assigned, only ${postsPerDay}/day — reduce some`
                : `${totalAllocated} of ${postsPerDay} posts/day allocated — assign the rest`}
            </div>
          )}
        </SettingsCard>

        {/* ── Topics ── */}
        <SettingsCard
          icon={<div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber" viewBox="0 0 20 20" fill="none">
              <path d="M10 3a7 7 0 1 1 0 14A7 7 0 0 1 10 3z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 7v3l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>}
          title="Content topics"
          desc="Cadence rotates through these pillars to keep your content varied"
        >
          {/* Selected topics */}
          <div className="mb-3">
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Your pillars ({selectedTopics.length} selected)</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTopics.map(t => (
                <div key={t} className="flex items-center gap-1.5 bg-accent-light border border-accent/30 text-accent rounded-full px-3 py-1.5 text-xs font-semibold">
                  {t}
                  <button onClick={() => toggleTopic(t)} className="text-accent/60 hover:text-accent leading-none text-base ml-0.5">×</button>
                </div>
              ))}
              {selectedTopics.length === 0 && (
                <div className="text-xs text-faint italic">No topics selected — add some below</div>
              )}
            </div>
          </div>

          {/* Topic library */}
          <div className="mb-3">
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Topic library</div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TOPICS.filter(t => !selectedTopics.includes(t)).map(t => (
                <button key={t} onClick={() => toggleTopic(t)}
                  className="px-3 py-1.5 rounded-full border border-border2 bg-white text-xs font-semibold text-muted hover:border-accent hover:text-accent hover:bg-accent-light transition-all">
                  + {t}
                </button>
              ))}
            </div>
          </div>

          {/* Custom topic */}
          <div className="pt-3 border-t border-border">
            <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Add custom topic</div>
            <div className="flex gap-2">
              <input
                type="text" value={customTopic} onChange={e => setCustomTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomTopic()}
                placeholder="e.g. Enterprise selling, RevOps…"
                className="flex-1 px-3 py-2.5 bg-white border border-border2 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
              />
              <button onClick={addCustomTopic}
                className="px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex-shrink-0">
                Add
              </button>
            </div>
          </div>
        </SettingsCard>

        {/* ── Account ── */}
        <SettingsCard
          icon={<div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
            <svg className="w-5 h-5 text-muted" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>}
          title="Account"
          desc="Subscription and billing"
        >
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-sm font-semibold text-text">Free trial</div>
              <div className="text-xs text-muted mt-0.5">12 days remaining · No credit card on file</div>
            </div>
            <button className="bg-accent text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Upgrade to Pro — $39/mo
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted space-y-1">
              <div>✓ Unlimited post generation</div>
              <div>✓ Team scoreboard (up to 15 seats)</div>
              <div>✓ Voice memory — gets better every post</div>
              <div>✓ All platforms</div>
            </div>
          </div>
        </SettingsCard>

        {/* ── Danger zone ── */}
        <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
          <div className="text-sm font-bold text-red-600 mb-1">Danger zone</div>
          <div className="text-xs text-muted mb-4">These actions are permanent and cannot be undone.</div>
          <div className="flex flex-col gap-2">
            <button className="text-left px-4 py-2.5 rounded-xl border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">Clear all post history</button>
            <button className="text-left px-4 py-2.5 rounded-xl border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">Delete account</button>
          </div>
        </div>

      </div>
    </div>
  )
}
