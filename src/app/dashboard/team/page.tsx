'use client'

import { useState } from 'react'

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  color: string
  postsThisMonth: number
  streak: number
  consistency: number
  topStyle: string
  lastPosted: string
  status: 'active' | 'inactive' | 'at-risk'
}

const TEAM: TeamMember[] = [
  { id: '1', name: 'Ryan Callahan',        role: 'SDR',         avatar: 'K', color: '#FF5C35', postsThisMonth: 14, streak: 9,  consistency: 94, topStyle: 'Story',       lastPosted: 'Today',     status: 'active' },
  { id: '2', name: 'Jamie Torres',   role: 'SDR',         avatar: 'B', color: '#7C4DFF', postsThisMonth: 11, streak: 6,  consistency: 82, topStyle: 'Insight',     lastPosted: 'Yesterday', status: 'active' },
  { id: '3', name: 'Alex Morgan',        role: 'Head of SDR', avatar: 'O', color: '#0EA47A', postsThisMonth: 9,  streak: 3,  consistency: 78, topStyle: 'Story',       lastPosted: 'Today',     status: 'active' },
  { id: '4', name: 'Sam Fletcher',        role: 'SDR',         avatar: 'D', color: '#D97706', postsThisMonth: 8,  streak: 4,  consistency: 71, topStyle: 'Observation', lastPosted: '2 days ago',status: 'active' },
  { id: '5', name: 'Priya Sharma', role: 'SDR',         avatar: 'C', color: '#0A66C2', postsThisMonth: 6,  streak: 2,  consistency: 58, topStyle: 'Insight',     lastPosted: '3 days ago',status: 'at-risk' },
  { id: '6', name: 'Ben Wallace',      role: 'SDR',         avatar: 'L', color: '#9333EA', postsThisMonth: 5,  streak: 1,  consistency: 45, topStyle: 'Story',       lastPosted: '4 days ago',status: 'at-risk' },
  { id: '7', name: 'Mia Chen',         role: 'SDR',         avatar: 'D', color: '#059669', postsThisMonth: 3,  streak: 0,  consistency: 28, topStyle: '—',           lastPosted: '1 week ago',status: 'inactive' },
  { id: '8', name: 'Tyler Brooks',     role: 'SDR',         avatar: 'C', color: '#DC2626', postsThisMonth: 2,  streak: 0,  consistency: 19, topStyle: '—',           lastPosted: '1 week ago',status: 'inactive' },
  { id: '9', name: 'Sofia Reyes',     role: 'SDR',         avatar: 'A', color: '#7C3AED', postsThisMonth: 1,  streak: 0,  consistency: 12, topStyle: '—',           lastPosted: '2 weeks ago',status: 'inactive' },
  { id: '10',name: 'Jake Nolan',  role: 'SDR',         avatar: 'B', color: '#B45309', postsThisMonth: 0,  streak: 0,  consistency: 0,  topStyle: '—',           lastPosted: 'Never',     status: 'inactive' },
]

const MEDALS = ['🥇','🥈','🥉']

type SortKey = 'posts' | 'streak' | 'consistency'
type FilterKey = 'all' | 'active' | 'at-risk' | 'inactive'

