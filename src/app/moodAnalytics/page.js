'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { BarChart3, ArrowLeft } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AnalyticsPage() {
  const [moodData, setMoodData] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchMoods = async () => {
      const { data, error } = await supabase.from('mood_checkins').select('*')
      if (error) {
        console.error('Error fetching mood data:', error)
        return
      }

      const moodCount = data.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
        return acc
      }, {})

      const chartData = Object.entries(moodCount).map(([mood, count]) => ({
        mood,
        count,
      }))

      setMoodData(chartData)
    }

    fetchMoods()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#e0e7ff] via-[#f0fdfa] to-[#fce7f3] px-4 py-12 animate-fade-in">

      {/* Background Bubbles */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 animate-float-bg">
        <svg width="100%" height="100%" className="absolute inset-0" style={{ minHeight: '100vh' }}>
          <circle cx="15%" cy="25%" r="110" fill="#a7f3d0" fillOpacity="0.16" />
          <circle cx="85%" cy="30%" r="90" fill="#c7d2fe" fillOpacity="0.13" />
          <circle cx="60%" cy="85%" r="100" fill="#fbcfe8" fillOpacity="0.12" />
        </svg>
      </div>

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center gap-4 mb-10 relative z-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold shadow hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] shadow">
          <BarChart3 className="w-8 h-8 text-[#6366f1]" />
        </span>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-[#6366f1] via-[#a7f3d0] to-[#fbcfe8] tracking-tight ml-2 drop-shadow animate-gradient-text">
          Mood Analytics
        </h1>
      </div>

      <p className="text-slate-600 dark:text-slate-300 text-base text-center mb-6 max-w-2xl mx-auto leading-relaxed relative z-10">
        <strong>Your moods visualized:</strong> This chart helps you understand your emotional patterns over time.
        <br />
        Each entry you’ve logged contributes to these insights.
      </p>

      {/* Chart */}
      <div className="w-full max-w-2xl bg-white/90 dark:bg-slate-900/80 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 z-10">
        {moodData.length === 0 ? (
          <p className="text-center text-slate-500">No mood data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moodData}>
              <XAxis dataKey="mood" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Animations */}
      <style jsx global>{`
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1.2s ease-out forwards;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradientMove 3.5s ease-in-out infinite alternate;
        }
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        .animate-float-bg {
          animation: floatBg 12s ease-in-out infinite alternate;
        }
        @keyframes floatBg {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-30px);
          }
        }
      `}</style>
    </div>
  )
}
