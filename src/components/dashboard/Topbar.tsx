'use client'

import { Bell, Flame } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Topbar({ name: clerkName }: { name: string }) {
  const [greeting, setGreeting] = useState('Good morning')
  const [dateStr, setDateStr] = useState('')
  const [name, setName] = useState(clerkName || '')
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const d = new Date()
    setDateStr(`${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`)

    // Load name from profile if Clerk didn't provide it
    fetch('/api/profile').then(r => r.json()).then(({ profile }) => {
      if (profile?.name) setName(profile.name.split(' ')[0])
    }).catch(() => {})

    // Calculate streak from posts
    fetch('/api/posts').then(r => r.json()).then(({ posts }) => {
      if (!posts?.length) return
      const posted = posts
        .filter((p: Record<string, unknown>) => p.status === 'posted' && p.posted_at)
        .map((p: Record<string, unknown>) => {
          const d = String(p.posted_at).split('T')[0]
          return d
        })
      const uniqueDays = [...new Set(posted)].sort().reverse() as string[]
      if (!uniqueDays.length) return
      let s = 0
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const check = new Date(today)
        check.setDate(today.getDate() - i)
        const str = check.toISOString().split('T')[0]
        if (uniqueDays.includes(str)) s++
        else if (i > 0) break
      }
      setStreak(s)
    }).catch(() => {})
  }, [])

  const displayName = name || clerkName || 'there'

  return (
    <header className="bg-white border-b border-border px-7 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <div className="text-[15px] font-bold text-text">
          {greeting}, {displayName} 👋
        </div>
        <div className="text-xs text-muted mt-0.5">{dateStr}</div>
      </div>

      <div className="flex items-center gap-2.5">
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 text-sm font-bold text-amber-600">
            <Flame className="w-3.5 h-3.5" />
            <span>{streak} day streak</span>
          </div>
        )}
        <button className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-text transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
