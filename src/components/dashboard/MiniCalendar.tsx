'use client'

import { useState } from 'react'

// Scheduled days data (will come from Supabase)
const SCHEDULED = [2, 5, 8, 9, 12, 15, 16, 19, 22, 26]
const OVERDUE = [1, 3]

export default function MiniCalendar() {
  const [offset, setOffset] = useState(0)
  const today = new Date()

  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const year = base.getFullYear()
  const month = base.getMonth()
  const isNow = today.getFullYear() === year && today.getMonth() === month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const offset_ = (firstDay + 6) % 7

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const DOWS = ['M','T','W','T','F','S','S']

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
        {Array(offset_).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const isToday = isNow && d === today.getDate()
          const isSched = isNow && SCHEDULED.includes(d) && !isToday
          const isOver = isNow && OVERDUE.includes(d) && !isToday

          return (
            <div
              key={d}
              className={[
                'aspect-square flex items-center justify-center rounded text-[11px] font-medium cursor-pointer transition-colors',
                isToday ? 'bg-accent text-white font-bold rounded-full' :
                isSched ? 'bg-teal-light text-teal font-bold hover:bg-teal/20' :
                isOver  ? 'bg-red-100 text-red-600 font-bold' :
                'hover:bg-surface'
              ].join(' ')}
            >
              {d}
            </div>
          )
        })}
      </div>

      {/* Insight bar */}
      <div className="mt-3 bg-violet-light border border-violet/15 border-l-[3px] border-l-violet rounded-lg px-3 py-2.5 text-xs text-[#4C3799] leading-relaxed">
        <strong>✦ Insight:</strong> Story hook posts are getting 3× more engagement this week — your Tuesday post is already set up for that format.
      </div>
    </div>
  )
}
