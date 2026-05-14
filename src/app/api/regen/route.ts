import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createUserClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  const supabase = await createUserClient(userId)

  const [{ data: profile }, { data: voice }, { data: post }] = await Promise.all([
    supabase.from('profiles').select('*').eq('clerk_user_id', userId).single(),
    supabase.from('voice_settings').select('*').eq('clerk_user_id', userId).single(),
    supabase.from('posts').select('*').eq('id', postId).eq('clerk_user_id', userId).single(),
  ])

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const v = voice ?? {}
  const topics = (profile.topics as string[]) ?? ['Sales leadership', 'Pipeline strategy']
  const topic = (post.topic as string) || topics[Math.floor(Math.random() * topics.length)]
  const mix = (profile.content_mix as number) ?? 80
  const postLength = (v.post_length as string) ?? 'medium'
  const words = postLength === 'short' ? '60-90' : postLength === 'long' ? '200-280' : '100-140'

  const toneVal = (v.tone_slider as number) ?? 25
  const storyVal = (v.story_slider as number) ?? 40
  const provVal = (v.provocative_slider as number) ?? 65

  const styleRules: string[] = []
  if (toneVal > 70) styleRules.push('Write like texting a colleague. Casual. Drop corporate words.')
  else if (toneVal < 30) styleRules.push('Write formally and authoritatively. Precise language.')
  else styleRules.push('Write professionally but approachably.')
  if (storyVal > 70) styleRules.push('Every point anchored in a real story. Start with "I was..." or "Last quarter..."')
  else if (storyVal < 30) styleRules.push('Back every claim with a specific number or concrete example.')
  if (provVal > 70) styleRules.push('Take a bold stance. Challenge conventional wisdom. Divide opinion.')
  else if (provVal < 30) styleRules.push('Be balanced and measured. Stay evidence-based.')

  const openings = [
    'Start with a specific number or stat from your own experience',
    'Start with a single sentence most sales leaders would disagree with',
    'Start with "Last [week/month/quarter]..." and a specific situation',
    'Start with a direct counter-intuitive claim',
    'Start with something you got wrong early in your career',
    'Start with a pattern you keep seeing that others miss',
    'Start with a specific result then explain how',
    'Start with the uncomfortable truth nobody says out loud',
  ]
  const opening = openings[Math.floor(Math.random() * openings.length)]

  let companyNote = ''
  if (profile.company_one_liner && mix < 90) {
    const freq = mix <= 60 ? 'Weave in a reference to' : mix <= 75 ? 'Optionally reference' : 'Only if natural, mention'
    companyNote = `\n${freq} ${profile.company} (${profile.company_one_liner}) if it genuinely fits.`
  }

  const prompt = `Write a LinkedIn post for ${profile.name}, ${profile.role} at ${profile.company}.

TOPIC: ${topic}

MANDATORY STYLE RULES:
${styleRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
${v.short_paragraphs !== false ? `${styleRules.length + 1}. Every sentence on its own line. No multi-sentence paragraphs.` : ''}
${v.end_with_cta !== false ? `${styleRules.length + 2}. End with one short direct question.` : ''}
${v.bold_hook !== false ? `${styleRules.length + 3}. First line: single punchy hook.` : ''}
${v.use_emojis ? '- Use 1-2 relevant emojis naturally in the post.' : '- No emojis.'}
${v.use_hashtags ? `- Add ${v.max_hashtags || 3} relevant hashtags at the end.` : '- No hashtags.'}

OPENING: ${opening}
LENGTH: ${words} words.${companyNote}
Return ONLY the post text.`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' })
    const result = await model.generateContent(prompt)
    const raw = result.response.text()
    const usage = result.response.usageMetadata
    console.log(`[regen] PostID: ${postId} | in:${usage?.promptTokenCount} out:${usage?.candidatesTokenCount}`)
    let text = raw
    text = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/#{1,6}\s/g, '').trim()
    if (v.short_paragraphs !== false) {
      text = text.replace(/([.!?])\s+([A-Z])/g, '$1\n$2').replace(/\n{3,}/g, '\n\n').trim()
    }

    await supabase.from('posts').update({
      content: text,
      updated_at: new Date().toISOString(),
    }).eq('id', postId).eq('clerk_user_id', userId)

    return NextResponse.json({ content: text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
