'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ExternalLink, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { calendarApi } from '@/lib/api/integrations'
import Link from 'next/link'

export default function CalendarPage() {
  const [status, setStatus] = useState<{ connected: boolean; email: string | null }>({ connected: false, email: null })
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const res = await calendarApi.getStatus()
      setStatus({ connected: res.connected, email: res.email })
    } catch {
      setStatus({ connected: false, email: null })
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await calendarApi.getAuthUrl()
      window.location.href = res.url
    } catch {
      setConnecting(false)
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-10">
      <div className="space-y-1">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium mb-4 hover:opacity-70 transition-opacity" style={{ color: 'var(--color-ink-2)' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-ink)' }}>
          Calendar
        </h1>
        <p className="text-base" style={{ color: 'var(--color-ink-2)' }}>
          Manage your Google Calendar integration
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-accent)' }} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-8 space-y-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'oklch(55% 0.18 240 / 0.1)' }}>
              <Calendar className="w-7 h-7" style={{ color: 'oklch(50% 0.18 240)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>Google Calendar</h2>
              <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
                {status.connected
                  ? `Connected as ${status.email}`
                  : 'Sync your tasks as Google Calendar events automatically'}
              </p>
            </div>
            <div className="ml-auto">
              {status.connected ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'oklch(65% 0.15 150 / 0.15)', color: 'oklch(45% 0.15 150)' }}>
                  <CheckCircle className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'oklch(60% 0.20 25 / 0.1)', color: 'var(--destructive)' }}>
                  <XCircle className="w-3 h-3" /> Not connected
                </span>
              )}
            </div>
          </div>

          {!status.connected && (
            <div className="space-y-4 pt-2">
              <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
                When you create a task with the &quot;Add to Google Calendar&quot; toggle enabled, a calendar event will automatically be created. Connect your Google account to enable this feature.
              </p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'oklch(50% 0.18 240)', color: '#fff' }}
              >
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Connect Google Calendar
              </button>
            </div>
          )}

          {status.connected && (
            <div className="pt-2 space-y-3">
              <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
                Your Google Calendar is connected. When you enable &quot;Add to Google Calendar&quot; on any task with a deadline, a 1-hour calendar event will be created automatically at the deadline time.
              </p>
              <Link
                href="/dashboard/tasks"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-foreground)' }}
              >
                Go to Tasks
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