export default function TeamPage() {
  const [sort, setSort]     = useState<SortKey>('posts')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [challenge, setChallenge] = useState(true)

  const filtered = TEAM
    .filter(m => filter === 'all' || m.status === filter)
    .sort((a, b) => {
      if (sort === 'posts')       return b.postsThisMonth - a.postsThisMonth
      if (sort === 'streak')      return b.streak - a.streak
      if (sort === 'consistency') return b.consistency - a.consistency
      return 0
    })

  const totalPosts   = TEAM.reduce((s, m) => s + m.postsThisMonth, 0)
  const activeCount  = TEAM.filter(m => m.status === 'active').length
  const avgStreak    = Math.round(TEAM.reduce((s, m) => s + m.streak, 0) / TEAM.length * 10) / 10
  const atRiskCount  = TEAM.filter(m => m.status === 'at-risk').length
  const maxPosts     = Math.max(...TEAM.map(m => m.postsThisMonth), 1)

  function statusColor(s: TeamMember['status']) {
    if (s === 'active')   return 'bg-green-100 text-green-700'
    if (s === 'at-risk')  return 'bg-amber-100 text-amber-700'
    return 'bg-gray-100 text-gray-500'
  }

  function statusLabel(s: TeamMember['status']) {
    if (s === 'active')   return 'Active'
    if (s === 'at-risk')  return 'At risk'
    return 'Inactive'
  }

  return (
    <div className="min-h-screen bg-bg">

      {/* Topbar */}
      <div className="bg-white border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-serif text-xl font-extrabold tracking-tight text-text leading-tight">Team Scoreboard</h1>
          <p className="text-xs text-muted">May 2026 · {TEAM.length} members</p>
        </div>
        <button className="bg-accent text-white text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          + Invite member
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Team posts this month', value: totalPosts, color: 'text-accent', sub: '↑ 12 vs April' },
            { label: 'Active posters', value: `${activeCount} / ${TEAM.length}`, color: 'text-green-600', sub: `${Math.round(activeCount/TEAM.length*100)}% of team` },
            { label: 'Avg streak', value: avgStreak, color: 'text-amber-600', sub: 'days per person' },
            { label: 'At risk', value: atRiskCount, color: 'text-amber-600', sub: 'Need a nudge' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-semibold text-faint uppercase tracking-wide mb-1">{s.label}</div>
              <div className={`font-serif text-3xl font-extrabold leading-none ${s.color}`}>{s.value}</div>
              <div className="text-xs text-faint mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Weekly challenge ── */}
        {challenge && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏆</div>
              <div>
                <div className="text-sm font-bold text-amber-800">This week&apos;s challenge</div>
                <div className="text-sm text-amber-700 mt-0.5">Post 3× before Friday — earn the <strong>Consistent Creator</strong> badge. 6 of 10 reps on track.</div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-center">
                <div className="font-serif text-2xl font-extrabold text-amber-700">2</div>
                <div className="text-xs text-amber-600">days left</div>
              </div>
              <button onClick={() => setChallenge(false)} className="text-amber-400 hover:text-amber-600 text-lg leading-none">✕</button>
            </div>
          </div>
        )}

        {/* ── Leaderboard ── */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="text-sm font-bold text-text">Leaderboard</div>
            <div className="flex items-center gap-3">
              {/* Filter */}
              <div className="flex gap-1">
                {(['all','active','at-risk','inactive'] as FilterKey[]).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded-full border text-xs font-semibold transition-all ${
                      filter === f ? 'bg-accent-light border-accent text-accent' : 'bg-white border-border2 text-muted hover:border-accent hover:text-accent'
                    }`}>
                    {f === 'at-risk' ? 'At risk' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              {/* Sort */}
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                className="text-xs font-semibold text-muted border border-border2 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-accent"
              >
                <option value="posts">Sort: Posts</option>
                <option value="streak">Sort: Streak</option>
                <option value="consistency">Sort: Consistency</option>
              </select>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[36px_1fr_80px_80px_90px_80px_80px] gap-3 px-5 py-2 text-[10px] font-bold text-faint uppercase tracking-wider border-b border-border bg-bg/50">
            <div>#</div>
            <div>Member</div>
            <div className="text-right">Posts</div>
            <div className="text-right">Streak</div>
            <div>Progress</div>
            <div className="text-center">Style</div>
            <div className="text-right">Status</div>
          </div>

          {/* Rows */}
          {filtered.map((m, i) => {
            const rank = TEAM.indexOf(m)
            return (
              <div key={m.id}
                className="grid grid-cols-[36px_1fr_80px_80px_90px_80px_80px] gap-3 items-center px-5 py-3 border-b border-border last:border-b-0 hover:bg-bg/40 transition-colors">

                {/* Rank */}
                <div className="text-sm font-bold">
                  {rank < 3 ? MEDALS[rank] : <span className="text-faint font-mono text-xs">{rank + 1}</span>}
                </div>

                {/* Member */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: m.color }}>
                    {m.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold truncate ${m.name === 'Alex Morgan' ? 'text-accent' : 'text-text'}`}>
                      {m.name}{m.name === 'Alex Morgan' ? ' (you)' : ''}
                    </div>
                    <div className="text-xs text-faint">{m.lastPosted}</div>
                  </div>
                </div>

                {/* Posts */}
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-accent">{m.postsThisMonth}</span>
                </div>

                {/* Streak */}
                <div className="text-right">
                  <span className={`text-sm font-bold font-mono ${m.streak > 0 ? 'text-amber-600' : 'text-faint'}`}>
                    {m.streak > 0 ? `🔥${m.streak}d` : '—'}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(m.postsThisMonth / maxPosts) * 100}%`,
                        background: m.status === 'inactive' ? '#D1D5DB' : m.color,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-faint mt-0.5 text-right">{m.consistency}%</div>
                </div>

                {/* Top style */}
                <div className="text-center">
                  <span className={`text-xs font-semibold ${m.topStyle === '—' ? 'text-faint' : 'text-violet-600 bg-violet-50 rounded px-1.5 py-0.5'}`}>
                    {m.topStyle}
                  </span>
                </div>

                {/* Status */}
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(m.status)}`}>
                    {statusLabel(m.status)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── At risk nudge ── */}
        {TEAM.filter(m => m.status === 'at-risk').length > 0 && (
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-bold text-text mb-1">⚠ Needs attention</div>
            <div className="text-xs text-muted mb-4">These reps haven&apos;t posted in 3+ days. A quick Slack message usually does it.</div>
            <div className="space-y-2">
              {TEAM.filter(m => m.status === 'at-risk').map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-bg rounded-xl">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: m.color }}>{m.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text">{m.name}</div>
                    <div className="text-xs text-faint">Last posted {m.lastPosted}</div>
                  </div>
                  <button className="text-xs font-bold text-accent bg-accent-light border border-accent/20 rounded-lg px-3 py-1.5 hover:opacity-80 transition-opacity">
                    Send nudge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Badges ── */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="text-sm font-bold text-text mb-1">🏅 Badges earned this month</div>
          <div className="text-xs text-muted mb-4">Achievements unlock automatically based on posting activity</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { emoji: '🔥', name: 'On Fire', desc: '7-day streak', earner: 'Ryan Callahan' },
              { emoji: '✍️', name: 'Prolific', desc: '10+ posts in a month', earner: 'Ryan Callahan' },
              { emoji: '🎯', name: 'Consistent', desc: '80%+ consistency', earner: 'Jamie Torres' },
              { emoji: '🚀', name: 'First Post', desc: 'Posted for the first time', earner: 'Sofia Reyes' },
            ].map((b, i) => (
              <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{b.emoji}</div>
                <div className="text-xs font-bold text-text">{b.name}</div>
                <div className="text-[10px] text-muted mt-0.5">{b.desc}</div>
                <div className="text-[10px] font-semibold text-amber-700 mt-1.5">{b.earner}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
