'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = ['Who are you?', 'What do you sell?', 'What do you post about?', 'Your schedule']

const ALL_TOPICS = [
  'Sales leadership', 'Pipeline strategy', 'SDR coaching', 'Cold outreach',
  'Sales ops', 'Hiring & talent', 'AI in sales', 'Revenue operations',
  'Sales culture', 'Prospecting', 'Deal strategy', 'Customer success',
  'Founder GTM', 'Sales enablement', 'Quota & metrics',
]

const DAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 7 },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Step 1
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')

  // Step 2
  const [oneLiner, setOneLiner] = useState('')
  const [targetCustomer, setTargetCustomer] = useState('')
  const [problemSolved, setProblemSolved] = useState('')
  const [contentMix, setContentMix] = useState(75)

  // Step 3
  const [topics, setTopics] = useState<string[]>([])

  // Step 4
  const [activeDays, setActiveDays] = useState<number[]>([1,2,3,4,5])
  const [postsPerDay, setPostsPerDay] = useState(1)

  function toggleTopic(t: string) {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function toggleDay(value: number) {
    setActiveDays(prev => prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value].sort())
  }

  function canAdvance() {
    if (step === 0) return name.trim().length > 0 && role.trim().length > 0 && company.trim().length > 0
    if (step === 1) return oneLiner.trim().length > 0
    if (step === 2) return topics.length >= 2
    return activeDays.length > 0
  }

  async function handleFinish() {
    setSaving(true)
    try {
      // Save profile
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, role, company,
          company_one_liner: oneLiner,
          target_customer: targetCustomer,
          problem_solved: problemSolved,
          content_mix: contentMix,
          topics,
          active_days: activeDays.map(d => Number(d)),
          posts_per_day: Number(postsPerDay),
          enabled_platforms: ['linkedin'],
        }),
      })

      // Small delay to ensure DB write is complete
      await new Promise(resolve => setTimeout(resolve, 500))

      // Generate first week
      setGenerating(true)
      const genRes = await fetch('/api/generate-week', { method: 'POST' })
      const genData = await genRes.json()
      console.log('Generate week result:', genData)

      router.push('/dashboard/calendar')
    } catch (e) {
      console.warn('Onboarding save failed:', e)
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-8 h-8 bg-[#FF6B3D] rounded-lg flex items-center justify-center"
            style={{ boxShadow: '0 2px 8px rgba(255,107,61,0.35)' }}>
            <svg viewBox="0 0 17 17" fill="none" className="w-[17px] h-[17px]">
              <rect x="2" y="3.5" width="13" height="2.5" rx="1.25" fill="white" />
              <rect x="2" y="7.25" width="9" height="2.5" rx="1.25" fill="white" />
              <rect x="2" y="11" width="11" height="2.5" rx="1.25" fill="white" />
              <path d="M12 13.5l1.2 1.2 2.3-2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-serif text-[19px] font-extrabold text-[#1F1F1F] tracking-tight">
            Caden<em className="text-[#FF6B3D] not-italic">ce</em>
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-[#FF6B3D] text-white' :
                'bg-[#ECE7E2] text-[#9B9590]'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-green-400' : 'bg-[#ECE7E2]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#ECE7E2] shadow-sm p-8">

          {/* Step 0 — Who are you */}
          {step === 0 && (
            <div>
              <h2 className="font-sans text-xl font-bold text-[#1F1F1F] mb-1">Let's get to know you</h2>
              <p className="text-sm text-[#6B6560] mb-6">Cadence uses this in every post it generates</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-1.5">Your name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan"
                    className="w-full px-3.5 py-2.5 border-2 border-[#ECE7E2] rounded-xl text-sm focus:outline-none focus:border-[#FF6B3D] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-1.5">Your role / title</label>
                  <input value={role} onChange={e => setRole(e.target.value)} placeholder="VP of Sales"
                    className="w-full px-3.5 py-2.5 border-2 border-[#ECE7E2] rounded-xl text-sm focus:outline-none focus:border-[#FF6B3D] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-1.5">Company</label>
                  <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp"
                    className="w-full px-3.5 py-2.5 border-2 border-[#ECE7E2] rounded-xl text-sm focus:outline-none focus:border-[#FF6B3D] transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — What do you sell */}
          {step === 1 && (
            <div>
              <h2 className="font-sans text-xl font-bold text-[#1F1F1F] mb-1">What does {company || 'your company'} do?</h2>
              <p className="text-sm text-[#6B6560] mb-6">Cadence will weave this in naturally when relevant</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-1.5">One-liner description</label>
                  <input value={oneLiner} onChange={e => setOneLiner(e.target.value)}
                    placeholder="e.g. AI-powered sales intelligence for B2B teams"
                    className="w-full px-3.5 py-2.5 border-2 border-[#ECE7E2] rounded-xl text-sm focus:outline-none focus:border-[#FF6B3D] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-1.5">Target customer <span className="text-[#9B9590] normal-case font-normal">(optional)</span></label>
                  <input value={targetCustomer} onChange={e => setTargetCustomer(e.target.value)}
                    placeholder="e.g. B2B SaaS companies with 50-500 employees"
                    className="w-full px-3.5 py-2.5 border-2 border-[#ECE7E2] rounded-xl text-sm focus:outline-none focus:border-[#FF6B3D] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-1.5">Problem you solve <span className="text-[#9B9590] normal-case font-normal">(optional)</span></label>
                  <textarea value={problemSolved} onChange={e => setProblemSolved(e.target.value)} rows={2}
                    placeholder="e.g. Sales teams waste hours on manual research instead of selling"
                    className="w-full px-3.5 py-2.5 border-2 border-[#ECE7E2] rounded-xl text-sm focus:outline-none focus:border-[#FF6B3D] transition-colors resize-none" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wide">Content mix</label>
                    <span className="text-xs font-bold text-[#FF6B3D]">{contentMix}% thought leadership · {100 - contentMix}% product</span>
                  </div>
                  <input type="range" min={50} max={95} step={5} value={contentMix}
                    onChange={e => setContentMix(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: '#FF6B3D' }} />
                  <div className="flex justify-between text-[10px] text-[#9B9590] mt-1">
                    <span>Product-forward</span>
                    <span>Balanced</span>
                    <span>Brand builder</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Topics */}
          {step === 2 && (
            <div>
              <h2 className="font-sans text-xl font-bold text-[#1F1F1F] mb-1">What do you post about?</h2>
              <p className="text-sm text-[#6B6560] mb-6">Pick at least 2 — Cadence rotates through these to keep content varied</p>
              <div className="flex flex-wrap gap-2">
                {ALL_TOPICS.map(t => (
                  <button key={t} onClick={() => toggleTopic(t)}
                    className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                      topics.includes(t)
                        ? 'bg-[#FF6B3D] border-[#FF6B3D] text-white'
                        : 'bg-white border-[#ECE7E2] text-[#6B6560] hover:border-[#FF6B3D] hover:text-[#FF6B3D]'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
              {topics.length > 0 && (
                <div className="mt-4 text-xs text-[#9B9590]">{topics.length} selected</div>
              )}
            </div>
          )}

          {/* Step 3 — Schedule */}
          {step === 3 && (
            <div>
              <h2 className="font-sans text-xl font-bold text-[#1F1F1F] mb-1">When do you want to post?</h2>
              <p className="text-sm text-[#6B6560] mb-6">Cadence will generate posts for these days automatically</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-3">Active days</label>
                  <div className="flex gap-2">
                    {DAYS.map(({ label, value }) => (
                      <button key={value} onClick={() => toggleDay(value)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                          activeDays.includes(value)
                            ? 'bg-[#FFF0EC] border-[#FF6B3D] text-[#FF6B3D]'
                            : 'bg-white border-[#ECE7E2] text-[#9B9590] hover:border-[#FF6B3D] hover:text-[#FF6B3D]'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-3">Posts per day</label>
                  <div className="flex gap-2">
                    {[1,2,3].map(n => (
                      <button key={n} onClick={() => setPostsPerDay(n)}
                        className={`w-12 h-10 rounded-xl border text-sm font-bold transition-all ${
                          postsPerDay === n
                            ? 'bg-[#FFF0EC] border-[#FF6B3D] text-[#FF6B3D]'
                            : 'bg-white border-[#ECE7E2] text-[#9B9590] hover:border-[#FF6B3D]'
                        }`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-[#FAF8F6] border border-[#ECE7E2] rounded-xl p-4">
                  <div className="text-sm font-semibold text-[#1F1F1F] mb-1">
                    {activeDays.length * postsPerDay} posts per week
                  </div>
                  <div className="text-xs text-[#6B6560]">
                    {activeDays.map(d => DAYS.find(x => x.value === d)?.label).join(', ')} · {postsPerDay} post{postsPerDay > 1 ? 's' : ''}/day
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generating state */}
          {generating && (
            <div className="mt-6 p-4 bg-[#FFF0EC] border border-[#FF6B3D]/20 rounded-xl">
              <div className="flex items-center gap-3 text-sm text-[#FF6B3D] font-semibold">
                <span className="w-4 h-4 border-2 border-[#FF6B3D] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                Generating your first {activeDays.length * postsPerDay * 2} posts... this takes about 15 seconds
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : null}
            className={`text-sm font-semibold text-[#6B6560] hover:text-[#1F1F1F] transition-colors ${step === 0 ? 'invisible' : ''}`}>
            ← Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="bg-[#FF6B3D] text-white font-bold text-sm px-8 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ boxShadow: canAdvance() ? '0 2px 8px rgba(255,107,61,0.3)' : 'none' }}>
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canAdvance() || saving}
              className="bg-[#FF6B3D] text-white font-bold text-sm px-8 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ boxShadow: canAdvance() ? '0 2px 8px rgba(255,107,61,0.3)' : 'none' }}>
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Setting up...</>
              ) : '✦ Generate my first week →'}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-[#9B9590] mt-4">
          You can change any of this later in Settings
        </p>
      </div>
    </div>
  )
}
