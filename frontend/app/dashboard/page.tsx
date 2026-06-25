import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, FileText, CheckCircle2, Clock, Target, BookOpen, Calendar } from 'lucide-react'
import Link from 'next/link'
import { DailyBriefing } from '@/components/dashboard/DailyBriefing'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let pendingTasks = 0
  let upcomingDeadlines = 0

  if (user && 'from' in supabase) {
    const { data: tasks } = await (supabase as any)
      .from('tasks')
      .select('id, completed, deadline')
      .eq('user_id', user.id)

    if (tasks) {
      pendingTasks = tasks.filter((t: any) => !t.completed).length
      const now = new Date()
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      upcomingDeadlines = tasks.filter((t: any) => {
        if (!t.deadline || t.completed) return false
        const d = new Date(t.deadline)
        return d >= now && d <= in7Days
      }).length
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      {/* Manifesto-inspired heading */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--color-accent)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]" style={{ color: 'var(--color-ink)' }}>
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}.
        </h1>
        <p className="text-base" style={{ color: 'var(--color-ink-2)' }}>
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Letter-spacious stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/tasks?filter=pending" className="block group">
          <Card className="border shadow-sm transition-all duration-200 group-hover:-translate-y-0.5" style={{ borderColor: 'var(--color-rule)', backgroundColor: 'var(--color-surface)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Pending Tasks</CardTitle>
              <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: 'var(--color-accent)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-ink)' }}>{pendingTasks}</div>
              <p className="text-sm mt-1" style={{ color: 'var(--color-ink-2)' }}>
                {pendingTasks === 0 ? 'All caught up.' : `${pendingTasks} task${pendingTasks > 1 ? 's' : ''} remaining`}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tasks" className="block group">
          <Card className="border shadow-sm transition-all duration-200 group-hover:-translate-y-0.5" style={{ borderColor: 'var(--color-rule)', backgroundColor: 'var(--color-surface)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Deadlines</CardTitle>
              <Clock className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: 'var(--color-accent-2)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-ink)' }}>{upcomingDeadlines}</div>
              <p className="text-sm mt-1" style={{ color: 'var(--color-ink-2)' }}>Within next 7 days</p>
            </CardContent>
          </Card>
        </Link>

        <DailyBriefing />
      </div>

      {/* Schedule + Quick Actions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-ink)' }}>Today&apos;s Schedule</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'oklch(60% 0.20 25 / 0.1)', color: 'var(--destructive)' }}>Calendar — Coming Soon</span>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Computer Networks Lecture', time: '10:00 AM - 11:30 AM', location: 'Room 402', type: 'Class' },
              { title: 'Submit OS Assignment', time: '11:59 PM', location: 'Online', type: 'Deadline' }
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-5 p-5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: item.type === 'Class' ? 'oklch(60% 0.14 250 / 0.12)' : 'oklch(60% 0.20 25 / 0.12)',
                    color: item.type === 'Class' ? 'var(--color-accent)' : 'var(--destructive)',
                  }}
                >
                  {item.type === 'Class' ? <BookOpen className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-semibold text-base" style={{ color: 'var(--color-ink)' }}>{item.title}</h3>
                  <p className="text-sm mt-0.5 flex items-center gap-2" style={{ color: 'var(--color-ink-2)' }}>
                    <Clock className="w-3.5 h-3.5" /> {item.time} &middot; {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold mb-4 uppercase tracking-[0.08em]" style={{ color: 'var(--color-ink-2)' }}>Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/study-buddy"
                className="flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: 'oklch(60% 0.14 250 / 0.1)', color: 'var(--color-accent)' }}>
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--color-ink-2)' }}>Study Buddy</span>
              </Link>

              <Link
                href="/dashboard/notice-summarizer"
                className="flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: 'oklch(60% 0.14 250 / 0.1)', color: 'var(--color-accent)' }}>
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--color-ink-2)' }}>Summarizer</span>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: 'var(--color-rule)', backgroundColor: 'var(--color-paper-2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'oklch(55% 0.18 145 / 0.1)' }}>
                <Calendar className="w-5 h-5" style={{ color: 'oklch(50% 0.18 145)' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>WhatsApp Reminders</h3>
                <p className="text-xs" style={{ color: 'var(--color-ink-2)' }}>Receive deadline alerts on your phone.</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'oklch(60% 0.20 25 / 0.08)', color: 'var(--destructive)' }}>
              Not Yet Integrated
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
