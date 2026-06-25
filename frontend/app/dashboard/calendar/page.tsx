'use client'

import { Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CalendarPage() {
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
          Manage your schedule and events.
        </p>
      </div>

      <div
        className="rounded-xl border p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-4"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'oklch(55% 0.18 240 / 0.1)' }}>
          <Calendar className="w-8 h-8" style={{ color: 'oklch(50% 0.18 240)' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>Calendar Integration</h2>
          <p className="text-sm mt-2 max-w-md" style={{ color: 'var(--color-ink-2)' }}>
            Calendar integration is not yet completed. This feature will allow you to sync your tasks and deadlines with Google Calendar and manage your schedule in one place.
          </p>
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: 'oklch(60% 0.20 25 / 0.08)', color: 'var(--destructive)' }}
        >
          Coming Soon
        </div>
      </div>
    </div>
  )
}
