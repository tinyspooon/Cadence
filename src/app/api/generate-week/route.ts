import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createUserClient } from '@/lib/supabase/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
function getScheduledDates(activeDays: number[], daysAhead: number = 21): Date[] {
  const dates: Date[] = []
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  for (let i = 0; i <= daysAhead; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    // JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Our system:  7=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const jsDay = date.getDay()
    const ourDay = jsDay === 0 ? 7 : jsDay
    if (activeDays.map(d => parseInt(String(d), 10)).includes(ourDay)) {
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
  const mix = (profile.content_mix as number) ?? 80
  const postLength = (voice.post_length as string) ?? 'medium'
  const words = postLength === 'short' ? '60-90' : postLength === 'long' ? '200-280' : '100-140'

  // DNA sliders → voice instructions
  const toneVal = (voice.tone_slider as number) ?? 25
  const storyVal = (voice.story_slider as number) ?? 40
  const provVal = (voice.provocative_slider as number) ?? 65

  const toneDesc = toneVal > 70 ? 'conversational and direct, like talking to a colleague' :
                   toneVal > 40 ? 'balanced — professional but approachable' :
                                  'formal and authoritative'

  const styleDesc = storyVal > 70 ? 'story-driven — anchor every point in a real experience' :
                    storyVal > 40 ? 'blend of insight and story' :
                                    'insight and data-driven — back claims with evidence'

  const edgeDesc = provVal > 70 ? 'take a bold, slightly provocative stance — challenge conventional wisdom' :
                   provVal > 40 ? 'have a clear point of view, dont sit on the fence' :
                                  'be measured and evidence-based'

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

  const openingStyles = [
    'Start with a specific number or stat from your experience',
    'Start with a short provocative statement that challenges conventional wisdom',
    'Start with a specific moment: set the scene in one sentence',
    'Start with a direct counter-intuitive claim',
    'Start with a question that makes the reader uncomfortable',
    'Start with something you got wrong early in your career',
    'Start with a pattern you keep seeing that others miss',
    'Start with a specific result, then explain how you got there',
    'Start with the uncomfortable truth nobody in sales wants to admit',
    'Start with a short story about a rep or manager you worked with',
  ]
  const openingStyle = openingStyles[topicIndex % openingStyles.length]

  // Voice samples
  const samples = (voice.voice_samples as string[])?.filter(s => s?.trim().length > 30).slice(0, 2)
    .map(s => s.trim().substring(0, 200)).join('\n---\n')

  return `You are ghostwriting a LinkedIn post for ${name}, ${role} at ${company}.

VOICE PROFILE:
- Tone: ${toneDesc}
- Style: ${styleDesc}
- Edge: ${edgeDesc}
${samples ? `- Writing samples to match:
${samples}` : ''}

TOPIC: ${topic}
OPENING: ${openingStyle}
FORMAT: ${words} words. ${rules}.
Never start with "I've seen" or "I've noticed". Be specific — real situations, real numbers.
Return ONLY the post text.${companyNote}`
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createUserClient(userId)

  const [{ data: profile }, { data: voice }] = await Promise.all([
    supabase.from('profiles').select('*').eq('clerk_user_id', userId).single(),
    supabase.from('voice_settings').select('*').eq('clerk_user_id', userId).single(),
  ])

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found — please complete settings first' }, { status: 400 })
  }

  // Parse active_days — always stored as int[] in DB now
  const activeDays: number[] = (profile.active_days ?? [1,2,3,4,5])
    .map((d: unknown) => parseInt(String(d), 10))
    .filter((d: number) => !isNaN(d) && d >= 1 && d <= 7)

  const postsPerDay: number = profile.posts_per_day ?? 1
  const platforms: string[] = profile.enabled_platforms ?? ['linkedin']
  const voiceData = voice ?? {}

  // Delete existing future scheduled posts
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  await supabase
    .from('posts')
    .delete()
    .eq('clerk_user_id', userId)
    .eq('status', 'scheduled')
    .gte('scheduled_for', today.toISOString().split('T')[0])

  const scheduledDates = getScheduledDates(activeDays, 21)
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

  if (postsToCreate.length === 0) {
    return NextResponse.json({ 
      error: 'No posts generated', 
      debug: { activeDays, rawDays: profile.active_days }
    }, { status: 400 })
  }

  const { data: savedPosts, error } = await supabase
    .from('posts')
    .insert(postsToCreate)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ generated: savedPosts?.length ?? 0, posts: savedPosts })
}
