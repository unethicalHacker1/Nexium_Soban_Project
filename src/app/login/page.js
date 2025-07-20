'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { toast } from 'sonner'
import { Mail, Heart, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Login failed', {
        description: error.message,
        position: 'top-center',
      })
    } else {
      toast.success('Login successful!', {
        description: 'Redirecting to your dashboard...',
        position: 'top-center',
      })
      setTimeout(() => {
        router.push('/dashboard')
      }, 1200)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-tr from-[#dbeafe] via-[#f0fdfa] to-[#ede9fe]">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl bg-white/60 backdrop-blur-lg ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
        <CardContent className="p-10 space-y-8">
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] shadow-md">
              <Heart className="w-8 h-8 text-[#6366f1]" fill="#a7f3d0" />
            </span>
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-300 text-base mt-1 text-center max-w-xs">
              Take a deep breath. Your mindful journey starts here.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10 py-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#a7f3d0] transition placeholder:text-slate-400"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="py-3 pr-10 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#a7f3d0] transition placeholder:text-slate-400"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold shadow-md hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#6366f1] hover:underline font-semibold">Sign up</Link>
            </span>
          </div>

          <p className="text-xs text-center text-slate-400 dark:text-slate-500 pt-4">
            <span className="italic">Wishing you a peaceful day 🌱</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
