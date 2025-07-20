'use client'

import React from 'react'
import { Button } from '../components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#dbeafe] via-[#f0fdfa] to-[#ede9fe] px-6 py-20 flex flex-col items-center font-sans">
      <section className="max-w-4xl text-center space-y-7">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] shadow-md mb-2">
          <Sparkles className="w-8 h-8 text-[#6366f1]" />
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
          Track Your Emotions, Discover Your Mind 🌿
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-xl max-w-2xl mx-auto">
          Your personal mental health companion — track moods, write journals, and get AI-backed well-being tips.
        </p>
        <p className="text-base text-slate-400 dark:text-slate-500 italic max-w-xl mx-auto">
          "A calm mind is the ultimate weapon against your challenges."
        </p>
        <Link href="/login">
          <Button className="mt-4 text-slate-800 bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition text-lg px-8 py-4 rounded-2xl shadow-lg font-semibold">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      <section className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl w-full">
        <FeatureCard
          title="🌤️ Daily Mood Check-Ins"
          description="Record how you feel each day to spot patterns and progress."
        />
        <FeatureCard
          title="🧠 Smart Suggestions"
          description="Get personalized wellness tips based on your mood and habits."
        />
        <FeatureCard
          title="📔 Private Journaling"
          description="Write freely and reflect with secure, cloud-synced journals."
        />
      </section>

      <footer className="mt-32 w-full flex flex-col items-center">
        <div className="w-full max-w-5xl border-t border-slate-200 dark:border-slate-700 mb-4"></div>
        <span className="text-slate-400 dark:text-slate-500 text-sm">
          © 2025 MindfulTrack. All rights reserved.
        </span>
      </footer>
    </main>
  )
}

function FeatureCard({ title, description }) {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 text-center space-y-3 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all">
      <h3 className="text-xl font-semibold text-slate-700 dark:text-white">{title}</h3>
      <p className="text-base text-slate-500 dark:text-slate-300">{description}</p>
    </div>
  )
}
