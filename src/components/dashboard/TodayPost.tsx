'use client'

import { useState, useEffect } from 'react'
import { generate } from '@/lib/generate'

interface Profile {
  name?: string; role?: string; company?: string; topics?: string[]
  tone?: string; company_one_liner?: string; content_mix?: number
}
interface VoiceSettings {
  tone_slider?: number; length_slider?: number
  story_slider?: number; provocative_slider?: number
  bold_hook?: boolean; short_paragraphs?: boolean
  end_with_cta?: boolean; personal_stories?: boolean
  rhetorical_questions?: boolean
  use_hashtags?: boolean; max_hashtags?: number
  use_emojis?: boolean; post_length?: string
  voice_samples?: string[]
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

  // Translate DNA sliders to voice instructions
  const toneVal = v.tone_slider ?? 25
  const lengthVal = v.length_slider ?? 60
  const storyVal = v.story_slider ?? 40
  const provVal = v.provocative_slider ?? 65

  const toneDesc = toneVal > 70 ? 'conversational and direct, like talking to a colleague' :
                   toneVal > 40 ? 'balanced — professional but approachable' :
                                  'formal and authoritative'

  const styleDesc = storyVal > 70 ? 'story-driven — anchor every point in a real experience' :
                    storyVal > 40 ? 'blend of insight and story' :
                                    'insight and data-driven — back claims with evidence'

  const edgeDesc = provVal > 70 ? 'take a bold, slightly provocative stance — challenge the conventional wisdom' :
                   provVal > 40 ? 'have a clear point of view, dont sit on the fence' :
                                  'be measured and evidence-based'

  const openings = [
    'Start with a specific number or stat from your experience',
    'Start with a short statement that challenges conventional wisdom',
    'Start with a specific moment: set the scene in one sentence',
    'Start with a direct counter-intuitive claim',
    'Start with something you got wrong early in your career',
    'Start with a pattern you keep seeing that others miss',
    'Start with a specific result, then explain how you got there',
    'Start with the uncomfortable truth nobody in sales says out loud',
  ]
  const opening = openings[Math.floor(Math.random() * openings.length)]

  // Voice samples context
  const sampleContext = v.voice_samples?.filter((s: string) => s?.trim().length > 30).slice(0, 2)
    .map((s: string) => s.trim().substring(0, 200))
    .join('\n---\n')

  return `You are ghostwriting a LinkedIn post for ${p.name || 'a sales professional'}, ${p.role} at ${p.company}.

VOICE PROFILE:
- Tone: ${toneDesc}
- Style: ${styleDesc}  
- Edge: ${edgeDesc}
${sampleContext ? `- Writing samples (match this voice):
${sampleContext}` : ''}

TOPIC: ${topic}
OPENING STYLE: ${opening}

FORMAT: ${words} words. ${rules}.
Never start with "I've seen" or "I've noticed". Be specific — real situations, real numbers.
Return ONLY the post text with no preamble.${companyNote}`
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
      let text = raw.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/#{1,6}\s/g, '').trim()
      
      // If short paragraphs is on, force each sentence onto its own line
      if (v.short_paragraphs !== false) {
        text = text
          // Split on sentence endings followed by a space and capital letter
          .replace(/([.!?])\s+([A-Z])/g, '$1\n$2')
          // Clean up any triple+ newlines
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      }
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
      <div className="bg-white border-2 border-green-400 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">✅</div>
          <div>
            <div className="font-bold text-green-800 text-sm">LinkedIn is open in a new tab</div>
            <div className="text-xs text-green-700 mt-0.5">Your post text is copied — follow the steps below</div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 mb-3 space-y-2">
          <div className="flex items-center gap-2.5 text-sm text-green-800">
            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            Switch to the LinkedIn tab
          </div>
          <div className="flex items-center gap-2.5 text-sm text-green-800">
            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            Click in the &quot;Start a post&quot; box
          </div>
          <div className="flex items-center gap-2.5 text-sm font-bold text-green-800">
            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            Press <kbd className="bg-white border border-green-300 rounded px-1.5 py-0.5 text-xs font-mono mx-1">⌘V</kbd> to paste, then click Post
          </div>
        </div>
        <button
          onClick={() => { navigator.clipboard?.writeText(post); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          {copied ? '✓ Copied!' : '📋 Copy text again'}
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
