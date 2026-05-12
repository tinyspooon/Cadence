import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createUserClient } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createUserClient(userId)
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_days')
    .eq('clerk_user_id', userId)
    .single()

  const rawDays = profile?.active_days ?? []
  const parsedDays = rawDays.map((d: unknown) => parseInt(String(d), 10))

  // Check next 10 days
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const dateChecks = []
  for (let i = 0; i <= 9; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const jsDay = date.getDay()
    const ourDay = jsDay === 0 ? 7 : jsDay
    const matches = parsedDays.includes(ourDay)
    dateChecks.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      jsDay,
      ourDay,
      matches,
    })
  }

  return NextResponse.json({
    rawDays,
    rawDaysTypes: rawDays.map((d: unknown) => typeof d),
    parsedDays,
    dateChecks,
  })
}
