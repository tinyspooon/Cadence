import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createUserClient } from '@/lib/supabase/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Day index to name
const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Get all dates in the next N days that match active days
function getScheduledDates(activeDays: number[], daysAhead: number = 14): Date[] {
  const dates: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i <= daysAhead; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const jsDow = date.getDay()
    // Convert JS day (0=Sun) to our format (1=Mon...7=Sun)
    const ourDow = jsDow === 0 ? 7 : jsDow
    if (activeDays.includes(ourDow)) {
      dates.push(new Date(date))
    }
  }
  return dates
}

function buildPostPrompt(profile: Record<string, unknown>, voice: Record<string, unknown>, topicIndex: number): string {
  const topics = (profile.topics as string[]) ?? ['Sales leadership', 'Pipeline strategy']
  const topic = topics[topicIndex % topics.length]
  const name = profile.name || 'a sales professional'
  const role = profile.role || 'Sales leader'
  const company = profile.company || 'a B2B company'
  const tone = profile.tone || 'Bold & direct'
  const mix = (profile.content_mix as number) ?? 80
  const postLength = (voice.post_length as string) ?? 'medium'
  const words = postLength === 'short' ? '60-90' : postLength === 'long' ? '200-280' : '100-140'

  const rules = [
    voice.bold_hook !== false && 'Start with a bold single-line hook',
    voice.short_paragraphs !== false && 'One sentence per paragraph',
    voice.end_with_cta !== false && 'End with a question or direct observation',
    !voice.use_emojis && 'No emojis',
    !voice.use_hashtags && 'No hashtags',
  ].filter(Boolean).join('. ')

  let companyNote = ''
  if (profile.company_one_liner && mix < 90) {
    const freq = mix <= 60 ? 'Weave in a reference to' : mix <= 75 ? 'Optionally reference' : 'Only if natural, mention'
    companyNote = `\n${freq} ${company} (${profile.company_one_liner}) if it genuinely fits. Don't force it.`
  }

  return `You are ghostwriting a LinkedIn post for ${name}, ${role} at ${company}.
Voice: ${tone}. Write in first person. Be specific — real situations, real observations. Never give generic advice.
Topic: ${topic}
Format: ${words} words. ${rules}. Return ONLY the post text.${companyNote}`
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createUserClient(userId)

  // Load profile and voice settings
  const [{ data: profile }, { data: voice }] = await Promise.all([
    supabase.from('profiles').select('*').eq('clerk_user_id', userId).single(),
    supabase.from('voice_settings').select('*').eq('clerk_user_id', userId).single(),
  ])

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found — please complete settings first' }, { status: 400 })
  }

  const activeDays: number[] = (profile.active_days ?? [1, 2, 3, 4, 5]).map((d: number) => {
    // Normalise active_days — DB may have strings, 0-indexed, or 1-indexed values
  // We need JS-compatible: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=7
  const rawDays: (number | string)[] = profile.active_days ?? [1, 2, 3, 4, 5]
  const parsedDays = rawDays.map(d => parseInt(String(d), 10)).filter(d => !isNaN(d))
  
  // Detect if 0-indexed (contains 0 or max is <= 6 with no 7)
  const isZeroIndexed = parsedDays.includes(0) || (Math.max(...parsedDays) <= 6 && !parsedDays.includes(7))
  // Convert to 1-indexed (1=Mon...7=Sun) to match JS getDay() conversion
  const normalisedDays = isZeroIndexed 
    ? parsedDays.map(d => d + 1).filter(d => d >= 1 && d <= 7)
    : parsedDays.filter(d => d >= 1 && d <= 7)
  const postsPerDay: number = profile.posts_per_day ?? 1
  const platforms: string[] = profile.enabled_platforms ?? ['linkedin']
  const voiceData = voice ?? {}

  // Delete existing future scheduled posts for this user (regenerating the week)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  await supabase
    .from('posts')
    .delete()
    .eq('clerk_user_id', userId)
    .eq('status', 'scheduled')
    .gte('scheduled_for', today.toISOString().split('T')[0])

  // Generate posts for the next 14 days based on active days
  const scheduledDates = getScheduledDates(normalisedDays, 14)
  const postsToCreate: Record<string, unknown>[] = []
  let topicIndex = 0

  for (const date of scheduledDates) {
    for (let p = 0; p < postsPerDay; p++) {
        const platform = platforms[p % platforms.length] ?? 'linkedin'
        const prompt = buildPostPrompt(profile, voiceData, topicIndex)
        topicIndex++

        try {
          const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 400,
            temperature: 0.85,
          })

          const raw = completion.choices[0]?.message?.content?.trim() ?? ''
          const text = raw
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .trim()

          const topics = (profile.topics as string[]) ?? []
          postsToCreate.push({
            clerk_user_id: userId,
            content: text,
            platform: platform,
            style: 'Story',
            topic: topics[topicIndex % Math.max(topics.length, 1)] ?? 'Sales leadership',
            status: 'scheduled',
            scheduled_for: date.toISOString().split('T')[0],
            model_used: 'llama-3.3-70b-versatile',
          })
        } catch (e) {
          console.error('Groq generation failed for', date, e)
        }
    }
  }

  // Save all generated posts
  const { data: savedPosts, error } = await supabase
    .from('posts')
    .insert(postsToCreate)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    generated: savedPosts?.length ?? 0,
    posts: savedPosts,
  })
}
