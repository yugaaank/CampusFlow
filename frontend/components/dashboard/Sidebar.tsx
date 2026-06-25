'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Bot, User, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Study Buddy', href: '/dashboard/study-buddy', icon: Bot },
  { name: 'Notice Summarizer', href: '/dashboard/notice-summarizer', icon: Bot },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 hidden w-64 lg:flex flex-col"
      style={{ backgroundColor: 'var(--color-paper)', borderRight: '1px solid var(--color-rule)' }}
    >
      {/* Brand */}
      <div className="flex items-center h-16 px-6 border-b" style={{ borderColor: 'var(--color-rule)' }}>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-foreground)' }}>CF</span>
          <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-ink)' }}>CampusFlow</span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] mb-4 px-2" style={{ color: 'var(--color-muted)' }}>Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                isActive
                  ? 'font-medium'
                  : 'font-normal hover:opacity-70'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                color: isActive ? 'var(--primary-foreground)' : 'var(--color-ink-2)',
              }}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-rule)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all hover:opacity-70"
          style={{ color: 'var(--color-ink-2)' }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
