'use client'

import { useState, useEffect } from 'react'

type Platform = 'linkedin' | 'x'
type Filter = 'all' | 'linkedin' | 'x' | 'approved' | 'overdue'

interface CalPost {
  platform: Platform
  style: string
  preview: string
  full: string
}

const INITIAL_CAL_DATA: Record<number, CalPost> = {
  2:  { platform: 'linkedin', style: 'Story',       preview: 'Why I hire for curiosity over experience in SDR roles',        full: "Why I hire for curiosity over experience in SDR roles.\n\nI've interviewed hundreds of SDR candidates. The ones who stand out aren't the ones with the best CV.\n\nThey're the ones who ask the best questions.\n\n\"How does your team decide which accounts to prioritise?\" \"What does a great first call look like here?\"\n\nCuriosity is a multiplier. Experience is a starting point. You can teach process. You can't teach hunger." },
  5:  { platform: 'linkedin', style: 'Insight',     preview: 'The pipeline metric everyone ignores',                         full: "The pipeline metric everyone ignores: ICP account coverage.\n\nEvery team tracks pipeline created. Almost no team tracks what percentage of their Tier 1 ICP accounts have had a meaningful conversation in the last 90 days.\n\nThat number predicts your pipeline 6–8 weeks out better than anything else.\n\nIf it drops below 40%, you're about to have a bad quarter. Every time." },
  8:  { platform: 'x',        style: 'Observation', preview: 'SDR metrics that actually matter vs ones that sound good',     full: "SDR metrics that actually matter vs ones that sound good.\n\nMatters: Pipeline created, SAO rate, avg deal size sourced.\nSounds good: Dials, emails sent, activities logged.\n\nYour CRO doesn't care how busy your team looks." },
  9:  { platform: 'linkedin', style: 'Story',       preview: 'What 3 months of multi-threading taught me about patience',   full: "What 3 months of multi-threading taught me about patience.\n\nWe touched 6 stakeholders before the deal closed. Some took 8 follow-ups. One ghosted for 3 weeks and came back with budget.\n\nThe rep who wanted to \"just move on\" after week 4 — he's glad he didn't.\n\nMulti-threading isn't a tactic. It's a test of whether you believe in the account enough to keep showing up." },
  12: { platform: 'x',        style: 'Observation', preview: 'Hot take: SDR to AE handoff is where most deals die',         full: "Hot take: the SDR to AE handoff is where most deals die.\n\nNot bad prospecting. Not bad demos. The handoff.\n\nFix your internal communication before blaming the market." },
  15: { platform: 'linkedin', style: 'Story',       preview: 'The rep who asked the wrong questions — and learned from it', full: "The rep who asked the wrong questions — and learned from it.\n\nEarly in his tenure, one of my SDRs was asking discovery questions that sounded great on paper but went nowhere.\n\n\"What are your biggest challenges?\" Dead end.\n\nWe swapped to: \"What did you try last time this came up?\" Game changer.\n\nThe best discovery questions don't ask people to diagnose themselves. They ask them to tell stories." },
  16: { platform: 'linkedin', style: 'Insight',     preview: 'Contrarian take on activity-based selling',                  full: "Contrarian take: activity-based selling is making your team worse.\n\nWhen reps hit their call targets, they stop thinking. When they hit their email quotas, they stop personalising.\n\nThe goal was never 80 dials. The goal was 3 great conversations.\n\nOptimise for quality of interaction, not volume of activity. Your pipeline will look different in 60 days." },
  19: { platform: 'linkedin', style: 'Story',       preview: 'How we rebuilt our ICP from scratch in Q1',                  full: "How we rebuilt our ICP from scratch in Q1 — and what happened next.\n\nWe had a wide ICP. \"Any company with a sales team.\" That's not an ICP, that's a prayer.\n\nTurns out: independent distributors with 15–80 employees were closing at 3× the rate of everyone else.\n\nWe went narrow. SAO rate went from 28% to 47% in one quarter." },
  22: { platform: 'x',        style: 'Observation', preview: 'What separates a 50% SAO rate from a 30% one',               full: "What separates a 50% SAO rate from a 30% one?\n\nNot talent. Not territory. Not tools.\n\nIt's whether the rep actually researched the account before reaching out.\n\nEvery time." },
  26: { platform: 'linkedin', style: 'Insight',     preview: 'The question I ask every SDR in their 1:1',                  full: "The one question I ask every SDR in their 1:1.\n\n\"What's one account you've written off that you shouldn't have?\"\n\nIt forces them to revisit assumptions. It uncovers deals abandoned too early. And it tells me immediately whether they're thinking like a hunter or just managing a list.\n\nThe best reps always have an answer. The reps who are coasting never do." },
}

