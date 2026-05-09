const QUEUE = [
  { day: 'Tomorrow', platform: 'LinkedIn', preview: 'The cold email mistake everyone makes…' },
  { day: 'Wed 8', platform: 'X/Twitter', preview: 'SDR metrics that actually matter vs ones…' },
  { day: 'Thu 9', platform: 'LinkedIn', preview: 'What 3 months of multi-threading taught me…' },
  { day: 'Fri 10', platform: 'LinkedIn', preview: 'Pipeline is a lagging indicator. Here\'s what I watch…' },
  { day: 'Mon 12', platform: 'X/Twitter', preview: 'Hot take: SDR to AE handoff is where most deals die…' },
]

export default function QueueSidebar() {
  return (
    <div className="space-y-2">
      {QUEUE.map((item, i) => (
        <div
          key={i}
          className="bg-white border border-border rounded-xl px-3 py-2.5 cursor-pointer hover:border-border2 transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted uppercase tracking-[0.5px]">{item.day}</span>
            <span className={`text-[11px] font-bold ${item.platform === 'X/Twitter' ? 'text-black' : 'text-[#0A66C2]'}`}>
              {item.platform === 'X/Twitter' ? '𝕏' : 'in'}
            </span>
          </div>
          <div className="text-[13px] text-text mt-1 truncate">{item.preview}</div>
        </div>
      ))}
    </div>
  )
}
