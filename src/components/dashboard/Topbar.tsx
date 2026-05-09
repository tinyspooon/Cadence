'use client'

import { Bell, Flame } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TopbarProps {
  name: string
  imageUrl?: string
}

export default function Topbar({ name }: TopbarProps) {
  const [greeting, setGreeting] = useState('Good morning')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const d = new Date()
    setDateStr(`${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`)
  }, [])

  return (
    <header className="bg-white border-b border-border px-7 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <div className="text-[15px] font-bold text-text">
          {greeting}, {name} 👋
        </div>
        <div className="text-xs text-muted mt-0.5">{dateStr}</div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Streak */}
        <div className="flex items-center gap-1.5 bg-amber-light border border-amber/25 rounded-full px-3 py-1.5 text-sm font-bold text-amber">
          <Flame className="w-3.5 h-3.5" />
          <span>3 day streak</span>
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-text transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  )
}
