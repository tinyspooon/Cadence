'use client'

import { useState, useEffect } from 'react'

interface Stats {
  postsThisMonth: number
  postsLastMonth: number
  queueReady: number
  nextPostDate: string
  streak: number
  consistency: number
}

export default function StatsGrid() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(({ posts }) => {
        if (!posts?.length) return

        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

        let postsThisMonth = 0
        let postsLastMonth = 0
        let queueReady = 0
        let nextPostDate = ''
        const postedDays = new Set<string>()

        const today = new Date(); today.setHours(0,0,0,0)

        posts.forEach((p: Record<string, unknown>) => {
          const dateStr = (p.scheduled_for || p.posted_at) as string
          if (!dateStr) return
          const [y, m, d] = String(dateStr).split('T')[0].split('-').map(Number)
          const postDate = new Date(y, m - 1, d)

          if (p.status === 'posted') {
            postedDays.add(`${y}-${m}-${d}`)
            if (m - 1 === thisMonth && y === thisYear) postsThisMonth++
            if (m - 1 === lastMonth && y === lastMonthYear) postsLastMonth++
          }

          if ((p.status === 'scheduled' || p.status === 'approved') && postDate >= today) {
            queueReady++
            if (!nextPostDate || String(dateStr).split('T')[0] < nextPostDate) {
              nextPostDate = String(dateStr).split('T')[0]
            }
          }
        })

        // Calculate streak
        let streak = 0
        for (let i = 0; i < 60; i++) {
          const check = new Date(today)
          check.setDate(today.getDate() - i)
          const key = `${check.getFullYear()}-${check.getMonth() + 1}-${check.getDate()}`
          if (postedDays.has(key)) streak++
          else if (i > 0) break
        }

        // Consistency = % of scheduled days actually posted this month
        const scheduledThisMonth = posts.filter((p: Record<string, unknown>) => {
          const dateStr = p.scheduled_for as string
          if (!dateStr) return false
          const [y, m] = String(dateStr).split('T')[0].split('-').map(Number)
          return m - 1 === thisMonth && y === thisYear
        }).length

        const consistency = scheduledThisMonth > 0
          ? Math.round((postsThisMonth / scheduledThisMonth) * 100)
          : 0

        // Format next post date
        let nextLabel = 'None scheduled'
        if (nextPostDate) {
          const [y, m, d] = nextPostDate.split('-').map(Number)
          const next = new Date(y, m - 1, d)
          const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
          if (next.getTime() === today.getTime()) nextLabel = 'Today'
          else if (next.getTime() === tomorrow.getTime()) nextLabel = 'Tomorrow'
          else nextLabel = next.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        }

        setStats({
          postsThisMonth,
          postsLastMonth,
          queueReady,
          nextPostDate: nextLabel,
          streak,
          consistency,
        })
      })
      .catch(() => {})
  }, [])

  const diff = stats ? stats.postsThisMonth - stats.postsLastMonth : 0
  const diffStr = diff > 0 ? `↑ ${diff} vs last month` : diff < 0 ? `↓ ${Math.abs(diff)} vs last month` : 'Same as last month'

  const statCards = [
    {
      label: 'Posts this month',
      value: stats ? String(stats.postsThisMonth) : '—',
      color: 'text-accent',
      sub: stats ? diffStr : 'Loading...',
    },
    {
      label: 'Queue ready',
      value: stats ? String(stats.queueReady) : '—',
      color: 'text-green-600',
      sub: stats ? `Next: ${stats.nextPostDate}` : 'Loading...',
    },
    {
      label: 'Streak',
      value: stats ? `${stats.streak}d` : '—',
      color: stats?.streak ? 'text-amber-600' : 'text-faint',
      sub: stats?.streak ? '🔥 Keep it going' : 'Post today to start',
      sm: true,
    },
    {
      label: 'Consistency',
      value: stats ? `${stats.consistency}%` : '—',
      color: stats && stats.consistency >= 70 ? 'text-green-600' : 'text-amber-600',
      sub: stats && stats.consistency >= 70 ? 'Great consistency' : stats ? 'Room to improve' : 'Loading...',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {statCards.map(s => (
        <div key={s.label} className="bg-white border border-border rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-faint uppercase tracking-[0.5px] mb-1">{s.label}</div>
          <div className={`font-serif font-extrabold leading-none ${s.sm ? 'text-xl mt-0.5' : 'text-3xl'} ${s.color}`}>
            {s.value}
          </div>
          <div className="text-[11px] text-faint mt-1">{s.sub}</div>
        </div>
      ))}
    </div>
  )
}
