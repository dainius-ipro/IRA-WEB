// app/app/layout.tsx
// Protected layout for authenticated users

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as any

  return (
    <div className="min-h-screen bg-ira-carbon-900">
      {/* Navigation */}
      <nav className="bg-ira-carbon-800 border-b border-ira-carbon-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/app" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ira-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">IRA</span>
              </div>
              <span className="text-white font-semibold hidden sm:block">Racing Analytics</span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-6">
              <Link 
                href="/app" 
                className="text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/app/sessions" 
                className="text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                Sessions
              </Link>
              <Link 
                href="/pro" 
                className="text-ira-gold hover:text-ira-gold/80 transition-colors text-sm font-medium flex items-center gap-1"
              >
                <span>⚡</span> Pro Studio
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">
                  {profile?.display_name || profile?.full_name || user.email?.split('@')[0]}
                </div>
                <div className="text-xs text-white/50">
                  {profile?.subscription_tier || 'free'} plan
                </div>
              </div>
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full border-2 border-ira-carbon-600"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-ira-red/20 flex items-center justify-center">
                  <span className="text-ira-red font-bold">
                    {(profile?.display_name || user.email || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <form action="/auth/signout" method="post">
                <button 
                  type="submit"
                  className="text-white/50 hover:text-white text-sm transition-colors"
                  title="Sign out"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}
