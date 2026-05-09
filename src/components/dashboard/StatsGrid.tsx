// StatsGrid.tsx
export default function StatsGrid() {
  const stats = [
    { label: 'Posts this month', value: '8', color: 'text-accent', sub: '↑ 3 vs last month' },
    { label: 'Queue ready', value: '6', color: 'text-green-600', sub: 'Next: Tomorrow' },
    { label: 'Best style', value: 'Story hook', color: 'text-text', sub: '3× avg engagement', sm: true },
    { label: 'Consistency', value: '84%', color: 'text-green-600', sub: 'Top 12% of users' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-border rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-faint uppercase tracking-[0.5px] mb-1">{s.label}</div>
          <div className={`font-serif font-extrabold leading-none ${s.sm ? 'text-base mt-0.5' : 'text-3xl'} ${s.color}`}>
            {s.value}
          </div>
          <div className="text-[11px] text-faint mt-1">{s.sub}</div>
        </div>
      ))}
    </div>
  )
}
