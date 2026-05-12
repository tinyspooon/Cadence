import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createUserClient } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createUserClient(userId)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data ?? null })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const supabase = await createUserClient(userId)

  const profileData = {
    clerk_user_id: userId,
    name: body.name ?? '',
    role: body.role ?? '',
    company: body.company ?? '',
    industry: body.industry ?? '',
    goal: body.goal ?? '',
    audience: body.audience ?? '',
    tone: body.tone ?? '',
    topics: body.topics ?? [],
    frequency: body.frequency ?? '',
    // Company context
    company_one_liner: body.company_one_liner ?? '',
    problem_solved: body.problem_solved ?? '',
    target_customer: body.target_customer ?? '',
    differentiator: body.differentiator ?? '',
    content_mix: body.content_mix ?? 80,
    // Schedule
    posts_per_day: body.posts_per_day ?? 1,
    active_days: (body.active_days ?? [1,2,3,4,5]).map((d: unknown) => Number(d)),
    enabled_platforms: body.enabled_platforms ?? ['linkedin'],
    // Platform handles
    linkedin_url: body.linkedin_url ?? '',
    x_handle: body.x_handle ?? '',
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'clerk_user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
