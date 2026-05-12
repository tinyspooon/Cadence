'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface QueueItem {
  id: string
  day: string
  platform: string
  preview: string
  status: string
}

function formatDay(dateStr: string): string {
  if (!dateStr) return 'TBD'
  const datePart = String(dateStr).split('T')[0]
  const [y, m, d] = datePart.split('-').map(Number)
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const postDay = new Date(y, m - 1, d)
  if (postDay.getTime() === today.getTime()) return 'Today'
  if (postDay.getTime() === tomorrow.getTime()) return 'Tomorrow'
  return postDay.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
}

export default function QueueSidebar() {
  const [items, setItems] = useState<QueueItem[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(({ posts }) => {
        if (!posts?.length) return
        const today = new Date(); today.setHours(0,0,0,0)
        const upcoming = posts
          .filter((p: Record<string, unknown>) => {
            if (p.status === 'posted') return false
            const dateStr = p.scheduled_for as string
            if (!dateStr) return false
            const [y, m, d] = String(dateStr).split('T')[0].split('-').map(Number)
            return new Date(y, m - 1, d) >= today
          })
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const aStr = String(a.scheduled_for || '').split('T')[0]
            const bStr = String(b.scheduled_for || '').split('T')[0]
            return aStr.localeCompare(bStr)
          })
          .slice(0, 5)
          .map((p: Record<string, unknown>) => ({
            id: p.id as string,
            day: formatDay(p.scheduled_for as string),
            platform: (p.platform as string) || 'linkedin',
            preview: ((p.content as string) || '').split('\n')[0].substring(0, 60) + '…',
            status: p.status as string,
          }))
        setItems(upcoming)
      })
      .catch(() => {})
  }, [])

  if (items.length === 0) {
    return (
      <div className="bg-white border border-border rounded-xl px-3 py-4 text-center shadow-sm">
        <div className="text-xs text-muted">No posts scheduled</div>
        <div className="text-xs text-faint mt-0.5">Go to Calendar → Generate week</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} onClick={() => router.push('/dashboard/queue')}
          className="bg-white border border-border rounded-xl px-3 py-2.5 cursor-pointer hover:border-border2 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted uppercase tracking-[0.5px]">{item.day}</span>
            <span className={`text-[11px] font-bold ${item.platform === 'x' ? 'text-black' : 'text-[#0A66C2]'}`}>
              {item.platform === 'x' ? '𝕏' : 'in'}
            </span>
          </div>
          <div className="text-[13px] text-text mt-1 truncate">{item.preview}</div>
        </div>
      ))}
    </div>
  )
}
