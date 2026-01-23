// app/app/sessions/page.tsx
// Sessions list page

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function formatLapTime(ms: number | null): string {
  if (!ms) return '--:--.---'
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const millis = ms % 1000
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

export default async function SessionsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

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

  const sessions = (sessionsData || []) as any[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Sessions</h1>
          <p className="text-white/60">All your racing sessions</p>
        </div>
        <Link href="/app/sessions/import" className="btn-racing inline-flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Import Session
        </Link>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session: any) => (
            <Link 
              key={session.id}
              href={`/app/sessions/${session.id}`}
              className="block p-4 rounded-lg bg-ira-carbon-800 hover:bg-ira-carbon-700 border border-ira-carbon-700 hover:border-ira-carbon-600 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-ira-red/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🏁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-ira-red transition-colors">
                      {session.tracks?.name || session.name || 'Unknown Track'}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-white/50">
                      <span>{formatDate(session.session_date)}</span>
                      <span>•</span>
                      <span>{session.total_laps || 0} laps</span>
                      {session.data_source && (
                        <>
                          <span>•</span>
                          <span className="uppercase text-xs">{session.data_source}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-ira-gold">
                    {formatLapTime(session.best_lap_time_ms)}
                  </div>
                  <div className="text-xs text-white/40">best lap</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-ira-carbon-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏎️</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No sessions yet</h3>
          <p className="text-white/60 mb-6">Import your first racing session to get started</p>
          <Link href="/app/sessions/import" className="btn-racing inline-flex items-center gap-2">
            Import Session
          </Link>
        </div>
      )}
    </div>
  )
}
