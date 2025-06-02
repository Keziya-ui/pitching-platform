import { supabase } from './supabaseClient'

export async function getUserProfile() {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}
