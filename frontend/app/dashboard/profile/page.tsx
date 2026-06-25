import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch the user's profile from the profiles table
  let profile = {}
  if ('from' in supabase) {
    const { data } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) profile = data
  }

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]" style={{ color: 'var(--color-ink)' }}>
          My Profile
        </h1>
        <p className="text-base" style={{ color: 'var(--color-ink-2)' }}>
          Manage your personal information and preferences.
        </p>
      </div>

      <ProfileForm 
        userId={user.id} 
        email={user.email || ''} 
        initialProfile={profile || {}} 
      />
    </div>
  )
}
