'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/dashboard/PageHeader'

type Platform = 'linkedin' | 'x'
type Filter = 'all' | 'linkedin' | 'x' | 'approved' | 'overdue'

interface CalPost {
  id?: string
  platform: Platform
  style: string
  preview: string
  full: string
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DOWS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function CalendarPage() {
  const [offset, setOffset]         = useState(0)
  const [filter, setFilter]         = useState<Filter>('all')
  const [calData, setCalData]       = useState<Record<number, CalPost>>({})
  const [approved, setApproved]     = useState<Set<number>>(new Set())
  const [loading, setLoading]       = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genToast, setGenToast]     = useState<string | null>(null)
  const [regenning, setRegenning]   = useState(false)
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
        // Parse date string directly to avoid UTC→local timezone shift
        // new Date('2026-05-18') in UTC-5 becomes May 17 locally — wrong
        const datePart = String(dateStr).split('T')[0]
        const [y, m, d] = datePart.split('-').map(Number)
        if (y !== year || m !== month + 1) return
        newCalData[d] = {
          id: post.id as string,
          platform: (post.platform as Platform) || 'linkedin',
          style: (post.style as string) || 'Story',
          preview: ((post.content as string) || '').split('\n')[0].substring(0, 80),
          full: (post.content as string) || '',
        }
        if (post.status === 'approved') {
          newApproved.add(d)
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

  async function handleRegen() {
    if (!modal || !modalPost?.id) return
    setRegenning(true)
    try {
      const res = await fetch('/api/regen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: modalPost.id }),
      })
      const data = await res.json()
      if (data.content) {
        setCalData(prev => ({
          ...prev,
          [modal]: {
            ...prev[modal],
            full: data.content,
            preview: data.content.split('\n')[0].substring(0, 80),
          }
        }))
      }
    } catch (e) { console.warn('Regen failed:', e) }
    finally { setRegenning(false) }
  }

  const modalPost     = modal ? calData[modal] : null
  const modalApproved = modal ? approved.has(modal) : false

  function isOverdue(d: number) {
    // A day is overdue if it's in the past and had a scheduled post that wasn't posted
    const today = new Date(); today.setHours(0,0,0,0)
    const checkDate = new Date(year, month, d)
    return isNow && checkDate < today && !!calData[d]
  }

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
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm leading-[1.8] text-text">
                      <div className="space-y-3">
                        {modalPost.full.split('\n').map((line: string, i: number) => (
                          line.trim() === '' ? null : <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
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
                  <div className="text-sm leading-[1.8] text-text">
                    <div className="space-y-3">
                      {modalPost.full.split('\n').map((line: string, i: number) => (
                        line.trim() === '' ? null : <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
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
                    <button
                      onClick={handleRegen}
                      disabled={regenning}
                      className="flex-1 py-2.5 rounded-xl border border-accent/30 bg-accent-light text-accent text-sm font-bold hover:border-accent transition-colors disabled:opacity-50">
                      {regenning ? '...' : '↺ Regen'}
                    </button>
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
