// app/admin/tracks/[trackId]/page.tsx
// Track Detail with Sessions List

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, Clock, Gauge } from 'lucide-react'

function formatLapTime(ms: number | null): string {
  if (!ms) return '-'
  const totalSeconds = ms / 1000
  const mins = Math.floor(totalSeconds / 60)
  const secs = (totalSeconds % 60).toFixed(3)
  return `${mins}:${secs.padStart(6, '0')}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
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
  const { data: trackData, error: trackError } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', trackId)
    .single()

  if (trackError || !trackData) {
    notFound()
  }

  const track = trackData as any

  // Get all sessions for this track
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select(`
      id,
      name,
      session_date,
      status,
      best_lap_time,
      total_laps,
      profiles (
        full_name,
        email
      )
    `)
    .eq('track_id', trackId)
    .order('session_date', { ascending: false })

  const sessionsList = (sessions || []) as any[]

  return (
    <div className="min-h-screen bg-ira-carbon-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
          <Link href="/admin" className="hover:text-white">Admin</Link>
          <span>/</span>
          <Link href="/admin/tracks" className="hover:text-white">Tracks</Link>
          <span>/</span>
          <span className="text-white">{track.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/tracks"
              className="text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                🏎️ {track.name}
              </h1>
              <div className="flex items-center gap-4 text-white/60 mt-1">
                {track.country && <span>{track.country}</span>}
                {track.length_meters && <span>{track.length_meters}m</span>}
                <span>{sessionsList.length} sessions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-xl font-semibold text-white">All Sessions</h2>
          </div>

          {sessionsList.length > 0 ? (
            <div className="divide-y divide-zinc-800">
              {sessionsList.map((session) => (
                <Link
                  key={session.id}
                  href={`/admin/tracks/${trackId}/sessions/${session.id}`}
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-ira-red/20 rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-ira-red" />
                    </div>
                    <div>
                      <div className="font-medium text-white group-hover:text-ira-red transition-colors">
                        {session.name || `Session ${formatDate(session.session_date)}`}
                      </div>
                      <div className="text-sm text-white/50">
                        {session.profiles?.full_name || session.profiles?.email || 'Unknown driver'}
                        {' • '}
                        {formatDate(session.session_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    {session.total_laps && (
                      <div className="flex items-center gap-2 text-white/60">
                        <Gauge className="w-4 h-4" />
                        {session.total_laps} laps
                      </div>
                    )}
                    {session.best_lap_time && (
                      <div className="flex items-center gap-2 text-green-400 font-mono">
                        <Clock className="w-4 h-4" />
                        {formatLapTime(session.best_lap_time)}
                      </div>
                    )}
                    <div className={`px-2 py-1 rounded text-xs ${
                      session.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {session.status || 'processed'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-white/50">
              No sessions found for this track
            </div>
          )}
        </div>
      </div>
    </div>
  )
}