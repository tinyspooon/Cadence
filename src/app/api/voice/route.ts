import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createUserClient } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createUserClient(userId)
  const { data, error } = await supabase
    .from('voice_settings')
    .select('*')
    .eq('clerk_user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ voice: data ?? null })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const supabase = await createUserClient(userId)

  const voiceData = {
    clerk_user_id: userId,
    tone_slider: body.tone ?? 25,
    length_slider: body.length ?? 60,
    story_slider: body.story ?? 40,
    provocative_slider: body.provocative ?? 65,
    bold_hook: body.boldHook ?? true,
    short_paragraphs: body.shortParagraphs ?? true,
    rhetorical_questions: body.rhetoricalQuestions ?? false,
    end_with_cta: body.endWithCta ?? true,
    personal_stories: body.personalStories ?? true,
    use_hashtags: body.hashtags ?? false,
    max_hashtags: body.maxHashtags ?? 3,
    use_emojis: body.emojis ?? false,
    post_length: body.postLength ?? 'medium',
    voice_samples: body.voiceSamples ?? [],
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('voice_settings')
    .upsert(voiceData, { onConflict: 'clerk_user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ voice: data })
}
