'use client'

import { useState, useEffect } from 'react'

// ── Types ──────────────────────────────────────────
interface VoiceSettings {
  tone: number
  length: number
  story: number
  provocative: number
  boldHook: boolean
  shortParagraphs: boolean
  rhetoricalQuestions: boolean
  endWithCta: boolean
  personalStories: boolean
  hashtags: boolean
  maxHashtags: number
  emojis: boolean
  postLength: 'short' | 'medium' | 'long'
}

// ── Slider label helpers ────────────────────────────
const SLIDER_LABELS: Record<string, [number, number, string][]> = {
  tone:       [[0,20,'Formal'],[21,40,'Mostly formal'],[41,60,'Balanced'],[61,80,'Conversational'],[81,100,'Very conversational']],
  length:     [[0,20,'Very short'],[21,40,'Short & punchy'],[41,60,'Balanced'],[61,80,'Detailed'],[81,100,'Long-form']],
  story:      [[0,20,'Data-driven'],[21,40,'Evidence-based'],[41,60,'Balanced'],[61,80,'Story-driven'],[81,100,'All stories']],
  provocative:[[0,20,'Very safe'],[21,40,'Measured'],[41,60,'Balanced'],[61,80,'Slightly provocative'],[81,100,'Provocative']],
}

function getLabel(key: string, val: number): string {
  const labels = SLIDER_LABELS[key]
  return labels?.find(([lo, hi]) => val >= lo && val <= hi)?.[2] ?? ''
}

