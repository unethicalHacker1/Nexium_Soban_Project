'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Toaster, toast } from 'sonner'
import { UserPlus, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  const router = useRouter()

  // This flow creates a user with email+password, sends a verification email,
  // and only allows login after the user verifies their email.
  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        // Make sure this URL is allowed in your Supabase Auth settings
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (error) {
      toast.error('Signup failed: ' + error.message)
    } else {
      setSignedUp(true)
      toast.success('Verification email sent! Please check your inbox.')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#dbeafe] via-[#f0fdfa] to-[#ede9fe] px-4">
      <Toaster position="top-center" richColors />
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-7 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center"
      >
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] shadow-md mb-2">
          <UserPlus className="w-8 h-8 text-[#6366f1]" />
        </span>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white text-center tracking-tight">Create your account</h1>
        <p className="text-slate-500 dark:text-slate-300 text-base text-center max-w-xs mb-2">
          Join your mindful journey. Sign up to start tracking your well-being.
        </p>
        <Input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#a7f3d0] transition placeholder:text-slate-400 py-3"
        />
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#a7f3d0] transition placeholder:text-slate-400 py-3"
        />
        <div className="relative w-full">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-[#a7f3d0] focus:border-[#a7f3d0] transition placeholder:text-slate-400 py-3 pr-10"
            autoComplete="new-password"
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
        <Button
          type="submit"
          disabled={loading || signedUp}
          className="w-full py-3 rounded-xl bg-gradient-to-tr from-[#a7f3d0] via-[#c7d2fe] to-[#fbcfe8] text-slate-800 font-semibold shadow-md hover:from-[#c7d2fe] hover:to-[#a7f3d0] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing up...' : signedUp ? 'Verification Sent' : 'Sign Up'}
        </Button>
        <p className="text-xs text-center text-slate-400 dark:text-slate-500 pt-2">
          {signedUp ? (
            <>
              Verification email sent! Please check your inbox.<br />
              <span className="italic">You will be redirected to login shortly.</span>
            </>
          ) : (
            <>
              You’ll receive a secure sign-in link in your inbox.<br />
              <span className="italic">Welcome to a calmer you 🌱</span>
            </>
          )}
        </p>
        <div className="text-center pt-2">
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-[#6366f1] hover:underline font-semibold">Login</a>
          </span>
        </div>
      </form>
    </main>
  )
}
