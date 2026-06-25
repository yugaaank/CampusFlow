'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'

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
      <div className="text-center text-sm font-medium mt-6" style={{ color: 'var(--color-ink-2)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--color-accent)' }}>
          Sign in
        </Link>
      </div>
    </AuthLayout>
  )
}