// ── Toggle row component ────────────────────────────
function ToggleRow({ title, desc, value, onChange }: { title: string; desc: string; value: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-b-0 cursor-pointer hover:bg-bg/60 -mx-4 px-4 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text">{title}</div>
        <div className="text-xs text-faint mt-0.5 leading-snug">{desc}</div>
      </div>
      <div className={`w-9 h-5 rounded-full flex-shrink-0 mt-0.5 relative transition-colors duration-200 ${value ? 'bg-green-500' : 'bg-border2'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────
export default function VoicePage() {
  const [settings, setSettings] = useState<VoiceSettings>({
    tone: 25, length: 60, story: 40, provocative: 65,
    boldHook: true, shortParagraphs: true, rhetoricalQuestions: false,
    endWithCta: true, personalStories: true,
    hashtags: false, maxHashtags: 3, emojis: false, postLength: 'medium',
  })
  const [samples, setSamples]   = useState(['', '', ''])
  const [analyses, setAnalyses] = useState(['', '', ''])
  const [sampleCount, setSampleCount] = useState(1)
  const [saved, setSaved]       = useState(false)

  function update<K extends keyof VoiceSettings>(key: K, val: VoiceSettings[K]) {
    setSettings(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'length') {
        const v = val as number
        next.postLength = v <= 33 ? 'short' : v <= 66 ? 'medium' : 'long'
      }
      if (key === 'postLength') {
        next.length = val === 'short' ? 15 : val === 'medium' ? 50 : 85
      }
      return next
    })
  }

  async function handleSave() {
    setSaved(true)
    try {
      await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone: settings.tone,
          length: settings.length,
          story: settings.story,
          provocative: settings.provocative,
          boldHook: settings.boldHook,
          shortParagraphs: settings.shortParagraphs,
          rhetoricalQuestions: settings.rhetoricalQuestions,
          endWithCta: settings.endWithCta,
          personalStories: settings.personalStories,
          hashtags: settings.hashtags,
          maxHashtags: settings.maxHashtags,
          emojis: settings.emojis,
          postLength: settings.postLength,
          voiceSamples: samples.filter(s => s.trim().length > 0),
        }),
      })
    } catch (e) {
      console.warn('Failed to save voice settings:', e)
    }
    setTimeout(() => setSaved(false), 2000)
  }

  // Load voice settings on mount
  useEffect(() => {
    fetch('/api/voice').then(r => r.json()).then(({ voice }) => {
      if (!voice) return
      setSettings({
        tone: voice.tone_slider ?? 25,
        length: voice.length_slider ?? 60,
        story: voice.story_slider ?? 40,
        provocative: voice.provocative_slider ?? 65,
        boldHook: voice.bold_hook ?? true,
        shortParagraphs: voice.short_paragraphs ?? true,
        rhetoricalQuestions: voice.rhetorical_questions ?? false,
        endWithCta: voice.end_with_cta ?? true,
        personalStories: voice.personal_stories ?? true,
        hashtags: voice.use_hashtags ?? false,
        maxHashtags: voice.max_hashtags ?? 3,
        emojis: voice.use_emojis ?? false,
        postLength: voice.post_length ?? 'medium',
      })
      if (voice.voice_samples?.length) setSamples([...voice.voice_samples, '', ''].slice(0, 3))
    }).catch(() => {})
  }, [])

  function analyseSample(i: number, text: string) {
    const newSamples = [...samples]
    newSamples[i] = text
    setSamples(newSamples)

    if (text.trim().length < 60) {
      const newA = [...analyses]; newA[i] = ''; setAnalyses(newA); return
    }
    const words      = text.split(' ').length
    const sentences  = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgLen     = Math.round(words / Math.max(sentences.length, 1))
    const hasQ       = text.includes('?')
    const hasNums    = /\d/.test(text)
    const lines      = text.split('\n').filter(l => l.trim())
    const shortLines = lines.filter(l => l.split(' ').length <= 8).length
    const style      = shortLines > lines.length * 0.5 ? 'short punchy sentences' : 'flowing paragraphs'
    const tone       = (text.match(/\bI\b|\bmy\b|\bme\b/gi)?.length ?? 0) > 3 ? 'personal and first-person' : 'measured and professional'

    const newA = [...analyses]
    newA[i] = `Pattern detected: You write in ${style}, averaging ~${avgLen} words per sentence. Tone feels ${tone}.${hasQ ? ' Ends with questions — good engagement hook.' : ''}${hasNums ? ' Uses data and numbers for credibility.' : ''} Cadence will apply this style to your posts.`
    setAnalyses(newA)
  }

  return (
    <div className="min-h-screen bg-bg">

      {/* Topbar */}
      <div className="bg-white border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-serif text-xl font-extrabold tracking-tight text-text leading-tight">Voice & Style</h1>
          <p className="text-xs text-muted">Define how Cadence writes for you — gets better every post</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            saved ? 'bg-green-600 text-white' : 'bg-accent text-white hover:opacity-90'
          }`}
        >
          {saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── Voice profile — TOP ── */}
          <div className="lg:col-span-2 bg-gradient-to-br from-accent-light to-violet-50 border border-accent/15 rounded-2xl p-5">
            <div className="text-sm font-bold text-text mb-1">✦ Your current voice profile</div>
            <div className="text-xs text-muted mb-3">Updates live as you change settings below</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Tone', value: getLabel('tone', settings.tone) },
                { label: 'Length', value: getLabel('length', settings.length) },
                { label: 'Style', value: getLabel('story', settings.story) },
                { label: 'Edge', value: getLabel('provocative', settings.provocative) },
                settings.boldHook && { label: '✓', value: 'Bold hook' },
                settings.shortParagraphs && { label: '✓', value: 'Short paras' },
                settings.endWithCta && { label: '✓', value: 'Ends with CTA' },
                settings.personalStories && { label: '✓', value: 'Personal stories' },
                settings.hashtags && { label: '#', value: `Up to ${settings.maxHashtags} hashtags` },
                settings.emojis && { label: '✓', value: 'Emojis on' },
                { label: '↔', value: `${settings.postLength.charAt(0).toUpperCase() + settings.postLength.slice(1)} posts` },
              ].filter(Boolean).map((item, i) => {
                const { label, value } = item as { label: string; value: string }
                return (
                  <div key={i} className="flex items-center gap-1.5 bg-white border border-border rounded-full px-3 py-1.5 text-xs">
                    <span className="font-bold text-accent">{label}</span>
                    <span className="text-muted">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Writing DNA ── */}
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-sm font-bold text-text">✦ Writing DNA</div>
              <div className="text-xs text-muted mt-0.5">Drag each slider to define your voice. These feed directly into every post Cadence generates.</div>
            </div>
            <div className="space-y-5">
              {[
                { key: 'tone',        left: 'Formal',        right: 'Conversational' },
                { key: 'length',      left: 'Short & punchy', right: 'Long & detailed' },
                { key: 'story',       left: 'Data-driven',   right: 'Story-driven' },
                { key: 'provocative', left: 'Safe & neutral', right: 'Provocative' },
              ].map(({ key, left, right }) => {
                const val = settings[key as keyof VoiceSettings] as number
                return (
                  <div key={key} className="grid grid-cols-[130px_1fr_130px_140px] items-center gap-3">
                    <div className="text-xs font-semibold text-muted text-right">{left}</div>
                    <input
                      type="range" min={0} max={100} value={val}
                      onChange={e => update(key as keyof VoiceSettings, parseInt(e.target.value) as never)}
                      className="w-full h-1.5 rounded-full cursor-pointer accent-accent"
                      style={{ accentColor: '#FF5C35' }}
                    />
                    <div className="text-xs font-semibold text-muted">{right}</div>
                    <div className="text-xs font-bold text-accent font-mono text-right">{getLabel(key, val)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Signature moves ── */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-sm font-bold text-text">✦ Signature moves</div>
              <div className="text-xs text-muted mt-0.5">Toggle the elements that feel like you</div>
            </div>
            <ToggleRow title="Bold opening hook" desc="First line grabs attention — a challenge, a stat, or a counter-intuitive statement" value={settings.boldHook} onChange={() => update('boldHook', !settings.boldHook)} />
            <ToggleRow title="Short sentence paragraphs" desc="One sentence per line — the classic LinkedIn format" value={settings.shortParagraphs} onChange={() => update('shortParagraphs', !settings.shortParagraphs)} />
            <ToggleRow title="Rhetorical questions" desc="Uses questions to pull the reader forward through the post" value={settings.rhetoricalQuestions} onChange={() => update('rhetoricalQuestions', !settings.rhetoricalQuestions)} />
            <ToggleRow title="End with a CTA" desc="Closes every post with a question or call to engage" value={settings.endWithCta} onChange={() => update('endWithCta', !settings.endWithCta)} />
            <ToggleRow title="Personal stories" desc="Grounds every post in a real experience or anecdote" value={settings.personalStories} onChange={() => update('personalStories', !settings.personalStories)} />
          </div>

          {/* ── Post formatting ── */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-sm font-bold text-text">✦ Post formatting</div>
              <div className="text-xs text-muted mt-0.5">Controls what gets added to every post</div>
            </div>

            <ToggleRow title="Hashtags" desc="Add relevant hashtags to boost discoverability" value={settings.hashtags} onChange={() => update('hashtags', !settings.hashtags)} />

            {/* Hashtag count - only show when on */}
            {settings.hashtags && (
              <div className="mt-2 mb-1 ml-0 p-3 bg-bg rounded-xl">
                <div className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Max hashtags</div>
                <div className="flex gap-2">
                  {[3, 5, 10].map(n => (
                    <button key={n} onClick={() => update('maxHashtags', n)}
                      className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        settings.maxHashtags === n ? 'bg-accent-light border-accent text-accent' : 'bg-white border-border2 text-muted hover:border-accent hover:text-accent'
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ToggleRow title="Emojis" desc="Sprinkle relevant emojis for visual break-up" value={settings.emojis} onChange={() => update('emojis', !settings.emojis)} />

            {/* Post length */}
            <div className="pt-3 border-t border-border mt-1">
              <div className="text-sm font-semibold text-text mb-1">Target post length</div>
              <div className="text-xs text-faint mb-3">Approximate word count per post</div>
              <div className="flex gap-2">
                {([
                  { key: 'short',  label: 'Short',  sub: '~150w' },
                  { key: 'medium', label: 'Medium', sub: '~250w' },
                  { key: 'long',   label: 'Long',   sub: '~400w' },
                ] as const).map(({ key, label, sub }) => (
                  <button key={key} onClick={() => update('postLength', key)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                      settings.postLength === key ? 'bg-accent-light border-accent text-accent' : 'bg-white border-border2 text-muted hover:border-accent hover:text-accent'
                    }`}>
                    <span className="font-bold">{label}</span>
                    <span className="opacity-70">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Voice samples ── */}
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-sm font-bold text-text">✦ Voice samples</div>
              <div className="text-xs text-muted mt-0.5">Paste 1–3 of your real LinkedIn posts. Cadence will analyse your patterns and write more like you.</div>
            </div>

            <div className="space-y-4">
              {Array.from({ length: sampleCount }, (_, i) => (
                <div key={i}>
                  <textarea
                    value={samples[i]}
                    onChange={e => analyseSample(i, e.target.value)}
                    placeholder={i === 0 ? "Paste a real LinkedIn post you're proud of…" : "Paste another post…"}
                    className="w-full border border-border2 rounded-xl px-4 py-3 text-sm leading-relaxed resize-y min-h-[96px] focus:outline-none transition-all"
                    style={{ fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#FF5C35'}
                    onBlur={e => e.target.style.borderColor = ''}
                  />
                  {analyses[i] && (
                    <div className="mt-2 bg-violet-50 border border-violet-100 border-l-[3px] border-l-violet-500 rounded-lg px-3 py-2.5 text-xs text-violet-700 leading-relaxed">
                      <strong>✦ Pattern detected:</strong> {analyses[i]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {sampleCount < 3 && (
              <button
                onClick={() => setSampleCount(c => Math.min(c + 1, 3))}
                className="mt-4 w-full border border-dashed border-border2 text-muted text-sm font-semibold py-2.5 rounded-xl hover:border-accent hover:text-accent hover:bg-accent-light transition-all"
              >
                + Add another sample
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
