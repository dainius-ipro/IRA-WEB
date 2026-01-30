// app/admin/tracks/[trackId]/page.tsx
// Admin Track Detail - Shows all sessions for this track

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Clock, Gauge, ChevronRight } from 'lucide-react'

function formatTime(ms: number | null): string {
  if (!ms) return '-'
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`
}

export default async function AdminTrackDetailPage({ 
  params 
}: { 
  params: Promise<{ trackId: string }> 
}) {
  const { trackId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Get track details
  const { data: track } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', trackId)
    .single()

  if (!track) redirect('/admin/tracks')

  // Get all sessions for this track
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      profiles(full_name, email),
      laps(count)
    `)
    .eq('track_id', trackId)
    .order('session_date', { ascending: false })

  return (
    <div className="min-h-screen bg-ira-carbon-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <Link 
          href="/admin/tracks"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Tracks
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🏁 {track.name}</h1>
            <div className="flex items-center gap-4 text-white/60">
              {track.country && <span>{track.country}</span>}
              {track.city && <span>• {track.city}</span>}
              {track.length_meters && <span>• {track.length_meters}m</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-ira-gold">{sessions?.length || 0}</div>
            <div className="text-white/50 text-sm">Sessions</div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions?.map((session: any) => {
            const lapCount = session.laps?.[0]?.count || 0
            return (
              <Link
                key={session.id}
                href={`/admin/tracks/${trackId}/sessions/${session.id}`}
                className="card p-4 hover:bg-ira-carbon-700/50 transition-colors group block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold">
                        {session.name || 'Unnamed Session'}
                      </h3>
                      {session.best_lap_time_ms && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded font-mono">
                          Best: {formatTime(session.best_lap_time_ms)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {session.profiles?.full_name || session.profiles?.email || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.session_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="w-4 h-4" />
                        {lapCount} laps
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                </div>
              </Link>
            )
          })}

          {(!sessions || sessions.length === 0) && (
            <div className="card p-12 text-center text-white/50">
              No sessions recorded at this track yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
