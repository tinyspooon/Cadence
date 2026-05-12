import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createUserClient } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createUserClient(userId)
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('clerk_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data ?? [] })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const supabase = await createUserClient(userId)

  const { data, error } = await supabase
    .from('posts')
    .insert({
      clerk_user_id: userId,
      content: body.content,
      platform: body.platform ?? 'linkedin',
      style: body.style,
      topic: body.topic,
      status: body.status ?? 'draft',
      scheduled_for: body.scheduledFor ?? null,
      posted_at: body.status === 'posted' ? new Date().toISOString() : null,
      model_used: 'llama-3.3-70b-versatile',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'Post ID required' }, { status: 400 })

  const supabase = await createUserClient(userId)
  const { data, error } = await supabase
    .from('posts')
    .update({
      ...updates,
      posted_at: updates.status === 'posted' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('clerk_user_id', userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}
