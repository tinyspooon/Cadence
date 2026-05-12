'use client'

import { useState, useEffect } from 'react'
import { generate } from '@/lib/generate'

interface Profile {
  name?: string; role?: string; company?: string; topics?: string[]
  tone?: string; company_one_liner?: string; content_mix?: number
}
interface VoiceSettings {
  tone_slider?: number; length_slider?: number; bold_hook?: boolean
  short_paragraphs?: boolean; end_with_cta?: boolean
  use_hashtags?: boolean; max_hashtags?: number
  use_emojis?: boolean; post_length?: string
}

const FALLBACK: Profile = {
  name: 'there', role: 'Sales professional', company: 'your company',
  topics: ['Sales leadership', 'Pipeline strategy', 'SDR coaching'],
  tone: 'Bold & direct', content_mix: 80,
}

function buildPrompt(p: Profile, v: VoiceSettings): string {
  const topics = p.topics?.length ? p.topics : FALLBACK.topics!
  const topic = topics[Math.floor(Math.random() * topics.length)]
  const words = v.post_length === 'short' ? '60-90' : v.post_length === 'long' ? '200-280' : '100-140'
  const mix = p.content_mix ?? 80
  const rules = [
    v.bold_hook !== false && 'Start with a bold single-line hook',
    v.short_paragraphs !== false && 'One sentence per paragraph',
    v.end_with_cta !== false && 'End with a question or direct observation',
    !v.use_emojis && 'No emojis',
    !v.use_hashtags && 'No hashtags',
  ].filter(Boolean).join('. ')

  let companyNote = ''
  if (p.company_one_liner && mix < 90) {
    const freq = mix <= 60 ? 'Weave in a natural reference to' : mix <= 75 ? 'Optionally reference' : 'Only if it fits naturally, mention'
    companyNote = `\n${freq} ${p.company} (${p.company_one_liner}) if it genuinely strengthens the post. Don't force it.`
  }

  return `You are ghostwriting a LinkedIn post for ${p.name || 'a sales professional'}, ${p.role} at ${p.company}.
Voice: ${p.tone || 'Bold & direct'}. Write in first person. Be specific — real situations, real observations. Never give generic advice.
Topic: ${topic}
Format: ${words} words. ${rules}. Return ONLY the post text.${companyNote}`
}

export default function TodayPost({ userId }: { userId: string }) {
  const [post, setPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [approved, setApproved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [profile, setProfile] = useState<Profile>(FALLBACK)
  const [voice, setVoice] = useState<VoiceSettings>({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [pRes, vRes] = await Promise.all([fetch('/api/profile'), fetch('/api/voice')])
      const [pData, vData] = await Promise.all([pRes.json(), vRes.json()])
      const p = pData.profile ?? FALLBACK
      const v = vData.voice ?? {}
      setProfile(p); setVoice(v)
      await generatePost(p, v)
    } catch { await generatePost(FALLBACK, {}) }
  }

  async function generatePost(p: Profile, v: VoiceSettings) {
    setLoading(true)
    try {
      const raw = await generate(buildPrompt(p, v), { maxTokens: 500 })
      const text = raw.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/#{1,6}\s/g, '').trim()
      setPost(text)
    } catch {
      setPost("Most sales teams are optimising for the wrong thing.\n\nThey track activity. Dials, emails, tasks logged.\n\nThe teams that consistently hit quota track outcomes. Conversations that moved. Decisions that got made.\n\nSame effort. Completely different results.")
    } finally { setLoading(false) }
  }

  function handleApproveAndPost() {
    // Must be synchronous to avoid popup blocker — open window immediately on click
    const linkedInWindow = window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank')
    // Copy to clipboard
    navigator.clipboard?.writeText(post).catch(() => {})
    setApproved(true); setCopied(true)
    // Save to DB async (non-blocking)
    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: post, platform: 'linkedin', style: 'Story', status: 'posted' }),
    }).catch(e => console.warn('Failed to save post:', e))
  }

  if (approved) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-4 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="font-serif text-xl font-extrabold text-green-800 mb-1">Opening LinkedIn</h3>
        <p className="text-sm text-green-700 mb-4">Text copied — paste and click Post.</p>
        <button onClick={() => { navigator.clipboard?.writeText(post); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="bg-white border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
          {copied ? 'Copied! ✓' : 'Copy again'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden mb-4 shadow-sm">
      <div className="flex items-center justify-between px-4 pt-4 pb-0">
        <div className="flex items-center gap-1.5 bg-[#EBF4FF] text-[#0A66C2] rounded px-2 py-1 text-xs font-bold">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.024-3.037-1.852-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </div>
        <span className="text-[11px] font-semibold text-faint uppercase tracking-[0.5px]">Story hook</span>
      </div>
      <div className="px-4 py-3 min-h-[120px]">
        {loading ? (
          <div className="flex items-center gap-3 py-6 text-sm text-muted">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-accent rounded-full dot-1" />
              <div className="w-1.5 h-1.5 bg-accent rounded-full dot-2" />
              <div className="w-1.5 h-1.5 bg-accent rounded-full dot-3" />
            </div>
            Writing today&apos;s post...
          </div>
        ) : editMode ? (
          <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
            className="w-full border border-accent rounded-xl p-3 text-sm leading-relaxed resize-y min-h-[140px] focus:outline-none focus:ring-2 focus:ring-accent/15"
            autoFocus />
        ) : (
          <p className="text-[13px] leading-[1.8] text-text whitespace-pre-wrap">{post}</p>
        )}
      </div>
      <div className="flex gap-1.5 px-4 pb-4">
        <button onClick={handleApproveAndPost} disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm">
          ✓ Approve + Post
        </button>
        <button onClick={() => { setEditMode(!editMode); setEditContent(post) }}
          className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition-colors ${editMode ? 'bg-accent text-white border-accent' : 'bg-white text-text border-border2 hover:bg-surface'}`}>
          {editMode ? <span onClick={handleSaveEdit}>Save</span> : 'Edit'}
        </button>
        <button onClick={() => generatePost(profile, voice)} disabled={loading}
          className="flex-1 py-2.5 rounded-lg border border-accent/25 bg-accent-light text-accent text-xs font-bold hover:border-accent transition-colors disabled:opacity-50">
          {loading ? '...' : '↻ Regen'}
        </button>
      </div>
    </div>
  )

  function handleSaveEdit() { setPost(editContent); setEditMode(false) }
}
