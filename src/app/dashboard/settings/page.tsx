'use client'

import { useState } from 'react'

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
  icon: React.ReactNode
  title: string
  desc: string
  connected?: boolean
  children: React.ReactNode
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

export default function SettingsPage() {
  const [li, setLi]         = useState('')
  const [xHandle, setX]     = useState('')
  const [name, setName]     = useState('')
  const [role, setRole]     = useState('')
  const [company, setCompany] = useState('')
  const [saved, setSaved]   = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const liConnected = li.trim().length > 0
  const xConnected  = xHandle.trim().length > 0

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function testLinkedIn() {
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank')
  }

  function testX() {
    const text = encodeURIComponent("Testing Cadence's Approve + Post flow. Works perfectly. 🚀")
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-bg">

      {/* Topbar */}
      <div className="bg-white border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-serif text-xl font-extrabold tracking-tight text-text leading-tight">Settings</h1>
          <p className="text-xs text-muted">Account, platforms, and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            saved ? 'bg-green-600 text-white' : 'bg-accent text-white hover:opacity-90'
          }`}
        >
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
          desc="Name and role used in post generation — the more specific, the better the output"
        >
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">Full name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Oli Elliott"
                className="w-full px-3 py-2.5 bg-white border border-border2 rounded-xl text-sm text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">Role / Title</label>
              <input
                type="text" value={role} onChange={e => setRole(e.target.value)}
                placeholder="Head of SDR"
                className="w-full px-3 py-2.5 bg-white border border-border2 rounded-xl text-sm text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">Company</label>
            <input
              type="text" value={company} onChange={e => setCompany(e.target.value)}
              placeholder="Pepper"
              className="w-full px-3 py-2.5 bg-white border border-border2 rounded-xl text-sm text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
            />
          </div>
        </SettingsCard>

        {/* ── LinkedIn ── */}
        <SettingsCard
          icon={<div className="w-9 h-9 rounded-xl bg-[#EBF4FF] flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.024-3.037-1.852-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>}
          title="LinkedIn"
          desc="Approve + Post opens LinkedIn's compose window with your text pre-copied"
          connected={liConnected}
        >
          <div className="mb-3">
            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">Your LinkedIn profile URL</label>
            <input
              type="text" value={li} onChange={e => setLi(e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className="w-full px-3 py-2.5 bg-white border border-border2 rounded-xl text-sm text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
            />
          </div>
          <div className="bg-bg rounded-xl p-3 text-xs text-muted leading-relaxed mb-3">
            <strong className="text-text">How Approve + Post works:</strong> Cadence copies your post text to the clipboard and opens LinkedIn&apos;s share composer in a new tab. Just paste <kbd className="bg-white border border-border rounded px-1 py-0.5 text-[10px] font-mono">⌘V</kbd> and click Post.
          </div>
          <button
            onClick={testLinkedIn}
            className="text-xs font-semibold text-[#0A66C2] hover:underline"
          >
            Test LinkedIn compose →
          </button>
        </SettingsCard>

        {/* ── X / Twitter ── */}
        <SettingsCard
          icon={<div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.826L2.25 2.25h6.89l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
            </svg>
          </div>}
          title="X (Twitter)"
          desc="Uses Twitter's free web intent — text pre-fills the composer, no API needed"
          connected={xConnected}
        >
          <div className="mb-3">
            <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-1.5">Your X / Twitter handle</label>
            <div className="flex items-center gap-2">
              <span className="text-muted text-sm font-semibold flex-shrink-0">@</span>
              <input
                type="text" value={xHandle} onChange={e => setX(e.target.value.replace('@',''))}
                placeholder="yourhandle"
                className="flex-1 px-3 py-2.5 bg-white border border-border2 rounded-xl text-sm text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
              />
            </div>
          </div>
          <div className="bg-bg rounded-xl p-3 text-xs text-muted leading-relaxed mb-3">
            <strong className="text-text">How it works:</strong> Cadence builds a <code className="bg-white border border-border rounded px-1 py-0.5 text-[10px] font-mono">twitter.com/intent/tweet</code> URL with your post text pre-filled and opens it in a new tab. You just click Tweet. Zero API cost, zero monthly fee.
          </div>
          <button
            onClick={testX}
            className="text-xs font-semibold text-gray-700 hover:underline"
          >
            Test X compose →
          </button>
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
          desc="Subscription, billing, and account management"
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
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-text">Pro plan includes</div>
              <div className="text-xs text-muted mt-1 space-y-0.5">
                <div>✓ Unlimited post generation</div>
                <div>✓ Team scoreboard (up to 15 seats)</div>
                <div>✓ Voice memory — gets better every post</div>
                <div>✓ Direct LinkedIn + X publishing</div>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* ── Danger zone ── */}
        <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
          <div className="text-sm font-bold text-red-600 mb-1">Danger zone</div>
          <div className="text-xs text-muted mb-4">These actions are permanent and cannot be undone.</div>
          <div className="flex flex-col gap-2">
            <button className="text-left px-4 py-2.5 rounded-xl border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
              Clear all post history
            </button>
            <button className="text-left px-4 py-2.5 rounded-xl border border-red-100 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
              Delete account
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
