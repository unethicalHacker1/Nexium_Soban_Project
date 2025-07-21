import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { id, mood } = await req.json()
    if (!id || !mood) {
      return NextResponse.json({ success: false, error: 'Missing id or mood.' }, { status: 400 })
    }

    // Generate new wellness tip
    const prompt = `The user is feeling ${mood}.
Give a short, practical wellness tip to help improve their mental well-being.
Format the tip as follows:
- Start with a bold, friendly title (e.g., “🌱 Mindful Breathing”)
- Write 1–2 sentences of actionable advice, clear and concise.
- End with a positive emoji.
Keep it under 100 words, and avoid long explanations.`
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    let wellnessTip = 'Remember to breathe and be gentle with yourself today. 💚'
    if (response.ok) {
      const result = await response.json()
      wellnessTip = result?.choices?.[0]?.message?.content || wellnessTip
    } else {
      const errorBody = await response.text()
      console.error('Groq API error:', response.status, errorBody)
    }

    // Update the mood_checkin entry
    const { data, error } = await supabase
      .from('mood_checkins')
      .update({ wellness_tip: wellnessTip })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Error in regenerate API:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
} 