const OVERDUE_DAYS = [1, 3]
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DOWS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function CalendarPage() {
  const [offset, setOffset]         = useState(0)
  const [filter, setFilter]         = useState<Filter>('all')
  const [calData, setCalData]       = useState(INITIAL_CAL_DATA)
  const [approved, setApproved]     = useState<Set<number>>(new Set())
  const [loading, setLoading]       = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genToast, setGenToast]     = useState<string | null>(null)
  const [modal, setModal]           = useState<number | null>(null)
  const [editMode, setEditMode]     = useState(false)
  const [editContent, setEdit]      = useState('')
  const [copied, setCopied]         = useState(false)
  const [dragDay, setDragDay]       = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)
  const [toast, setToast]           = useState<string | null>(null)

  const today   = new Date()
  const base    = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const year    = base.getFullYear()
  const month   = base.getMonth()
  const isNow   = today.getFullYear() === year && today.getMonth() === month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7

  // Load posts from DB on mount and when month changes
  useEffect(() => {
    loadPostsFromDB()
  }, [offset])

  async function loadPostsFromDB() {
    setLoading(true)
    try {
      const res = await fetch('/api/posts')
      const { posts } = await res.json()
      if (!posts?.length) { setLoading(false); return }

      const today = new Date()
      const base = new Date(today.getFullYear(), today.getMonth() + offset, 1)
      const year = base.getFullYear()
      const month = base.getMonth()

      const newCalData: Record<number, CalPost> = {}
      const newApproved = new Set<number>()

      posts.forEach((post: Record<string, unknown>) => {
        if (!post.scheduled_for && post.status !== 'posted') return
        const dateStr = (post.scheduled_for || post.posted_at) as string
        if (!dateStr) return
        const postDate = new Date(dateStr)
        if (postDate.getFullYear() !== year || postDate.getMonth() !== month) return
        const day = postDate.getDate()
        newCalData[day] = {
          platform: (post.platform as Platform) || 'linkedin',
          style: (post.style as string) || 'Story',
          preview: ((post.content as string) || '').split('\n')[0].substring(0, 80),
          full: (post.content as string) || '',
        }
        if (post.status === 'approved') {
          newApproved.add(day)
        }
      })

      if (Object.keys(newCalData).length > 0) {
        setCalData(newCalData)
        setApproved(newApproved)
      }
    } catch (e) {
      console.warn('Failed to load posts:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateWeek() {
    setGenerating(true)
    setGenToast('Generating your week...')
    try {
      const res = await fetch('/api/generate-week', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        setGenToast('Error: ' + data.error)
      } else {
        setGenToast(`✓ Generated ${data.generated} posts`)
        await loadPostsFromDB()
      }
    } catch (e) {
      setGenToast('Generation failed — try again')
    } finally {
      setGenerating(false)
      setTimeout(() => setGenToast(null), 4000)
    }
  }

  const modalPost     = modal ? calData[modal] : null
  const modalApproved = modal ? approved.has(modal) : false

  function isOverdue(d: number) { return isNow && OVERDUE_DAYS.includes(d) }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function openModal(d: number) { setModal(d); setEditMode(false); setCopied(false) }
  function closeModal()          { setModal(null); setEditMode(false) }

  function handleApprovePost() {
    if (!modal || !modalPost) return
    // Open window synchronously first to avoid popup blocker
    const url = modalPost.platform === 'x'
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(modalPost.full.substring(0, 270))}`
      : 'https://www.linkedin.com/feed/?shareActive=true'
    window.open(url, '_blank')
    setApproved(prev => new Set(prev).add(modal))
    navigator.clipboard?.writeText(modalPost.full).catch(() => {})
    setCopied(true)
    showToast(modalPost.platform === 'x' ? '𝕏 Opening X — text pre-filled' : '💼 Opening LinkedIn — paste and click Post')
  }

  function handleCopy() {
    if (!modalPost) return
    navigator.clipboard?.writeText(modalPost.full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSaveEdit() {
    if (!modal) return
    setCalData(prev => ({ ...prev, [modal]: { ...prev[modal], full: editContent } }))
    setEditMode(false)
  }

  function onDragStart(e: React.DragEvent, d: number) {
    setDragDay(d)
    e.dataTransfer.effectAllowed = 'move'
  }
  function onDragOver(e: React.DragEvent, d: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(d)
  }
  function onDragLeave()  { setDropTarget(null) }
  function onDragEnd()    { setDragDay(null); setDropTarget(null) }
  function onDrop(e: React.DragEvent, toDay: number) {
    e.preventDefault()
    setDropTarget(null)
    if (!dragDay || dragDay === toDay) { setDragDay(null); return }
    const moving = calData[dragDay]
    if (!moving) { setDragDay(null); return }
    const next = { ...calData, [toDay]: moving }
    delete next[dragDay]
    setCalData(next)
    if (approved.has(dragDay)) {
      setApproved(prev => { const s = new Set(prev); s.delete(dragDay!); s.add(toDay); return s })
    }
    setDragDay(null)
    showToast(`Post moved to ${MONTHS[month]} ${toDay}`)
  }

  function isFiltered(d: number): boolean {
    const data = isNow ? calData[d] : null
    const over  = isOverdue(d)
    if (filter === 'all')      return false
    if (filter === 'overdue')  return !over
    if (filter === 'approved') return !(approved.has(d) && !!data)
    if (filter === 'linkedin') return data?.platform !== 'linkedin'
    if (filter === 'x')        return data?.platform !== 'x'
    return false
  }

  return (
    <div className="min-h-screen bg-bg">

      {/* Topbar */}
      <div className="bg-white border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-10 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-serif text-xl font-extrabold tracking-tight text-text leading-tight">{MONTHS[month]} {year}</h1>
            <p className="text-xs text-muted">Click a post to open · Drag to reschedule</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setOffset(o => o - 1)} className="w-7 h-7 rounded-lg border border-border bg-white text-muted flex items-center justify-center hover:border-accent hover:text-accent transition-colors text-base">‹</button>
            <button onClick={() => setOffset(o => o + 1)} className="w-7 h-7 rounded-lg border border-border bg-white text-muted flex items-center justify-center hover:border-accent hover:text-accent transition-colors text-base">›</button>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleGenerateWeek}
            disabled={generating}
            className="bg-accent text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
          >
            {generating ? (
              <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</>
            ) : '✦ Generate week'}
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all','linkedin','x','approved','overdue'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                filter === f ? 'bg-accent-light border-accent text-accent' : 'bg-white border-border2 text-muted hover:border-accent hover:text-accent'
              }`}>
              {f === 'x' ? 'X/Twitter' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4 bg-[#FAF8F6] min-h-full">
        {/* DOW row */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DOWS.map((d, i) => (
            <div key={d} className={`text-center text-xs font-semibold uppercase tracking-wider py-2 ${i >= 5 ? 'text-[#C4BDB6]' : 'text-[#9B9590]'}`}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array(startOffset).fill(null).map((_, i) => <div key={`e${i}`} className="min-h-[90px]" />)}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const data       = isNow ? calData[d] : null
            const isToday    = isNow && d === today.getDate()
            const over       = isOverdue(d) && !isToday
            const isAp       = approved.has(d)
            const filt       = isFiltered(d)
            const dragging   = dragDay === d
            const isTarget   = dropTarget === d && dragDay !== null && dragDay !== d
            const dow        = new Date(year, month, d).getDay()
            const isWeekend  = dow === 0 || dow === 6

            return (
              <div
                key={d}
                draggable={!!data}
                onDragStart={e => onDragStart(e, d)}
                onDragOver={e => onDragOver(e, d)}
                onDragLeave={onDragLeave}
                onDragEnd={onDragEnd}
                onDrop={e => onDrop(e, d)}
                onClick={() => { if (data || over) openModal(d) }}
                className={[
                  'min-h-[90px] rounded-xl border p-2 flex flex-col transition-all duration-150 select-none relative overflow-hidden',
                  isTarget   ? 'border-accent border-2 bg-[#FFF8F6] shadow-md' :
                  isToday    ? 'border-[#FF6B3D] border-2 bg-white shadow-sm' :
                  over       ? 'bg-[#FFF5F5] border-red-200 cursor-pointer' :
                  data       ? 'bg-white border-[#ECE7E2] cursor-pointer hover:shadow-md hover:border-[#D0C8C0] hover:translate-y-[-1px]' :
                  isWeekend  ? 'bg-[#FAF8F6] border-[#ECE7E2]' :
                               'bg-white border-[#ECE7E2]',
                  dragging   ? 'opacity-25 scale-95 cursor-grabbing' : '',
                  filt       ? 'opacity-10 pointer-events-none' : '',
                ].filter(Boolean).join(' ')}
              >
                {/* Day number */}
                <div className={`text-xs font-bold mb-1 flex items-center justify-between ${
                  isToday ? 'text-[#FF6B3D]' : isWeekend ? 'text-[#C4BDB6]' : 'text-[#6B6560]'
                }`}>
                  <span>{d}</span>
                  {isToday && <span className="w-1.5 h-1.5 bg-[#FF6B3D] rounded-full flex-shrink-0" />}
                </div>

                {/* Post chip */}
                {data ? (
                  <div className="flex flex-col flex-1 min-h-0 gap-1">
                    {/* Platform pill */}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isAp             ? 'bg-green-200 text-green-800' :
                        data.platform === 'x' ? 'bg-zinc-700 text-white' :
                                              'bg-blue-200 text-blue-800'
                      }`}>
                        {isAp ? '✓ Done' : data.platform === 'x' ? '𝕏' : 'in'}
                      </span>
                      <span className={`text-[9px] font-semibold ${data.platform === 'x' && !isAp ? 'text-zinc-400' : 'text-muted'}`}>{data.style}</span>
                    </div>
                    <p className={`text-[11px] leading-snug line-clamp-3 font-medium ${data.platform === 'x' && !isAp ? 'text-zinc-300' : 'text-text/80'}`}>{data.preview}</p>
                  </div>
                ) : over ? (
                  <div className="text-[10px] font-bold text-red-500 bg-red-100 rounded px-1.5 py-0.5 w-fit">⚠ Missed</div>
                ) : null}

                {/* Drop target indicator */}
                {isTarget && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-accent text-xs font-bold bg-white/80 rounded px-2 py-1">Drop here</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(20,16,12,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '90vh', animation: 'fadeUp 0.18s ease' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{MONTHS[month]} {modal}</span>
                {modalPost && (
                  <>
                    {modalPost.platform === 'linkedin'
                      ? <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded">LinkedIn</span>
                      : <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">𝕏 X/Twitter</span>}
                    <span className="text-xs font-semibold text-faint uppercase tracking-wide">{modalPost.style}</span>
                  </>
                )}
                {isOverdue(modal) && !modalPost && (
                  <span className="bg-red-100 text-red-500 text-xs font-bold px-2 py-0.5 rounded">Missed</span>
                )}
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:bg-border transition-colors">✕</button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {modalPost ? (
                modalApproved && !editMode ? (
                  <div>
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">✅</div>
                      <div className="font-serif text-xl font-extrabold text-green-700">Post approved!</div>
                      <div className="text-xs text-green-600 mt-1">Text copied — paste into the platform and click Post</div>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm leading-[1.8] whitespace-pre-wrap text-text">{modalPost.full}</div>
                  </div>
                ) : editMode ? (
                  <textarea
                    value={editContent}
                    onChange={e => setEdit(e.target.value)}
                    className="w-full rounded-xl p-4 text-sm leading-[1.8] resize-y min-h-[200px] focus:outline-none"
                    style={{ border: '1.5px solid #FF5C35', boxShadow: '0 0 0 3px rgba(255,92,53,0.12)' }}
                    autoFocus
                  />
                ) : (
                  <p className="text-sm leading-[1.8] whitespace-pre-wrap text-text">{modalPost.full}</p>
                )
              ) : isOverdue(modal) ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">⚠️</div>
                  <p className="text-sm text-muted">This post was missed. Regenerate it to get back on track.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted">No post scheduled for this day. Add one from your queue.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {modalPost && (
              <div className="flex gap-2 px-5 py-4 border-t border-border flex-shrink-0 bg-bg/60">
                {editMode ? (
                  <>
                    <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors">Save changes</button>
                    <button onClick={() => setEditMode(false)} className="flex-1 py-2.5 rounded-xl border border-border2 text-sm font-bold text-muted hover:bg-surface transition-colors">Cancel</button>
                  </>
                ) : modalApproved ? (
                  <>
                    <button onClick={handleCopy} className="flex-[2] py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors">
                      {copied ? 'Copied! ✓' : 'Copy to clipboard'}
                    </button>
                    <button onClick={() => { setEditMode(true); setEdit(modalPost.full) }} className="flex-1 py-2.5 rounded-xl border border-border2 text-sm font-bold text-muted hover:bg-surface transition-colors">Edit</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleApprovePost} className="flex-[2] py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors shadow-sm">
                      ✓ Approve + Post
                    </button>
                    <button onClick={() => { setEditMode(true); setEdit(modalPost.full) }} className="flex-1 py-2.5 rounded-xl border border-border2 text-sm font-bold text-text hover:bg-surface transition-colors">Edit</button>
                    <button className="flex-1 py-2.5 rounded-xl border border-accent/30 bg-accent-light text-accent text-sm font-bold hover:border-accent transition-colors">↺ Regen</button>
                    <button onClick={handleCopy} className="flex-1 py-2.5 rounded-xl border border-border2 text-sm font-bold text-muted hover:bg-surface transition-colors">
                      {copied ? '✓' : 'Copy'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gen toast */}
      {genToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-text text-white rounded-xl px-4 py-3 text-sm font-semibold shadow-xl z-[60]">
          {genToast}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text text-white rounded-xl px-4 py-3 text-sm font-semibold shadow-xl z-[60] flex items-center gap-3" style={{ animation: 'fadeUp 0.2s ease' }}>
          {toast}
          <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100 text-xs leading-none">✕</button>
        </div>
      )}
    </div>
  )
}
