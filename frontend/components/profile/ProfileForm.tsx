'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Save, User, Loader2, Calendar, MessageSquare, ExternalLink, Trash2, CheckCircle, XCircle, Send } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calendarApi, whatsappApi } from '@/lib/api/integrations'

interface Profile {
  name?: string | null
  phone?: string | null
  branch?: string | null
  year?: number | null
  subjects?: string[] | null
  google_calendar_email?: string | null
  google_calendar_refresh_token?: string | null
}

interface ProfileFormProps {
  userId: string
  email: string
  initialProfile: Profile
}

export function ProfileForm({ userId, email, initialProfile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialProfile?.name || '',
    phone: initialProfile?.phone || '',
    branch: initialProfile?.branch || '',
    year: initialProfile?.year?.toString() || '',
    subjects: initialProfile?.subjects?.join(', ') || ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [calendarStatus, setCalendarStatus] = useState<{ connected: boolean; email: string | null }>({ connected: false, email: null })
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [whatsappLoading, setWhatsappLoading] = useState(false)
  const [whatsappMsg, setWhatsappMsg] = useState({ type: '', text: '' })
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    checkCalendarStatus()
    if (searchParams.get('calendar') === 'connected') {
      setMessage({ type: 'success', text: 'Google Calendar connected successfully!' })
    }
  }, [])

  const checkCalendarStatus = async () => {
    try {
      const res = await calendarApi.getStatus()
      setCalendarStatus({ connected: res.connected, email: res.email })
    } catch {
      setCalendarStatus({ connected: false, email: null })
    }
  }

  const handleConnectCalendar = async () => {
    setCalendarLoading(true)
    try {
      const res = await calendarApi.getAuthUrl()
      window.location.href = res.url
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to get calendar auth URL' })
    } finally {
      setCalendarLoading(false)
    }
  }

  const handleDisconnectCalendar = async () => {
    setCalendarLoading(true)
    try {
      await calendarApi.disconnect()
      setCalendarStatus({ connected: false, email: null })
      setMessage({ type: 'success', text: 'Google Calendar disconnected' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to disconnect' })
    } finally {
      setCalendarLoading(false)
    }
  }

  const handleSendWhatsAppTest = async () => {
    setWhatsappLoading(true)
    setWhatsappMsg({ type: '', text: '' })
    try {
      const res = await whatsappApi.sendTest()
      setWhatsappMsg({ type: 'success', text: res.message })
    } catch (err: any) {
      setWhatsappMsg({ type: 'error', text: err.message || 'Failed to send test message' })
    } finally {
      setWhatsappLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const subjectsArray = formData.subjects
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)

      const { error } = await (supabase as any)
        .from('profiles')
        .upsert({
          id: userId,
          name: formData.name,
          phone: formData.phone,
          branch: formData.branch,
          year: parseInt(formData.year) || null,
          subjects: subjectsArray,
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully.' })
      router.refresh()
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Info */}
      <div className="rounded-xl border p-6 md:p-8 space-y-8 shadow-sm transition-all" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}>
        <div className="flex items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--color-rule)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-foreground)' }}>
            {formData.name ? (
              <span className="text-2xl font-bold">{formData.name.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>{formData.name || 'Your Name'}</h2>
            <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>{email}</p>
          </div>
        </div>

        {message.text && (
          <div
            className="p-4 text-sm font-medium rounded-lg border"
            style={{
              backgroundColor: message.type === 'error' ? 'oklch(60% 0.20 25 / 0.08)' : 'oklch(65% 0.15 150 / 0.1)',
              color: message.type === 'error' ? 'var(--destructive)' : 'oklch(45% 0.15 150)',
              borderColor: message.type === 'error' ? 'oklch(60% 0.20 25 / 0.15)' : 'oklch(65% 0.15 150 / 0.2)',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm focus:ring-2 focus:ring-offset-1"
                style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Email Address (Read-only)</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm opacity-70 cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-paper-2)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="e.g. +1 234 567 890"
                className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm focus:ring-2 focus:ring-offset-1"
                style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Branch / Major</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm focus:ring-2 focus:ring-offset-1"
                style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Year of Study</label>
              <input
                type="number"
                min="1" max="10"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                placeholder="e.g. 3"
                className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm focus:ring-2 focus:ring-offset-1"
                style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Subjects (Comma-separated)</label>
            <input
              type="text"
              value={formData.subjects}
              onChange={(e) => setFormData({...formData, subjects: e.target.value})}
              placeholder="e.g. Data Structures, Operating Systems, Computer Networks"
              className="w-full px-4 py-3 rounded-lg border transition-all outline-none text-sm focus:ring-2 focus:ring-offset-1"
              style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-rule)', color: 'var(--color-ink)' }}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-foreground)' }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Google Calendar Integration */}
      <div className="rounded-xl border p-6 md:p-8 space-y-6 shadow-sm transition-all" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'oklch(55% 0.18 240 / 0.1)' }}>
              <Calendar className="w-5 h-5" style={{ color: 'oklch(50% 0.18 240)' }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>Google Calendar</h3>
              <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>Sync tasks as calendar events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {calendarStatus.connected ? (
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

        {calendarStatus.connected && calendarStatus.email && (
          <p className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>
            Connected as {calendarStatus.email}
          </p>
        )}

        <div className="flex gap-3">
          {calendarStatus.connected ? (
            <button
              onClick={handleDisconnectCalendar}
              disabled={calendarLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border disabled:opacity-50"
              style={{ borderColor: 'var(--color-rule)', color: 'var(--destructive)' }}
            >
              {calendarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnectCalendar}
              disabled={calendarLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'oklch(50% 0.18 240)', color: '#fff' }}
            >
              {calendarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Connect Google Calendar
            </button>
          )}
        </div>
      </div>

      {/* WhatsApp Integration */}
      <div className="rounded-xl border p-6 md:p-8 space-y-6 shadow-sm transition-all" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'oklch(55% 0.18 145 / 0.1)' }}>
              <MessageSquare className="w-5 h-5" style={{ color: 'oklch(50% 0.18 145)' }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>WhatsApp Notifications</h3>
              <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>Receive deadline reminders and notices on WhatsApp</p>
            </div>
          </div>
        </div>

        {formData.phone ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'oklch(65% 0.15 150 / 0.15)', color: 'oklch(45% 0.15 150)' }}>
              <CheckCircle className="w-3 h-3" /> Phone: {formData.phone}
            </span>
          </div>
        ) : (
          <p className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>
            Add a phone number in your profile above to enable WhatsApp notifications.
          </p>
        )}

        {whatsappMsg.text && (
          <div
            className="p-3 text-sm font-medium rounded-lg border"
            style={{
              backgroundColor: whatsappMsg.type === 'error' ? 'oklch(60% 0.20 25 / 0.08)' : 'oklch(65% 0.15 150 / 0.1)',
              color: whatsappMsg.type === 'error' ? 'var(--destructive)' : 'oklch(45% 0.15 150)',
              borderColor: whatsappMsg.type === 'error' ? 'oklch(60% 0.20 25 / 0.15)' : 'oklch(65% 0.15 150 / 0.2)',
            }}
          >
            {whatsappMsg.text}
          </div>
        )}

        <button
          onClick={handleSendWhatsAppTest}
          disabled={whatsappLoading || !formData.phone}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'oklch(50% 0.18 145)', color: '#fff' }}
        >
          {whatsappLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send Test WhatsApp Message
        </button>
      </div>
    </div>
  )
}
