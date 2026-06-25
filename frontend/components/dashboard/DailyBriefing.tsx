'use client'

import { useState, useEffect } from 'react'
import { Info, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'

export function DailyBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBriefing() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) return

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/ai/daily-briefing`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        const result = await response.json()
        if (result.success && result.data?.briefing) {
          setBriefing(result.data.briefing)
        }
      } catch (err) {
        console.error('Failed to fetch daily briefing', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBriefing()
  }, [])

  return (
    <Card className="border shadow-sm transition-all duration-200" style={{ borderColor: 'var(--color-rule)', backgroundColor: 'var(--color-surface)' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-ink-2)' }}>
          <Info className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          Daily Briefing
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[80px] flex items-center">
        {loading ? (
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-ink-2)' }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing tasks...</span>
          </div>
        ) : (
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink)' }}>
            {briefing || "You're all caught up. No pending tasks for today."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
