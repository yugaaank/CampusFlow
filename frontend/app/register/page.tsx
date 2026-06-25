'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { createClient } from '@/utils/supabase/client'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    branch: '',
    year: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year) || 1,
          subjects: []
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to register')
      }

      router.push('/login?registered=true')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create an account" subtitle="Join CampusFlow and boost your productivity.">
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
          Sign up with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" style={{ borderColor: 'var(--color-rule)' }} />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2" style={{ color: 'var(--color-muted)' }}>Or continue with</span>
          </div>
        </div>

      <form onSubmit={handleRegister} className="space-y-5">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
              style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
              style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Email address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
            style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
            style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Branch</label>
            <input
              type="text"
              required
              value={formData.branch}
              onChange={(e) => setFormData({...formData, branch: e.target.value})}
              placeholder="e.g. CSE"
              className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
              style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Year</label>
            <input
              type="number"
              min="1" max="5"
              required
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
              placeholder="e.g. 3"
              className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm"
              style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 mt-4 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-foreground)' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--primary-foreground)', borderTopColor: 'transparent' }} />
          ) : (
            'Sign Up'
          )}
        </button>
      </form>
      </div>
      <div className="text-center text-sm font-medium mt-6" style={{ color: 'var(--color-ink-2)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--color-accent)' }}>
          Sign in
        </Link>
      </div>
    </AuthLayout>
  )
}
