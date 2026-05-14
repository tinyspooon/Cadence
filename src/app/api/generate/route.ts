import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt, maxTokens = 400, type } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: type === 'insight' ? 0.6 : 0.9,
    })
    const text = completion.choices[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ text })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
