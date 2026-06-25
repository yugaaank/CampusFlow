'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your account.">
      <div className="space-y-6">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all border flex justify-center items-center gap-2 hover:opacity-80 disabled:opacity-70"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)', borderColor: 'var(--color-rule)' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" style={{ borderColor: 'var(--color-rule)' }} />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2" style={{ color: 'var(--color-muted)' }}>Or continue with</span>
          </div>
        </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div
            className="p-4 text-sm font-medium rounded-lg border"
            style={{
              backgroundColor: 'oklch(60% 0.20 25 / 0.08)',
              color: 'var(--destructive)',
              borderColor: 'oklch(60% 0.20 25 / 0.15)',
            }}
          >
            {error}
          </div>
        )}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
              style={{
                backgroundColor: 'var(--color-paper)',
                borderColor: 'var(--color-rule)',
                color: 'var(--color-ink)',
              }}
              placeholder="student@college.edu"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Password</label>
              <Link href="/forgot-password" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--color-accent)' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
              style={{
                backgroundColor: 'var(--color-paper)',
                borderColor: 'var(--color-rule)',
                color: 'var(--color-ink)',
              }}
              placeholder="••••••••"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-foreground)' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--primary-foreground)', borderTopColor: 'transparent' }} />
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      </div>
      <div className="text-center mt-6 text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--color-accent)' }}>
          Create one now
        </Link>
      </div>
    </AuthLayout>
  )
}
