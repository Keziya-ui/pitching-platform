export type Pitch = {
  id: string
  title: string
  description: string
  video_url?: string
  funding_goal: number
  tags: string[]
  founder_id: string
  created_at?: string
}

export type Profile = {
  id: string
  name: string
  role: 'founder' | 'investor'
  created_at?: string
}
