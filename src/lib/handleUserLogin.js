import { supabase } from './supabase'

export async function insertOrUpdateUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return

  const { email, user_metadata } = user
  const fullName = user_metadata?.full_name || ''

  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
    email,
  })
}
