import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt, type } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: { temperature: type === 'insight' ? 0.6 : 0.9 }
    })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    return NextResponse.json({ text })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
