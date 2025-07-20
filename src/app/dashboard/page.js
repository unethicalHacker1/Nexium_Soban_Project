'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { insertOrUpdateUser } from '../../lib/handleUserLogin'
import { Flower2, Smile, BookOpen, Sparkles, Flame, User, LogOut, Bell } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [moodHistory, setMoodHistory] = useState([])
  const [showReminder, setShowReminder] = useState(false)
  const router = useRouter()

  const streakRef = useRef(null)
  const historyRef = useRef(null)
  const featuresRef = useRef(null)
  const [streakVisible, setStreakVisible] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (!error && data?.user) {
        setUser(data.user)
        await insertOrUpdateUser()
        await fetchMoodHistory(data.user.id)
      } else {
        router.push('/login')
      }
    }
    checkUser()
  }, [])

  const fetchMoodHistory = async (userId) => {
    const { data: moods, error } = await supabase
      .from('mood_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(7)

    if (!error) {
      setMoodHistory(moods)
      // Improved: Check if the user has checked in today (local date, robust)
      const today = new Date();
      const hasCheckedInToday = moods && moods.some(m => {
        if (!m.created_at) return false;
        const checkinDate = new Date(m.created_at);
        return (
          checkinDate.getFullYear() === today.getFullYear() &&
          checkinDate.getMonth() === today.getMonth() &&
          checkinDate.getDate() === today.getDate()
        );
      });
      setShowReminder(!hasCheckedInToday);
    }
  }

  useEffect(() => {
    const reveal = (ref, setVisible) => {
      if (!ref.current) return
      const observer = new window.IntersectionObserver(
        ([entry]) => setVisible(entry.isIntersecting),
        { threshold: 0.2 }
      )
      observer.observe(ref.current)
      return () => observer.disconnect()
    }
    const streakCleanup = reveal(streakRef, setStreakVisible)
    const historyCleanup = reveal(historyRef, setHistoryVisible)
    const featuresCleanup = reveal(featuresRef, setFeaturesVisible)
    return () => {
      if (streakCleanup) streakCleanup()
      if (historyCleanup) historyCleanup()
      if (featuresCleanup) featuresCleanup()
    }
  }, [])

  const fullName = user?.user_metadata?.full_name || 'Mindful Friend'
  const greeting = getTimeBasedGreeting()

  const handleMoodCheckIn = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e0e7ff] via-[#f0fdfa] to-[#fce7f3] scroll-smooth relative overflow-x-hidden">
      {/* Soft animated background pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30 animate-float-bg">
        <svg width="100%" height="100%" className="absolute inset-0" style={{ minHeight: '100vh' }}>
          <circle cx="20%" cy="20%" r="120" fill="#a7f3d0" fillOpacity="0.18" />
          <circle cx="80%" cy="30%" r="90" fill="#c7d2fe" fillOpacity="0.13" />
          <circle cx="60%" cy="80%" r="110" fill="#fbcfe8" fillOpacity="0.12" />
        </svg>
      </div>
      <Navbar fullName={fullName} />
      <main className="flex-1 flex flex-col items-center py-16 px-4 relative z-10">
        {/* Mood Check-In Reminder */}
        {showReminder && (
          <div className="w-full max-w-2xl mb-8 flex items-center justify-center gap-4 bg-gradient-to-tr from-[#a7f3d0]/60 via-[#c7d2fe]/60 to-[#fbcfe8]/60 border border-[#a7f3d0]/30 shadow-lg rounded-2xl px-6 py-4 animate-reminder-bounce">
            <Bell className="w-7 h-7 text-[#6366f1] animate-pulse" />
            <span className="text-lg md:text-xl font-semibold text-slate-700 dark:text-white">Don't forget to check in your mood today for better insights!</span>
            <button
              className="ml-4 px-4 py-2 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold shadow hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition focus:outline-none"
              onClick={handleMoodCheckIn}
            >
              Check In Now
            </button>
          </div>
        )}
        <div className="w-full max-w-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-12 flex flex-col items-center text-center mb-12 animate-fade-in">
          <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] shadow-lg mb-6">
            <Flower2 className="w-10 h-10 text-[#6366f1]" />
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-[#6366f1] via-[#a7f3d0] to-[#fbcfe8] mb-3 tracking-tight animate-gradient-text">
            {greeting}, {fullName} <span className="align-middle">🌿</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-2">
            This is your peaceful space to track your mood, reflect, and nurture your mental wellness—one mindful moment at a time.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] rounded-full my-6 opacity-70" />
        </div>

        {/* Mood Streak */}
        <div
          ref={streakRef}
          className={`w-full max-w-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-xl p-7 mb-8 flex items-center justify-center gap-4 border border-slate-100 dark:border-slate-800 transition-all duration-700 animate-fade-in-up ${streakVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <Flame className="w-7 h-7 text-orange-500 animate-pulse" />
          <span className="text-slate-700 dark:text-white text-lg md:text-xl font-medium">Your current streak: <strong>3 days</strong> 🔥 Keep glowing!</span>
        </div>

        {/* Divider */}
        <div className="w-16 h-1 bg-gradient-to-r from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] rounded-full my-4 opacity-60" />

        {/* Mood History */}
        <div
          ref={historyRef}
          className={`w-full max-w-2xl mb-16 bg-white/90 dark:bg-slate-900/80 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 transition-all duration-700 animate-fade-in-up ${historyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-2xl font-bold text-slate-700 dark:text-white mb-4">Recent Mood Check-ins</h2>
          {moodHistory.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-300">No check-ins yet.</p>
          ) : (
            <ul className="space-y-4 max-h-72 overflow-y-auto pr-2">
              {moodHistory.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-lg font-semibold text-slate-700 dark:text-white">
                      {getMoodEmoji(entry.mood)} {capitalize(entry.mood)}
                    </p>
                    {entry.note && <p className="text-slate-500 dark:text-slate-300 mt-1 text-sm">{entry.note}</p>}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(entry.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Feature Cards */}
        <div
          ref={featuresRef}
          className={`w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-10 transition-all duration-700 animate-fade-in-up ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <FeatureCard
            icon={<Smile className="w-10 h-10 text-[#38bdf8] mx-auto" />}
            title="Mood Check-In"
            description="Track your feelings and discover emotional trends."
            buttonText="Start Check-In"
            onClick={() => router.push('/mood-checkin')}
          />
          <FeatureCard
            icon={<BookOpen className="w-10 h-10 text-[#a78bfa] mx-auto" />}
            title="Daily Journal"
            description="Write freely and reflect to gain clarity and peace."
            buttonText="Write Journal"
          />
          <FeatureCard
            icon={<Sparkles className="w-10 h-10 text-[#34d399] mx-auto" />}
            title="Wellness Tips"
            description="Explore healthy suggestions to support your mood."
            buttonText="View Tips"
          />
        </div>
      </main>
      <Footer />
      <style jsx global>{`
        .animate-fade-in-up {
          opacity: 0;
          transform: translateY(32px);
          animation: fadeInUp 1.1s cubic-bezier(.4,0,.2,1) forwards;
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradientMove 3.5s ease-in-out infinite alternate;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-reminder-bounce {
          animation: reminderBounce 1.6s infinite alternate cubic-bezier(.4,0,.2,1);
        }
        @keyframes reminderBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }
        .animate-float-bg {
          animation: floatBg 12s ease-in-out infinite alternate;
        }
        @keyframes floatBg {
          0% { transform: translateY(0); }
          100% { transform: translateY(-30px); }
        }
      `}</style>
    </div>
  )
}

function Navbar({ fullName }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-lg border-b border-slate-200 dark:border-slate-800 py-3 px-6 flex items-center justify-between sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] shadow">
          <Flower2 className="w-7 h-7 text-[#6366f1]" />
        </span>
        <span className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight ml-2">MindfulTrack</span>
      </div>
      <div className="flex items-center gap-6">
        <NavLink href="/dashboard" label="Dashboard" icon={<Smile className="w-5 h-5" />} />
        <NavLink href="#" label="Journal" icon={<BookOpen className="w-5 h-5" />} />
        <NavLink href="/mood-checkin" label="Mood" icon={<Flame className="w-5 h-5" />} />
        <NavLink href="#" label="Tips" icon={<Sparkles className="w-5 h-5" />} />
        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] px-3 py-1 shadow hover:scale-105 transition focus:outline-none"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <User className="w-6 h-6 text-[#6366f1]" />
            <span className="hidden md:inline text-slate-700 dark:text-white font-medium">{fullName}</span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white/90 dark:bg-slate-900/90 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-2 z-50 animate-fade-in">
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, label, icon }) {
  const isActive = label === 'Dashboard'
  return (
    <a
      href={href}
      className={`flex items-center gap-1 px-4 py-2 rounded-full font-medium text-base transition-all
        ${isActive ? 'bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 shadow' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
      {icon} <span className="hidden sm:inline">{label}</span>
    </a>
  )
}

function FeatureCard({ icon, title, description, buttonText, onClick }) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-xl p-10 text-center space-y-5 border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all flex flex-col items-center">
      {icon}
      <h3 className="text-2xl font-semibold text-slate-700 dark:text-white mb-1">{title}</h3>
      <p className="text-base md:text-lg text-slate-500 dark:text-slate-300">{description}</p>
      <button
        className="mt-3 bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] hover:from-[#c7d2fe] hover:to-[#a7f3d0] text-slate-800 text-base font-semibold py-2 px-6 rounded-xl shadow transition-all focus:outline-none focus:ring-2 focus:ring-[#a7f3d0]"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </div>
  )
}

function Footer() {
  return (
    <footer className="w-full mt-16 py-6 flex flex-col items-center text-center text-slate-400 dark:text-slate-500 text-sm bg-transparent">
      <div className="w-16 h-1 bg-gradient-to-r from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] rounded-full mb-4 opacity-60" />
      <div>Take care of your mind, one day at a time 🌱</div>
      <div className="mt-2">© {new Date().getFullYear()} MindfulTrack. All rights reserved.</div>
    </footer>
  )
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getMoodEmoji(mood) {
    switch ((mood || '').toLowerCase().trim()) {
      case 'happy': return '😊'
      case 'sad': return '😢'
      case 'anxious': return '😰'
      case 'angry': return '😡'
      case 'calm': return '😌'
      case 'neutral': return '😐'
      default: return '🤔'
    }
  }
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
