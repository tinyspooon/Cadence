'use client'

import { useState } from 'react'

type Platform = 'linkedin' | 'x'
type Status = 'draft' | 'scheduled' | 'approved' | 'posted'

interface Post {
  id: string
  date: string
  platform: Platform
  status: Status
  style: string
  topic: string
  preview: string
  full: string
}

const INITIAL_POSTS: Post[] = [
  {
    id: 'a1', date: 'Today', platform: 'linkedin', status: 'approved', style: 'Story', topic: 'SDR coaching',
    preview: "I've managed SDR teams long enough to know this: the reps who hit quota consistently aren't the ones with the best pitch.",
    full: "I've managed SDR teams long enough to know this:\n\nThe reps who hit quota consistently aren't the ones with the best pitch.\n\nThey're the ones who do the work nobody else wants to do — the research, the follow-up, the patience.\n\nMost people optimise for looking productive. The best reps optimise for being effective.\n\nSame inputs. Completely different outputs."
  },
  {
    id: 's1', date: 'Tomorrow · May 9', platform: 'linkedin', status: 'scheduled', style: 'Story', topic: 'Cold outreach',
    preview: 'The cold email mistake everyone makes — and how to stop it cold.',
    full: "The cold email mistake everyone makes — and how to stop it.\n\nMost cold emails talk about the sender, not the reader.\n\n\"We help companies like yours...\" — who cares? You haven't earned that yet.\n\nStart with their world. Reference something specific. Make them feel seen.\n\nThen — and only then — tell them what you do."
  },
  {
    id: 's2', date: 'Wed · May 8', platform: 'x', status: 'scheduled', style: 'Observation', topic: 'Sales leadership',
    preview: 'SDR metrics that actually matter vs ones that sound good to your CRO.',
    full: "SDR metrics that actually matter vs ones that sound good.\n\nMatters: Pipeline created, SAO rate, avg deal size sourced.\nSounds good: Dials, emails sent, activities logged.\n\nYour CRO doesn't care how busy your team looks."
  },
  {
    id: 's3', date: 'Thu · May 9', platform: 'linkedin', status: 'scheduled', style: 'Story', topic: 'Pipeline strategy',
    preview: 'What 3 months of multi-threading taught me about patience and enterprise deals.',
    full: "What 3 months of multi-threading taught me about patience.\n\nWe touched 6 stakeholders before the deal closed. Some took 8 follow-ups. One ghosted for 3 weeks and came back with budget.\n\nThe rep who wanted to \"just move on\" after week 4 — he's glad he didn't."
  },
  {
    id: 's4', date: 'Fri · May 10', platform: 'linkedin', status: 'scheduled', style: 'Insight', topic: 'Sales leadership',
    preview: "Pipeline is a lagging indicator. Here's the number I actually watch instead.",
    full: "Pipeline is a lagging indicator. Here's what I actually watch.\n\nBy the time pipeline looks bad, it's already too late.\n\nI watch: ICP account coverage, meaningful conversation rate, and rep response time on inbound signals.\n\nThose three numbers predict pipeline 6 weeks out."
  },
  {
    id: 's5', date: 'Mon · May 12', platform: 'x', status: 'scheduled', style: 'Observation', topic: 'SDR coaching',
    preview: 'Hot take: SDR to AE handoff is where most deals die, not prospecting.',
    full: "Hot take: the SDR to AE handoff is where most deals die.\n\nNot bad prospecting. Not bad demos. The handoff.\n\nFix your internal communication before blaming the market."
  },
  {
    id: 'd1', date: 'May 14', platform: 'linkedin', status: 'draft', style: 'Story', topic: 'Pipeline strategy',
    preview: "Most sales leaders track the wrong pipeline metric. Here's what actually predicts your quarter...",
    full: "Most sales leaders track the wrong pipeline metric. Here's what actually predicts your quarter...\n\n[Draft — click Edit to finish this post]"
  },
  {
    id: 'd2', date: 'May 16', platform: 'x', status: 'draft', style: 'Observation', topic: 'Cold outreach',
    preview: 'A cold email that opens with "I hope this finds you well" has already lost.',
    full: "A cold email that opens with \"I hope this finds you well\" has already lost.\n\n[Draft — click Edit to finish this post]"
  },
  {
    id: 'p1', date: 'May 5', platform: 'linkedin', status: 'posted', style: 'Story', topic: 'Sales leadership',
    preview: 'Why I hire for curiosity over experience every time I build an SDR team.',
    full: "Why I hire for curiosity over experience in SDR roles.\n\nI've interviewed hundreds of SDR candidates. The ones who stand out aren't the ones with the best CV.\n\nThey're the ones who ask the best questions."
  },
  {
    id: 'p2', date: 'May 2', platform: 'linkedin', status: 'posted', style: 'Insight', topic: 'Pipeline strategy',
    preview: 'The pipeline metric everyone ignores: ICP account coverage.',
    full: "The pipeline metric everyone ignores: ICP account coverage.\n\nEvery team tracks pipeline created. Almost no team tracks what percentage of their Tier 1 ICP accounts have had a meaningful conversation in the last 90 days.\n\nThat number predicts your pipeline 6–8 weeks out better than anything else."
  },
]

const STATUS_ORDER: Status[] = ['approved', 'scheduled', 'draft', 'posted']
const STATUS_LABELS: Record<Status, string> = {
  approved: '✓ Approved — ready to post',
  scheduled: 'Scheduled',
  draft: 'Drafts',
  posted: 'Posted',
}
const STATUS_PILL: Record<Status, string> = {
  approved: 'bg-green-50 text-green-700 border border-green-200',
  scheduled: 'bg-teal-50 text-teal-700 border border-teal-200',
  draft: 'bg-gray-100 text-gray-600 border border-gray-200',
  posted: 'bg-gray-100 text-gray-400 border border-gray-200',
}

