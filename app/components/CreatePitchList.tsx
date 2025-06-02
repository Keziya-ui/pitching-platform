'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function FounderPitchList() {
  const [pitches, setPitches] = useState<any[]>([])

  useEffect(() => {
    const fetchPitches = async () => {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) return
      const { data } = await supabase
        .from('pitches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setPitches(data || [])
    }

    fetchPitches()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Your Pitches</h2>
      {pitches.length === 0 && <p>No pitches yet.</p>}
      <ul className="space-y-4">
        {pitches.map((pitch) => (
          <li key={pitch.id} className="border rounded p-4">
            <h3 className="text-lg font-bold">{pitch.title}</h3>
            <p>{pitch.description}</p>
            {pitch.video_url && (
              <p className="text-blue-600 text-sm mt-1">
                <a href={pitch.video_url} target="_blank" rel="noreferrer">
                  Watch Video
                </a>
              </p>
            )}
            <p className="text-sm mt-2 text-gray-500">
              Funding Goal: ${pitch.funding_goal}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
