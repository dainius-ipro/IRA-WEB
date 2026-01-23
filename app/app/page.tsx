// app/app/page.tsx
// IRA Web Dashboard - Main page after login

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Format lap time from milliseconds
function formatLapTime(ms: number | null): string {
  if (!ms) return '--:--.---'
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const millis = ms % 1000
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`
}

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

// Get time ago
function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user's sessions with track info
  const { data: sessionsData } = await supabase
    .from('sessions')
    .select(`
      *,
      tracks (
        name,
        country
      )
    `)
    .eq('user_id', user.id)
    .order('session_date', { ascending: false })
    .limit(10)

  const sessions = (sessionsData || []) as any[]

  // Get stats
  const { count: totalSessions } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: totalLaps } = await supabase
    .from('laps')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessions?.[0]?.id || '')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back! 🏎️
        </h1>
        <p className="text-white/60">
          Ready to analyze your racing data and improve your lap times?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total Sessions" 
          value={totalSessions?.toString() || '0'} 
          icon="📊"
        />
        <StatCard 
          label="This Month" 
          value={sessions?.filter(s => {
            const date = new Date(s.session_date)
            const now = new Date()
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
          }).length.toString() || '0'} 
          icon="📅"
        />
        <StatCard 
          label="Best Lap" 
          value={sessions?.[0]?.best_lap_time_ms ? formatLapTime(sessions[0].best_lap_time_ms) : '--'} 
          icon="⚡"
        />
        <StatCard 
          label="Total Distance" 
          value={`${Math.round((sessions?.reduce((acc, s) => acc + (s.total_distance_meters || 0), 0) || 0) / 1000)} km`} 
          icon="🛤️"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link 
          href="/app/sessions/import"
          className="btn-racing inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Import Session
        </Link>
        <Link 
          href="/app/sessions"
          className="px-6 py-3 rounded-lg bg-ira-carbon-700 text-white font-medium hover:bg-ira-carbon-600 transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          View All Sessions
        </Link>
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Sessions</h2>
          <Link href="/app/sessions" className="text-ira-red hover:text-ira-red-400 text-sm font-medium">
            View all →
          </Link>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session: any) => (
              <Link 
                key={session.id}
                href={`/app/sessions/${session.id}`}
                className="block p-4 rounded-lg bg-ira-carbon-800/50 hover:bg-ira-carbon-700/50 border border-ira-carbon-700 hover:border-ira-carbon-600 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Track Icon */}
                    <div className="w-12 h-12 rounded-lg bg-ira-red/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🏁</span>
                    </div>
                    
                    {/* Session Info */}
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-ira-red transition-colors">
                        {session.tracks?.name || session.name || 'Unknown Track'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-white/50">
                        <span>{formatDate(session.session_date)}</span>
                        <span>•</span>
                        <span>{session.total_laps || 0} laps</span>
                        {session.tracks?.country && (
                          <>
                            <span>•</span>
                            <span>{session.tracks.country}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Best Lap */}
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-ira-gold">
                      {formatLapTime(session.best_lap_time_ms)}
                    </div>
                    <div className="text-xs text-white/40">
                      {timeAgo(session.session_date)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-ira-carbon-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏎️</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No sessions yet</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Import your first MyChron session to start analyzing your racing data and get AI coaching insights.
            </p>
            <Link href="/app/sessions/import" className="btn-racing inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Import Your First Session
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-white/50">{label}</div>
        </div>
      </div>
    </div>
  )
}
