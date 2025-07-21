import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { user_id } = await req.json()
    if (!user_id) {
      return NextResponse.json({ success: false, error: 'Missing user_id.' }, { status: 400 })
    }

    // Fetch all check-ins for the user, sorted descending
    const { data: moods, error } = await supabase
      .from('mood_checkins')
      .select('created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!moods || moods.length === 0) {
      return NextResponse.json({ success: true, streak: 0 })
    }

    // Convert to set of YYYY-MM-DD strings
    const checkinDays = new Set(
      moods.map(m => new Date(m.created_at).toISOString().slice(0, 10))
    )

    // Calculate streak from today backwards
    let streak = 0
    let current = new Date()
    current.setHours(0,0,0,0)
    while (true) {
      const dayStr = current.toISOString().slice(0, 10)
      if (checkinDays.has(dayStr)) {
        streak++
        // Go to previous day
        current.setDate(current.getDate() - 1)
      } else {
        break
      }
    }

    return NextResponse.json({ success: true, streak })
  } catch (err) {
    console.error('Error in streak API:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
} 