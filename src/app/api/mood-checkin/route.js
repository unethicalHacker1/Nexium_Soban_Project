import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // use service_role for inserting/updating
)

export async function POST(req) {
  try {
    const { user_id, mood, note } = await req.json()

    // 1. Insert new mood check-in
    const { data: inserted, error: insertError } = await supabase
      .from('mood_checkins')
      .insert([{ user_id, mood, note }])
      .select()
      .single()

    if (insertError) throw insertError

    // 2. Generate wellness tip using Groq Llama 3
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
      console.log('Groq API result:', result)
      wellnessTip = result?.choices?.[0]?.message?.content || wellnessTip
    } else {
      const errorBody = await response.text()
      console.error('Groq API error:', response.status, errorBody)
    }

    // 3. Update the same check-in with the generated tip
    await supabase
      .from('mood_checkins')
      .update({ wellness_tip: wellnessTip })
      .eq('id', inserted.id)

    return NextResponse.json({ success: true, data: { ...inserted, wellness_tip: wellnessTip } })
  } catch (err) {
    console.error('Error in mood-checkin API:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