export default function QueuePage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS)
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    const items = filtered.filter(p => p.status === status)
    if (items.length > 0) acc[status] = items
    return acc
  }, {} as Record<Status, Post[]>)

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleApprovePost(post: Post) {
    // Open window synchronously first to avoid popup blocker
    const url = post.platform === 'x'
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.full.substring(0, 270))}`
      : 'https://www.linkedin.com/feed/?shareActive=true'
    window.open(url, '_blank')
    navigator.clipboard?.writeText(post.full).catch(() => {})
    setCopied(post.id)
    setTimeout(() => setCopied(null), 2000)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'posted' } : p))
  }

  function startEdit(post: Post) {
    setEditing(post.id)
    setEditContent(post.full)
  }

  function saveEdit(id: string) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, full: editContent, preview: editContent.split('\n')[0] } : p))
    setEditing(null)
  }

  function addPost() {
    const newPost: Post = {
      id: `new-${Date.now()}`,
      date: 'TBD',
      platform: 'linkedin',
      status: 'draft',
      style: 'Story',
      topic: 'Sales leadership',
      preview: 'New draft — click Edit to write it.',
      full: 'New draft — click Edit to write it.',
    }
    setPosts(prev => [newPost, ...prev])
    setFilter('all')
  }

  const total = filtered.length

  return (
    <div className="min-h-screen bg-bg">
      {/* Topbar */}
      <div className="bg-white border-b border-border px-8 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="font-serif text-xl font-extrabold tracking-tight text-text">Queue</div>
          <div className="text-xs text-muted mt-0.5">{total} post{total !== 1 ? 's' : ''} {filter === 'all' ? 'total' : `in ${filter}`}</div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            {(['all', 'draft', 'scheduled', 'approved', 'posted'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-accent-light border-accent text-accent'
                    : 'bg-white border-border2 text-muted hover:border-accent hover:text-accent'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={addPost}
            className="bg-accent text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            + New post
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-16 text-muted text-sm">No posts in this filter</div>
        )}

        {STATUS_ORDER.map(status => {
          const items = grouped[status]
          if (!items) return null
          return (
            <div key={status}>
              {filter === 'all' && (
                <div className="flex items-center gap-3 mb-3 mt-2">
                  <span className="text-xs font-bold text-faint uppercase tracking-widest">{STATUS_LABELS[status]}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              {items.map(post => {
                const isExpanded = expanded.has(post.id)
                const isEditing = editing === post.id
                const isCopied = copied === post.id
                const isPosted = post.status === 'posted'

                return (
                  <div
                    key={post.id}
                    className={`bg-white border rounded-2xl overflow-hidden mb-3 shadow-sm transition-all ${
                      post.status === 'approved' ? 'border-green-200' :
                      post.status === 'posted' ? 'border-border opacity-60' :
                      'border-border hover:border-border2'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2.5 px-4 pt-4 pb-0 flex-wrap">
                      {/* Platform badge */}
                      {post.platform === 'linkedin' ? (
                        <div className="flex items-center gap-1.5 bg-[#EBF4FF] text-[#0A66C2] rounded px-2 py-1 text-xs font-bold">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.024-3.037-1.852-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-800 rounded px-2 py-1 text-xs font-bold">
                          𝕏 X/Twitter
                        </div>
                      )}
                      <span className="text-xs font-semibold text-faint uppercase tracking-wide">{post.style}</span>
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_PILL[post.status]}`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                      <span className="text-xs text-faint font-mono">{post.date}</span>
                    </div>

                    {/* Topic */}
                    <div className="px-4 pt-2">
                      <span className="text-xs font-semibold text-violet-600 bg-violet-50 rounded px-1.5 py-0.5">{post.topic}</span>
                    </div>

                    {/* Body */}
                    <div className="px-4 pt-2 pb-0">
                      {isEditing ? (
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full border border-accent rounded-xl p-3 text-sm leading-relaxed resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-accent/20 bg-white"
                          autoFocus
                        />
                      ) : (
                        <div className={`text-sm text-text leading-relaxed whitespace-pre-wrap relative ${!isExpanded ? 'max-h-[72px] overflow-hidden' : ''}`}>
                          {post.full}
                          {!isExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expand toggle */}
                    {!isEditing && (
                      <button
                        onClick={() => toggleExpand(post.id)}
                        className="px-4 py-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
                      >
                        {isExpanded ? 'Show less ↑' : 'Read more ↓'}
                      </button>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 px-4 pb-4 pt-1 border-t border-border mt-2">
                      {isPosted ? (
                        <>
                          <div className="flex-[2] py-2 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold text-center">
                            ✓ Posted · {post.date}
                          </div>
                          <button
                            onClick={() => startEdit(post)}
                            className="flex-1 py-2 rounded-lg border border-border2 text-xs font-bold text-muted hover:bg-surface transition-colors"
                          >
                            Edit
                          </button>
                        </>
                      ) : isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(post.id)}
                            className="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="flex-1 py-2 rounded-lg border border-border2 text-xs font-bold text-muted hover:bg-surface transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApprovePost(post)}
                            className="flex-[2] py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors shadow-sm"
                          >
                            {isCopied ? 'Copied! Opening...' : '✓ Approve + Post'}
                          </button>
                          <button
                            onClick={() => startEdit(post)}
                            className="flex-1 py-2 rounded-lg border border-border2 text-xs font-bold text-text hover:bg-surface transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {}}
                            className="flex-1 py-2 rounded-lg border border-accent/25 bg-accent-light text-accent text-xs font-bold hover:border-accent transition-colors"
                          >
                            ↺ Regen
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
