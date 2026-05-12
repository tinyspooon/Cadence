'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, List, Calendar, Mic2,
  Users, Settings, Zap, LogOut, User, ChevronUp
} from 'lucide-react'

const NAV = [
  {
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 1 },
    ]
  },
  {
    label: 'Content',
    items: [
      { href: '/dashboard/queue', label: 'Queue', icon: List },
      { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
      { href: '/dashboard/voice', label: 'Voice & Style', icon: Mic2 },
    ]
  },
  {
    label: 'Team',
    items: [
      { href: '/dashboard/scoreboard', label: 'Scoreboard', icon: Users },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, user } = useClerk()
  const [accountOpen, setAccountOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[210px] bg-white border-r border-border flex flex-col z-20 shadow-[1px_0_8px_rgba(0,0,0,0.04)]">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 17 17" fill="none" className="w-[17px] h-[17px]">
              <rect x="2" y="3.5" width="13" height="2.5" rx="1.25" fill="white" />
              <rect x="2" y="7.25" width="9" height="2.5" rx="1.25" fill="white" />
              <rect x="2" y="11" width="11" height="2.5" rx="1.25" fill="white" />
              <path d="M12 13.5l1.2 1.2 2.3-2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-serif text-[19px] font-extrabold text-text tracking-tight leading-none">
            Caden<em className="text-accent not-italic">ce</em>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((group, gi) => (
          <div key={gi} className={cn('border-b border-border', gi === NAV.length - 1 && 'border-b-0')}>
            {group.label && (
              <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-faint uppercase tracking-[1.5px]">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium transition-all duration-150',
                    'border-l-[3px] border-transparent',
                    isActive
                      ? 'text-accent bg-accent-light border-l-accent font-bold'
                      : 'text-muted hover:text-text hover:bg-bg'
                  )}
                >
                  <Icon className="w-[17px] h-[17px] flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {'badge' in item && item.badge ? (
                    <span className="bg-accent text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-4">
        {/* Upgrade nudge */}
        <div className="bg-accent-light border border-accent/20 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent mb-1.5">
            <Zap className="w-3 h-3" /> 12 days left on trial
          </div>
          <button className="w-full bg-accent text-white text-xs font-bold rounded-lg py-1.5 hover:opacity-90 transition-opacity">
            Upgrade to Pro — $19.99/mo
          </button>
        </div>

        {/* Account dropdown */}
        <div className="relative">
          <button
            onClick={() => setAccountOpen(o => !o)}
            className="w-full flex items-center gap-2.5 hover:bg-bg rounded-xl p-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.firstName?.[0] ?? 'U'}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-sm font-semibold text-text truncate">
                {user?.firstName ?? 'My Account'} {user?.lastName ?? ''}
              </div>
              <div className="text-xs text-faint">Free trial</div>
            </div>
            <ChevronUp className={cn('w-4 h-4 text-faint transition-transform', !accountOpen && 'rotate-180')} />
          </button>

          {/* Dropdown menu */}
          {accountOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
              <Link
                href="/dashboard/settings"
                onClick={() => setAccountOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-bg transition-colors"
              >
                <User className="w-4 h-4 text-muted" />
                Profile & Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-border"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
