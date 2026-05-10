'use client'

import { useState, useEffect } from 'react'
import { generate, buildPostPrompt } from '@/lib/generate'
import { cn } from '@/lib/utils'

// Placeholder profile — will come from Supabase once wired
const DEMO_PROFILE = {
  name: 'Oli',
  role: 'Head of SDR',
  company: 'Pepper',
  goal: 'Thought leadership',
  audience: 'Sales leaders and SDR managers',
  tone: 'Bold & direct',
  topics: ['SDR coaching', 'Pipeline strategy', 'Sales leadership'],
}

export default function TodayPost({ userId }: { userId: string }) {
  const [post, setPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [approved, setApproved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadPost()
  }, [])

  async function loadPost() {
    setLoading(true)
    try {
      const prompt = `You are ghostwriting a LinkedIn post for ${DEMO_PROFILE.name}, ${DEMO_PROFILE.role} at ${DEMO_PROFILE.company}.

VOICE: ${DEMO_PROFILE.tone}. Write in first person. Be direct and specific. No corporate speak. No generic advice.

TOPIC: Pick one from ${DEMO_PROFILE.topics.join(', ')}. Write about something specific and real — a lesson learned, a mistake made, a pattern noticed, or a contrarian take.

FORMAT:
- Start with a single bold hook line that stops the scroll
- One sentence per paragraph, max 3-4 paragraphs
- Total length: 80-120 words
- No hashtags, no emojis
- End with either a specific observation or a short question

Return ONLY the post text. No preamble, no quotes, no "Here's a post:"`
      const text = await generate(prompt, { maxTokens: 600 })
      setPost(text)
    } catch (e) {
      setPost(`I've managed SDR teams long enough to know this:\n\nThe reps who hit quota consistently aren't the ones with the best pitch.\n\nThey're the ones who do the work nobody else wants to do — the research, the follow-up, the patience.\n\nMost people optimise for looking productive. The best reps optimise for being effective.\n\nSame inputs. Completely different outputs.`)
    } finally {
      setLoading(false)
    }
  }

  function handleApproveAndPost() {
    navigator.clipboard?.writeText(post)
    setApproved(true)
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank')
  }

  function handleCopy() {
    navigator.clipboard?.writeText(post)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSaveEdit() {
    setPost(editContent)
    setEditMode(false)
  }

  if (approved) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-4 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="font-serif text-xl font-extrabold text-green-800 mb-1">Opening LinkedIn</h3>
        <p className="text-sm text-green-700 mb-4">Text copied — paste into the compose box and click Post.</p>
        <button
          onClick={handleCopy}
          className="bg-white border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
        >
          {copied ? 'Copied! ✓' : 'Copy again'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden mb-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0">
        <div className="flex items-center gap-1.5 bg-[#EBF4FF] text-[#0A66C2] rounded px-2 py-1 text-xs font-bold">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.024-3.037-1.852-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </div>
        <span className="text-[11px] font-semibold text-faint uppercase tracking-[0.5px]">Story hook</span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
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
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full border border-accent rounded-xl p-3 text-sm leading-relaxed resize-y min-h-[140px] focus:outline-none focus:ring-2 focus:ring-accent/15"
            autoFocus
          />
        ) : (
          <p className="text-[13px] leading-[1.8] text-text whitespace-pre-wrap">{post}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 px-4 pb-4">
        <button
          onClick={handleApproveAndPost}
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm shadow-green-600/25"
        >
          ✓ Approve + Post
        </button>
        <button
          onClick={() => { setEditMode(!editMode); setEditContent(post) }}
          className={cn(
            "flex-1 py-2.5 rounded-lg border border-border2 text-xs font-bold transition-colors",
            editMode ? "bg-accent text-white border-accent" : "bg-white text-text hover:bg-surface"
          )}
        >
          {editMode ? <span onClick={handleSaveEdit}>Save</span> : 'Edit'}
        </button>
        <button
          onClick={loadPost}
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg border border-accent/25 bg-accent-light text-accent text-xs font-bold hover:border-accent transition-colors disabled:opacity-50"
        >
          {loading ? '...' : '↺ Regen'}
        </button>
      </div>
    </div>
  )
}
