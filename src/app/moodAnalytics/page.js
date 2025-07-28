'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { BarChart3, ArrowLeft, TrendingUp, Calendar, Smile, Activity, Eye, EyeOff } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Color palette for different moods
const MOOD_COLORS = {
  happy: '#10b981',
  sad: '#3b82f6',
  anxious: '#f59e0b',
  excited: '#ef4444',
  calm: '#8b5cf6',
  angry: '#dc2626',
  neutral: '#6b7280',
  default: '#6366f1'
}

export default function AnalyticsPage() {
  const [moodData, setMoodData] = useState([])
  const [weeklyTrend, setWeeklyTrend] = useState([])
  const [totalEntries, setTotalEntries] = useState(0)
  const [dominantMood, setDominantMood] = useState('')
  const [viewMode, setViewMode] = useState('bar') // 'bar', 'pie', 'trend'
  const [isDataVisible, setIsDataVisible] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMoods = async () => {
      const { data, error } = await supabase.from('mood_checkins').select('*')
      if (error) {
        console.error('Error fetching mood data:', error)
        return
      }

      // Process mood counts
      const moodCount = data.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
        return acc
      }, {})

      const chartData = Object.entries(moodCount).map(([mood, count]) => ({
        mood,
        count,
        color: MOOD_COLORS[mood.toLowerCase()] || MOOD_COLORS.default
      }))

      // Sort by count for better visualization
      chartData.sort((a, b) => b.count - a.count)

      setMoodData(chartData)
      setTotalEntries(data.length)
      setDominantMood(chartData[0]?.mood || 'None')

      // Process weekly trend (last 7 days)
      const last7Days = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayEntries = data.filter(entry => 
          entry.created_at && entry.created_at.startsWith(dateStr)
        )
        last7Days.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          entries: dayEntries.length,
          date: dateStr
        })
      }
      setWeeklyTrend(last7Days)
    }

    fetchMoods()
  }, [])

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  const ChartToggle = ({ mode, currentMode, icon: Icon, label, onClick }) => (
    <button
      onClick={() => onClick(mode)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
        currentMode === mode
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
          : 'bg-white/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-700/90'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/20">
          <p className="font-semibold text-slate-800 dark:text-white">{`${label}: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    if (moodData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Activity className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No mood data yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Start tracking your moods to see analytics</p>
        </div>
      )
    }

    switch (viewMode) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={moodData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="count"
              >
                {moodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )
      
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="entries" 
                stroke="#6366f1" 
                strokeWidth={3}
                fill="url(#colorEntries)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )
    
      default:
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={moodData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="mood" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="url(#barGradient)" 
                radius={[8, 8, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0fdfa] to-[#fce7f3] px-4 py-8 relative overflow-x-hidden">
      
      {/* Soft animated background pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30 animate-float-bg">
        <svg width="100%" height="100%" className="absolute inset-0" style={{ minHeight: '100vh' }}>
          <circle cx="20%" cy="20%" r="120" fill="#a7f3d0" fillOpacity="0.18" />
          <circle cx="80%" cy="30%" r="90" fill="#c7d2fe" fillOpacity="0.13" />
          <circle cx="60%" cy="80%" r="110" fill="#fbcfe8" fillOpacity="0.12" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 rounded-xl bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold shadow-md hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  Mood Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Track your emotional journey</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsDataVisible(!isDataVisible)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isDataVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {isDataVisible ? 'Hide' : 'Show'} Data
          </button>
        </div>

        {isDataVisible && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={Activity}
                title="Total Entries"
                value={totalEntries}
                subtitle="mood check-ins logged"
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                icon={TrendingUp}
                title="Most Frequent"
                value={dominantMood}
                subtitle="dominant mood"
                color="from-green-500 to-green-600"
              />
              <StatCard
                icon={Calendar}
                title="This Week"
                value={weeklyTrend.reduce((sum, day) => sum + day.entries, 0)}
                subtitle="entries logged"
                color="from-purple-500 to-purple-600"
              />
            </div>

            {/* Chart Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <ChartToggle
                mode="bar"
                currentMode={viewMode}
                icon={BarChart3}
                label="Bar Chart"
                onClick={setViewMode}
              />
              <ChartToggle
                mode="pie"
                currentMode={viewMode}
                icon={Smile}
                label="Pie Chart"
                onClick={setViewMode}
              />
              <ChartToggle
                mode="trend"
                currentMode={viewMode}
                icon={TrendingUp}
                label="Weekly Trend"
                onClick={setViewMode}
              />
            </div>

            {/* Main Chart */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  {viewMode === 'bar' && 'Mood Distribution'}
                  {viewMode === 'pie' && 'Mood Breakdown'}
                  {viewMode === 'trend' && 'Weekly Activity'}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {viewMode === 'bar' && 'Your emotional patterns visualized as a bar chart'}
                  {viewMode === 'pie' && 'Proportional view of your mood entries'}
                  {viewMode === 'trend' && 'Daily check-in frequency over the past week'}
                </p>
              </div>
              
              {renderChart()}
            </div>

            {/* Mood Legend for Pie Chart */}
            {viewMode === 'pie' && moodData.length > 0 && (
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Mood Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {moodData.map((mood, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: mood.color }}
                      ></div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium capitalize">
                        {mood.mood} ({mood.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
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