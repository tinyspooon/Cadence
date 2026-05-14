'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/dashboard/PageHeader'

type Platform = 'linkedin' | 'x'
type Status = 'draft' | 'scheduled' | 'approved' | 'posted'

interface Post {
  id: string
  date: string
  dateSort: number
  platform: Platform
  status: Status
  style: string
  topic: string
  preview: string
  full: string
}

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

function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBD'
  const datePart = String(dateStr).split('T')[0]
  const [y, m, d] = datePart.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const postDay = new Date(y, m - 1, d)
  if (postDay.getTime() === today.getTime()) return 'Today'
  if (postDay.getTime() === tomorrow.getTime()) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function dateSortKey(dateStr: string): number {
  if (!dateStr) return 999
  const datePart = String(dateStr).split('T')[0]
  const [y, m, d] = datePart.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export default function QueuePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [regenning, setRegenning] = useState<string | null>(null)

  useEffect(() => { loadPosts() }, [])

  async function handleRegen(post: Post) {
    setRegenning(post.id)
    try {
      const res = await fetch('/api/regen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })
      const data = await res.json()
      if (data.content) {
        setPosts(prev => prev.map(p => p.id === post.id ? {
          ...p,
          full: data.content,
          preview: data.content.split('\n')[0].substring(0, 100),
        } : p))
      }
    } catch (e) { console.warn('Regen failed:', e) }
    finally { setRegenning(null) }
  }

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await fetch('/api/posts')
      const { posts: dbPosts } = await res.json()
      if (!dbPosts?.length) { setLoading(false); return }

      const mapped: Post[] = dbPosts.map((p: Record<string, unknown>) => {
        const dateStr = (p.scheduled_for || p.posted_at || '') as string
        return {
          id: p.id as string,
          date: formatDate(dateStr),
          dateSort: dateSortKey(dateStr),
          platform: (p.platform as Platform) || 'linkedin',
          status: (p.status as Status) || 'draft',
          style: (p.style as string) || 'Story',
          topic: (p.topic as string) || 'Sales leadership',
          preview: ((p.content as string) || '').split('\n')[0].substring(0, 100),
          full: (p.content as string) || '',
        }
      })
      setPosts(mapped)
    } catch (e) {
      console.warn('Failed to load posts:', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)
  const grouped = STATUS_ORDER.reduce((acc, status) => {
    const items = filtered.filter(p => p.status === status)
      .sort((a, b) => a.dateSort - b.dateSort)
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

  async function handleApprovePost(post: Post) {
    const url = post.platform === 'x'
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.full.substring(0, 270))}`
      : 'https://www.linkedin.com/feed/?shareActive=true'
    window.open(url, '_blank')
    navigator.clipboard?.writeText(post.full).catch(() => {})
    setCopied(post.id)
    setTimeout(() => setCopied(null), 2000)

    // Update status in DB
    try {
      await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, status: 'posted' }),
      })
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'posted' } : p))
    } catch (e) { console.warn('Failed to update post status:', e) }
  }

  async function handleSaveEdit(id: string) {
    try {
      await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content: editContent }),
      })
      setPosts(prev => prev.map(p => p.id === id ? {
        ...p, full: editContent,
        preview: editContent.split('\n')[0].substring(0, 100)
      } : p))
    } catch (e) { console.warn('Failed to save edit:', e) }
    setEditing(null)
  }

  async function addPost() {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'New draft — click Edit to write it.',
          platform: 'linkedin', style: 'Story',
          topic: 'Sales leadership', status: 'draft',
        }),
      })
      const { post } = await res.json()
      if (post) {
        setPosts(prev => [{
          id: post.id, date: 'TBD', dateSort: 999,
          platform: 'linkedin', status: 'draft',
          style: 'Story', topic: 'Sales leadership',
          preview: 'New draft — click Edit to write it.',
          full: 'New draft — click Edit to write it.',
        }, ...prev])
      }
    } catch (e) { console.warn('Failed to add post:', e) }
  }

  const total = filtered.length

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader
        title="Queue"
        subtitle={`${total} post${total !== 1 ? 's' : ''} ${filter === 'all' ? 'total' : `in ${filter}`}`}
        action={
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              {(['all', 'draft', 'scheduled', 'approved', 'posted'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    filter === f ? 'bg-accent-light border-accent text-accent' : 'bg-white border-border2 text-muted hover:border-accent hover:text-accent'
                  }`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={addPost} className="bg-accent text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              + New post
            </button>
          </div>
        }
      />

      <div className="max-w-2xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-center py-16 text-muted text-sm">Loading posts...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-muted text-sm font-semibold mb-1">No posts yet</div>
            <div className="text-faint text-xs">Go to Calendar and hit Generate week to fill your queue</div>
          </div>
        ) : (
          STATUS_ORDER.map(status => {
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
                    <div key={post.id} className={`bg-white border rounded-2xl overflow-hidden mb-3 shadow-sm transition-all ${
                      post.status === 'approved' ? 'border-green-200' :
                      post.status === 'posted' ? 'border-border opacity-60' :
                      'border-border hover:border-border2'
                    }`}>
                      {/* Header */}
                      <div className="flex items-center gap-2.5 px-4 pt-4 pb-0 flex-wrap">
                        {post.platform === 'linkedin' ? (
                          <div className="flex items-center gap-1.5 bg-[#EBF4FF] text-[#0A66C2] rounded px-2 py-1 text-xs font-bold">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.024-3.037-1.852-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-gray-100 text-gray-800 rounded px-2 py-1 text-xs font-bold">𝕏 X/Twitter</div>
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
                          <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                            className="w-full border border-accent rounded-xl p-3 text-sm leading-relaxed resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-accent/20 bg-white"
                            autoFocus />
                        ) : (
                          <div className={`text-sm text-text leading-relaxed relative ${!isExpanded ? 'max-h-[72px] overflow-hidden' : ''}`}>
                            <div className="space-y-2.5">
                              {post.full.split('\n').map((line: string, i: number) => (
                                line.trim() === '' ? null : <p key={i}>{line}</p>
                              ))}
                            </div>
                            {!isExpanded && (
                              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                            )}
                          </div>
                        )}
                      </div>

                      {!isEditing && (
                        <button onClick={() => toggleExpand(post.id)} className="px-4 py-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors">
                          {isExpanded ? 'Show less ↑' : 'Read more ↓'}
                        </button>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 px-4 pb-4 pt-1 border-t border-border mt-2">
                        {isPosted ? (
                          <>
                            <div className="flex-[2] py-2 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold text-center">✓ Posted · {post.date}</div>
                            <button onClick={() => { setEditing(post.id); setEditContent(post.full) }}
                              className="flex-1 py-2 rounded-lg border border-border2 text-xs font-bold text-muted hover:bg-surface transition-colors">Edit</button>
                          </>
                        ) : isEditing ? (
                          <>
                            <button onClick={() => handleSaveEdit(post.id)} className="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors">Save</button>
                            <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-lg border border-border2 text-xs font-bold text-muted hover:bg-surface transition-colors">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleApprovePost(post)}
                              className="flex-[2] py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors shadow-sm">
                              {isCopied ? 'Opening...' : '✓ Approve + Post'}
                            </button>
                            <button onClick={() => { setEditing(post.id); setEditContent(post.full) }}
                              className="flex-1 py-2 rounded-lg border border-border2 text-xs font-bold text-text hover:bg-surface transition-colors">Edit</button>
                            <button
                              onClick={() => handleRegen(post)}
                              disabled={regenning === post.id}
                              className="flex-1 py-2 rounded-lg border border-accent/25 bg-accent-light text-accent text-xs font-bold hover:border-accent transition-colors disabled:opacity-50">
                              {regenning === post.id ? '...' : '↺ Regen'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
