import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'
import { createUserClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Check if onboarding is complete
  const supabase = await createUserClient(userId)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, topics')
    .eq('clerk_user_id', userId)
    .single()

  const onboardingComplete = !!(profile?.name && profile?.topics?.length > 0)
  if (!onboardingComplete) redirect('/onboarding')

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
