import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createUserClient } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ complete: false })

  const supabase = await createUserClient(userId)
  const { data } = await supabase
    .from('profiles')
    .select('name, topics, active_days')
    .eq('clerk_user_id', userId)
    .single()

  // Onboarding is complete if they have a name and at least one topic
  const complete = !!(data?.name && data?.topics?.length > 0)
  return NextResponse.json({ complete })
}
