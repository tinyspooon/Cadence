/**
 * Client-side helper to call our secure /api/generate route.
 * The Groq API key lives server-side only — never exposed to the browser.
 */
export async function generate(
  prompt: string,
  options: { maxTokens?: number; type?: string } = {}
): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      maxTokens: options.maxTokens ?? 700,
      type: options.type ?? 'post',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Generation failed (${res.status})`)
  }

  const data = await res.json()
  return data.text
}

/**
 * Build the post generation prompt from a user's profile + hook
 */
export function buildPostPrompt(params: {
  name: string
  role: string
  company: string
  goal: string
  audience: string
  tone: string
  topics: string[]
  hook: string
  style?: 'story' | 'insight' | 'observation'
  voiceSettings?: {
    boldHook?: boolean
    shortParagraphs?: boolean
    endWithCta?: boolean
    useHashtags?: boolean
    maxHashtags?: number
    useEmojis?: boolean
    postLength?: string
  }
}): string {
  const {
    name, role, company, goal, audience, tone,
    topics, hook, style = 'story', voiceSettings = {}
  } = params

  const lengthMap: Record<string, string> = {
    short: '100-150 words',
    medium: '200-250 words',
    long: '350-400 words',
  }
  const targetLength = lengthMap[voiceSettings.postLength ?? 'medium']

  const instructions = [
    voiceSettings.boldHook && 'Start with a bold, attention-grabbing first line',
    voiceSettings.shortParagraphs && 'Use short single-sentence paragraphs — the LinkedIn format',
    voiceSettings.endWithCta && 'End with an engaging question or call to action',
    voiceSettings.useHashtags && `Add ${voiceSettings.maxHashtags ?? 3} relevant hashtags at the end`,
    !voiceSettings.useEmojis && 'No emojis',
  ].filter(Boolean).join('. ')

  return `You are a LinkedIn ghostwriter for ${name}, ${role} at ${company}.
Their content goal: ${goal}.
Their target audience: ${audience}.
Their tone: ${tone}.
Their content topics: ${topics.join(', ')}.

They told you: "${hook}"

Write a ${style} style LinkedIn post (${targetLength}).
${instructions ? `Style instructions: ${instructions}.` : ''}
Be specific and direct. No generic advice. No corporate speak.
Return ONLY the post text — no preamble, no quotes, no markdown.`
}

/**
 * Build the onboarding test posts prompt (returns JSON)
 */
export function buildOnboardingPrompt(params: {
  name: string
  role: string
  company: string
  goal: string
  audience: string
  tone: string
  topics: string[]
  hook: string
}): string {
  const { name, role, company, goal, audience, tone, topics, hook } = params

  return `You are a social media ghostwriter for ${name}, ${role} at ${company}.
Goal: ${goal}. Audience: ${audience}. Tone: ${tone}. Topics: ${topics.join(', ')}.

They told you: "${hook}"

Write 3 social posts. Return ONLY valid JSON, no markdown:
{"posts":[
  {"platform":"LinkedIn","style":"Story","body":"3-5 short paragraphs, story hook format"},
  {"platform":"X/Twitter","style":"Observation","body":"2-3 punchy sentences"},
  {"platform":"LinkedIn","style":"Insight","body":"2-4 sentences, bold contrarian take"}
]}`
}

/**
 * Build the daily insight prompt
 */
export function buildInsightPrompt(role: string, topics: string[]): string {
  return `Write a single 1-2 sentence content insight for a ${role}'s LinkedIn dashboard.
Topics they post about: ${topics.join(', ')}.
Make it specific and data-flavoured. Example: "Story hook posts are getting 3x more engagement — your next post is set up for that."
Return only the insight text, no quotes.`
}
