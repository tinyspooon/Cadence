'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { title: 'Approve your first post', desc: 'Hit approve on today\'s post above' },
  { title: 'Connect LinkedIn', desc: 'Publish directly without copy-pasting' },
  { title: 'Review your voice settings', desc: 'Make sure Cadence sounds like you' },
  { title: 'Rate 3 past posts', desc: 'Helps Cadence learn what works for you' },
  { title: 'Invite a teammate', desc: 'Unlock the team leaderboard' },
]

export default function SetupChecklist() {
  const [checked, setChecked] = useState<boolean[]>(Array(ITEMS.length).fill(false))

  const done = checked.filter(Boolean).length
  const pct = (done / ITEMS.length) * 100

  return (
    <div>
      <div className="text-[10px] font-bold text-faint uppercase tracking-[1.5px] mb-3">
        Setup checklist
      </div>
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-accent-light to-violet-light border-b border-border">
          <span className="text-xs font-bold text-text">Get the most out of Cadence</span>
          <span className="text-xs font-bold text-accent font-mono">{done} / {ITEMS.length}</span>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] bg-border">
          <div
            className="h-full bg-gradient-to-r from-accent to-violet transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => setChecked(prev => prev.map((v, j) => j === i ? !v : v))}
            className={cn(
              'flex items-center gap-2.5 px-3.5 py-2.5 w-full text-left transition-colors',
              'border-b border-border last:border-b-0',
              checked[i] ? 'opacity-50' : 'hover:bg-bg'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
              checked[i] ? 'bg-green-500 border-green-500' : 'border-border2'
            )}>
              {checked[i] && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn('text-xs font-semibold text-text', checked[i] && 'line-through text-muted')}>
                {item.title}
              </div>
              <div className="text-[11px] text-faint mt-0.5">{item.desc}</div>
            </div>
            {!checked[i] && (
              <span className="text-[11px] font-bold text-accent bg-accent-light rounded px-1.5 py-0.5 flex-shrink-0">
                →
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
