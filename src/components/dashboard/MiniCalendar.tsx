'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DOWS = ['M','T','W','T','F','S','S']

export default function MiniCalendar() {
  const [offset, setOffset] = useState(0)
  const [scheduledDays, setScheduledDays] = useState<Set<number>>(new Set())
  const [approvedDays, setApprovedDays] = useState<Set<number>>(new Set())
  const router = useRouter()
  const today = new Date()

  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const year = base.getFullYear()
  const month = base.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = (firstDay + 6) % 7

  useEffect(() => {
    loadPosts()
  }, [offset])

  async function loadPosts() {
    try {
      const res = await fetch('/api/posts')
      const { posts } = await res.json()
      if (!posts?.length) return

      const scheduled = new Set<number>()
      const approved = new Set<number>()

      posts.forEach((post: Record<string, unknown>) => {
        const dateStr = (post.scheduled_for || post.posted_at) as string
        if (!dateStr) return
        const datePart = String(dateStr).split('T')[0]
        const [y, m, d] = datePart.split('-').map(Number)
        if (y !== year || m !== month + 1) return
        scheduled.add(d)
        if (post.status === 'approved' || post.status === 'posted') {
          approved.add(d)
        }
      })

      setScheduledDays(scheduled)
      setApprovedDays(approved)
    } catch (e) {
      console.warn('Failed to load posts for mini calendar:', e)
    }
  }

  return (
    <div>
      <div className="text-[10px] font-bold text-faint uppercase tracking-[1.5px] mb-3">Calendar</div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setOffset(o => o - 1)} className="w-6 h-6 rounded border border-border bg-white text-muted text-sm hover:border-accent hover:text-accent transition-colors flex items-center justify-center">‹</button>
        <span className="text-[13px] font-bold">{MONTHS[month]} {year}</span>
        <button onClick={() => setOffset(o => o + 1)} className="w-6 h-6 rounded border border-border bg-white text-muted text-sm hover:border-accent hover:text-accent transition-colors flex items-center justify-center">›</button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {DOWS.map((d, i) => (
          <div key={i} className="text-[10px] font-semibold text-faint text-center py-1">{d}</div>
        ))}
        {Array(startOffset).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const isToday   = today.getFullYear() === year && today.getMonth() === month && d === today.getDate()
          const isSched   = scheduledDays.has(d) && !isToday
          const isApproved = approvedDays.has(d) && !isToday

          return (
            <div
              key={d}
              onClick={() => router.push('/dashboard/calendar')}
              className={[
                'aspect-square flex items-center justify-center rounded text-[11px] font-medium transition-colors cursor-pointer',
                isToday    ? 'bg-accent text-white font-bold rounded-full' :
                isApproved ? 'bg-green-100 text-green-700 font-bold hover:bg-green-200' :
                isSched    ? 'bg-blue-50 text-blue-600 font-bold hover:bg-blue-100' :
                             'hover:bg-surface',
              ].join(' ')}
            >
              {d}
            </div>
          )
        })}
      </div>

      <div className="mt-3 bg-violet-light border border-violet/15 border-l-[3px] border-l-violet rounded-lg px-3 py-2.5 text-xs text-[#4C3799] leading-relaxed">
        <strong>✦ Insight:</strong> Story hook posts are getting 3× more engagement this week — your Tuesday post is already set up for that format.
      </div>
    </div>
  )
}
