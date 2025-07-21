'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Sparkles } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { supabase } from '../../lib/supabase'

const moods = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Sad', emoji: '😢' },
  { label: 'Anxious', emoji: '😰' },
  { label: 'Angry', emoji: '😡' },
  { label: 'Calm', emoji: '😌' },
  { label: 'Neutral', emoji: '😐' },
]

export default function MoodCheckinPage() {
  const [selectedMood, setSelectedMood] = useState(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [wellnessTip, setWellnessTip] = useState('')
  const [userId, setUserId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    getUser();
  }, []);

  const handleSubmit = async () => {
    if (!selectedMood) return toast.error('Please select a mood.')
    if (!userId) return toast.error('User not loaded.')
    setLoading(true)

    try {
      const res = await fetch('/api/mood-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, mood: selectedMood, note }),
      })

      const result = await res.json()

      if (!result.success) throw new Error(result.error)

      setWellnessTip(result.data.wellness_tip)
      toast.success('Your response has been submitted!')
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      toast.error('Error saving mood.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => setSelectedMood(null)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#dbeafe] via-[#f0fdfa] to-[#ede9fe] scroll-smooth">
      <Toaster position="top-center" richColors />
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl px-6 py-7 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center animate-fade-in relative">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] shadow-lg mb-2">
          <Sparkles className="w-7 h-7 text-[#6366f1]" />
        </span>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white text-center mb-1 tracking-tight">Mood Check-In</h1>
        <p className="text-slate-500 dark:text-slate-300 text-center mb-4 text-base max-w-xs">How are you feeling today? Take a moment to reflect and choose the mood that best matches your day.</p>

        {!submitted ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {moods.map((m) => (
                <button
                  key={m.label}
                  className={`transition-all duration-200 p-4 rounded-full text-3xl border-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#a7f3d0] hover:scale-110 hover:shadow-xl
                    ${selectedMood === m.label ? 'bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] border-[#a7f3d0] scale-110 ring-2 ring-[#a7f3d0]' : 'bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100'}`}
                  onClick={() => setSelectedMood(m.label)}
                  aria-label={m.label}
                >
                  <span className="block animate-bounce-slow" style={{ animationPlayState: selectedMood === m.label ? 'paused' : 'running' }}>{m.emoji}</span>
                </button>
              ))}
            </div>
            {selectedMood && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="mb-4 px-4 py-2 rounded-full border border-[#a7f3d0] text-[#6366f1] bg-white/70 hover:bg-[#a7f3d0]/30 transition"
              >
                Clear Selection
              </Button>
            )}
            <Textarea
              placeholder="Add a note (optional)..."
              className="w-full mb-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#a7f3d0] transition placeholder:text-slate-400 min-h-[80px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !userId}
              className="w-full py-2 rounded-xl bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold shadow-md hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Submit'}
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-lg font-semibold text-slate-700 dark:text-white mb-2 text-center">Thank you for checking in!</div>
            <div className="text-slate-500 dark:text-slate-300 text-center mb-4 text-base">Your mood and tip are saved.</div>
            {wellnessTip && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-[#a7f3d0] shadow-inner text-sm text-slate-700 dark:text-slate-200 text-center mb-4">
                <p className="font-semibold mb-1">Wellness Tip:</p>
                <p className="italic">“{wellnessTip}”</p>
              </div>
            )}
            <Button
              className="w-full py-2 rounded-xl bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold shadow-md hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
      <div className="mt-6 text-center text-slate-400 dark:text-slate-500 text-base italic">
        Every feeling is valid. Thank you for checking in with yourself today 🌱
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.2s infinite;
        }
      `}</style>
    </main>
  )
}
