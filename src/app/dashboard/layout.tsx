import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 ml-[210px] flex flex-col min-h-screen">
        <Topbar name={user?.firstName ?? 'there'} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
