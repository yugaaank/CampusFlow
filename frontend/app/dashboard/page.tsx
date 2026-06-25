import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, FileText, CheckCircle2, Clock, Plus, Target, Sparkles, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch real task stats from Supabase
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

  const dueToday = (() => {
    // Computed server-side — kept minimal since we don't have full task data here
    return 0
  })()

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
          </h1>
          <p className="text-slate-500 mt-1 text-lg">Here&apos;s what&apos;s happening with your academics today.</p>
        </div>
        <Link href="/dashboard/tasks">
          <Button className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-all rounded-xl h-11 px-6">
            <Plus className="w-5 h-5 mr-2" /> New Task
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/tasks?filter=pending" className="block">
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl hover:shadow-md transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wide">Pending Tasks</CardTitle>
              <CheckCircle2 className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{pendingTasks}</div>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {pendingTasks === 0 ? 'All caught up! 🎉' : `${pendingTasks} task${pendingTasks > 1 ? 's' : ''} remaining`}
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/tasks" className="block">
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl hover:shadow-md transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wide">Deadlines</CardTitle>
              <Clock className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{upcomingDeadlines}</div>
              <p className="text-sm font-medium text-slate-500 mt-1">Within next 7 days</p>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-slate-300 uppercase tracking-wide">AI Study Tip</CardTitle>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-base font-medium leading-relaxed text-slate-100">
              &ldquo;Breaking your OS study session into 25-minute Pomodoro intervals will boost your retention by 40%.&rdquo;
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Today&apos;s Schedule</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">View Calendar</Button>
          </div>
          
          <div className="space-y-4">
            {[
              { title: 'Computer Networks Lecture', time: '10:00 AM - 11:30 AM', location: 'Room 402', type: 'Class' },
              { title: 'Submit OS Assignment', time: '11:59 PM', location: 'Online', type: 'Deadline' }
            ].map((item, i) => (
              <div key={i} className="flex gap-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'Class' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                  {item.type === 'Class' ? <BookOpen className="w-7 h-7" /> : <Target className="w-7 h-7" />}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.title}</h3>
                  <p className="text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {item.time} • {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Sidebar Widgets Area */}
        <div className="space-y-8">
          
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Study Buddy</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Summarize</span>
              </button>
            </div>
          </div>

          <Card className="border-0 shadow-lg bg-emerald-500 text-white overflow-hidden relative rounded-2xl">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-400 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                WhatsApp Setup
              </CardTitle>
              <CardDescription className="text-emerald-50 font-medium">Get deadline reminders directly on your phone via n8n automation.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 border-0 font-bold rounded-xl h-11">
                Connect Now
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
