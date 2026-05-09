import { auth } from '@clerk/nextjs/server'
import TodayPost from '@/components/dashboard/TodayPost'
import MiniCalendar from '@/components/dashboard/MiniCalendar'
import QueueSidebar from '@/components/dashboard/QueueSidebar'
import StatsGrid from '@/components/dashboard/StatsGrid'
import SetupChecklist from '@/components/dashboard/SetupChecklist'

export default async function DashboardPage() {
  const { userId } = await auth()

  return (
    <div className="grid grid-cols-[1fr_250px_270px] min-h-[calc(100vh-56px)]">
      {/* Left: Today's post + stats */}
      <div className="p-5 border-r border-border">
        <div className="text-[10px] font-bold text-faint uppercase tracking-[1.5px] mb-4">
          Today&apos;s focus
        </div>
        <TodayPost userId={userId!} />
        <StatsGrid />
      </div>

      {/* Middle: Calendar + insight */}
      <div className="p-5 border-r border-border">
        <MiniCalendar />
      </div>

      {/* Right: Checklist + queue */}
      <div className="p-5">
        <SetupChecklist />
        <div className="mt-5">
          <div className="text-[10px] font-bold text-faint uppercase tracking-[1.5px] mb-3">
            This week&apos;s queue
          </div>
          <QueueSidebar />
        </div>
      </div>
    </div>
  )
}
