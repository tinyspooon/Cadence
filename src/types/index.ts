export type Platform = 'linkedin' | 'x'
export type PostStatus = 'draft' | 'scheduled' | 'approved' | 'posted'
export type PostStyle = 'Story' | 'Insight' | 'Observation'
export type PostLength = 'short' | 'medium' | 'long'

export interface Profile {
  id: string
  clerk_user_id: string
  name: string
  role: string
  company: string
  industry: string
  goal: string
  audience: string
  tone: string
  topics: string[]
  frequency: string
  posting_streak: number
  posts_this_month: number
  created_at: string
  updated_at: string
}

export interface VoiceSettings {
  id: string
  clerk_user_id: string
  tone_slider: number
  length_slider: number
  story_slider: number
  provocative_slider: number
  bold_hook: boolean
  short_paragraphs: boolean
  rhetorical_questions: boolean
  end_with_cta: boolean
  personal_stories: boolean
  use_hashtags: boolean
  max_hashtags: number
  use_emojis: boolean
  post_length: PostLength
  voice_samples: string[]
}

export interface Post {
  id: string
  clerk_user_id: string
  content: string
  platform: Platform
  style?: PostStyle
  topic?: string
  status: PostStatus
  scheduled_for?: string
  posted_at?: string
  rating?: number
  created_at: string
  updated_at: string
}

export interface PlatformConnection {
  id: string
  clerk_user_id: string
  platform: Platform
  profile_url?: string
  handle?: string
}

export interface TeamMember {
  clerk_user_id: string
  name: string
  role: string
  posts_this_month: number
  posting_streak: number
}

// Onboarding state (client-side only, persisted to profile on complete)
export interface OnboardingState {
  step: number
  name: string
  role: string
  company: string
  industry: string
  goal: string
  audience: string
  tone: string
  topics: string[]
  frequency: string
  hook: string
  testPosts: GeneratedPost[]
}

export interface GeneratedPost {
  platform: string
  style: string
  body: string
}
