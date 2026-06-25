'use client'

import { useState } from 'react'
import { FileText, Calendar as CalendarIcon, MessageCircle, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function NoticeSummarizerPage() {
  const [noticeText, setNoticeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ summary: string[]; eventDate: string | null; whatsappDraft: string } | null>(null)
  const [error, setError] = useState('')

  const handleSummarize = async () => {
    if (!noticeText.trim()) return

    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/ai/summarize-notice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ noticeText })
      })

      const data = await response.json()
      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.message || 'Failed to summarize notice')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-10">
      {/* Manifesto-style heading */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--color-accent)' }}>
          AI Tool
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-ink)' }}>
          Notice Summarizer
        </h1>
        <p className="text-base" style={{ color: 'var(--color-ink-2)' }}>
          Paste college notices to extract actionable items and dates.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div
          className="space-y-4 rounded-xl p-6 border relative"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
        >
          <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            Paste College Notice
          </label>
          <textarea
            className="w-full h-80 p-4 rounded-lg border transition-colors resize-none text-sm leading-relaxed"
            style={{
              backgroundColor: 'var(--color-paper)',
              borderColor: 'var(--color-rule)',
              color: 'var(--color-ink)',
            }}
            placeholder="E.g. Dear students, this is to inform you that the mid-term examinations..."
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
          />

          {error && <p className="text-sm font-medium" style={{ color: 'var(--destructive)' }}>{error}</p>}

          <button
            onClick={handleSummarize}
            disabled={!noticeText.trim() || loading}
            className="w-full py-3 px-6 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-foreground)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Notice...
              </>
            ) : (
              <>
                Generate Summary
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div
                className="rounded-xl p-6 border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
              >
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--color-ink)' }}>
                  <FileText className="w-4 h-4" style={{ color: 'oklch(55% 0.14 150)' }} />
                  Key Takeaways
                </h3>
                <ul className="space-y-3">
                  {result.summary.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-ink-2)' }}>
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{ backgroundColor: 'oklch(55% 0.14 150 / 0.12)', color: 'oklch(50% 0.12 150)' }}
                      >
                        {i + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Event Date Card */}
              {result.eventDate && (
                <div
                  className="rounded-xl p-5 border flex items-center gap-4"
                  style={{
                    backgroundColor: 'oklch(50% 0.16 250 / 0.06)',
                    borderColor: 'oklch(50% 0.16 250 / 0.12)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'oklch(50% 0.16 250 / 0.1)', color: 'var(--color-accent)' }}
                  >
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.08em] mb-0.5" style={{ color: 'var(--color-ink-2)' }}>
                      Event Date
                    </h3>
                    <p className="text-base font-semibold" style={{ color: 'var(--color-ink)' }}>
                      {new Date(result.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* WhatsApp Draft Card */}
              <div
                className="rounded-xl p-6 border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
              >
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--color-ink)' }}>
                  <MessageCircle className="w-4 h-4" style={{ color: 'oklch(55% 0.14 150)' }} />
                  WhatsApp Draft
                </h3>
                <div
                  className="rounded-lg p-4 text-sm leading-relaxed"
                  style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink-2)' }}
                >
                  &ldquo;{result.whatsappDraft}&rdquo;
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(result.whatsappDraft)}
                  className="mt-3 text-sm font-medium transition-all hover:opacity-70"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          ) : (
            <div
              className="h-full rounded-xl border flex flex-col items-center justify-center p-8 text-center"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
            >
              <FileText className="w-8 h-8 mb-4" style={{ color: 'var(--color-muted)' }} />
              <p className="text-base font-medium" style={{ color: 'var(--color-ink-2)' }}>Awaiting Notice</p>
              <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--color-muted)' }}>
                Paste a notice on the left to extract its details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
