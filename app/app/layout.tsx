// app/app/layout.tsx
// Dashboard layout with sidebar navigation

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Map, 
  BarChart3, 
  Brain,
  Trophy,
  Settings,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-ira-carbon-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ira-carbon-800 border-r border-ira-carbon-700 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-ira-carbon-700">
          <Link href="/app" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ira-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">IRA</span>
            </div>
            <span className="text-white font-bold">Racing Analytics</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <NavLink href="/app" icon={<LayoutDashboard className="w-5 h-5" />}>
              Dashboard
            </NavLink>
            <NavLink href="/app/sessions" icon={<FolderOpen className="w-5 h-5" />}>
              Sessions
            </NavLink>
            <NavLink href="/app/tracks" icon={<Map className="w-5 h-5" />}>
              Tracks
            </NavLink>
            <NavLink href="/app/analysis" icon={<BarChart3 className="w-5 h-5" />}>
              Analysis
            </NavLink>
            <NavLink href="/app/coaching" icon={<Brain className="w-5 h-5" />}>
              AI Coaching
            </NavLink>
            <NavLink href="/app/achievements" icon={<Trophy className="w-5 h-5" />}>
              Achievements
            </NavLink>
          </div>

          <div className="mt-8 pt-8 border-t border-ira-carbon-700">
            <NavLink href="/app/settings" icon={<Settings className="w-5 h-5" />}>
              Settings
            </NavLink>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-ira-carbon-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ira-carbon-600 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white/60" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name || profile?.full_name || 'Driver'}
              </p>
              <p className="text-xs text-white/40 truncate">
                {user.email}
              </p>
            </div>
            <button className="p-2 rounded-lg hover:bg-ira-carbon-700 transition-colors">
              <ChevronDown className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string
  icon: React.ReactNode
  children: React.ReactNode 
}) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-ira-carbon-700 transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}
