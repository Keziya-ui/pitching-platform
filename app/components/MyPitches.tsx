'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function MyPitches() {
  const [pitches, setPitches] = useState([])

  useEffect(() => {
    const fetchMyPitches = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data, error } = await supabase
        .from('pitches')
        .select('*')
        .eq('founder_id', userData.user.id)

      if (error) console.error(error)
      else setPitches(data)
    }

    fetchMyPitches()
  }, [])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('pitches').delete().eq('id', id)
    if (!error) setPitches((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">My Pitches</h2>
      {pitches.map((pitch) => (
        <div key={pitch.id} className="p-4 border rounded space-y-2">
          <h3 className="text-lg font-semibold">{pitch.title}</h3>
          <p>{pitch.description}</p>
          <p className="text-sm text-gray-600">Goal: ${pitch.funding_goal}</p>
          <p className="text-sm text-gray-500">Tags: {pitch.tags?.join(', ')}</p>
          <div className="space-x-2">
            {/* Add Edit button later */}
            <button onClick={() => handleDelete(pitch.id)} className="text-red-600 hover:underline">Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
