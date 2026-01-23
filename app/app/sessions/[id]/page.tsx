// app/app/sessions/[id]/page.tsx
// Session detail page

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
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
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

export default async function SessionDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get session with track and laps
  const { data: sessionData, error } = await supabase
    .from('sessions')
    .select(`
      *,
      tracks (
        name,
        country,
        city,
        length_meters
      ),
      laps (
        id,
        lap_number,
        lap_time_ms,
        is_valid,
        is_best,
        max_speed_kmh,
        sector1_ms,
        sector2_ms,
        sector3_ms
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const session = sessionData as any

  if (error || !session) {
    notFound()
  }

  const laps = (session.laps || []).sort((a: any, b: any) => a.lap_number - b.lap_number)
  const bestLap = laps.find((l: any) => l.is_best)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link 
            href="/app/sessions"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors text-sm"
          >
            ← Back to Sessions
          </Link>
          <h1 className="text-3xl font-bold text-white">
            {session.tracks?.name || session.name || 'Session'}
          </h1>
          <p className="text-white/60 mt-1">
            {formatDate(session.session_date)}
            {session.tracks?.country && ` • ${session.tracks.city || ''} ${session.tracks.country}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/50 mb-1">Best Lap</div>
          <div className="text-3xl font-mono font-bold text-ira-gold">
            {formatLapTime(session.best_lap_time_ms)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-white">{session.total_laps || laps.length}</div>
          <div className="text-sm text-white/50">Total Laps</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-white">
            {session.total_distance_meters ? `${(session.total_distance_meters / 1000).toFixed(1)}` : '--'}
          </div>
          <div className="text-sm text-white/50">Distance (km)</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-white">
            {bestLap?.max_speed_kmh ? Math.round(bestLap.max_speed_kmh) : '--'}
          </div>
          <div className="text-sm text-white/50">Max Speed (km/h)</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-white uppercase text-xs tracking-wider pt-2">
            {session.data_source || 'Unknown'}
          </div>
          <div className="text-sm text-white/50 mt-2">Data Source</div>
        </div>
      </div>

      {/* Laps Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">Lap Times</h2>
        
        {laps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ira-carbon-700">
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Lap</th>
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-white/50 font-medium hidden md:table-cell">S1</th>
                  <th className="text-left py-3 px-4 text-white/50 font-medium hidden md:table-cell">S2</th>
                  <th className="text-left py-3 px-4 text-white/50 font-medium hidden md:table-cell">S3</th>
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Max Speed</th>
                </tr>
              </thead>
              <tbody>
                {laps.map((lap: any) => (
                  <tr 
                    key={lap.id}
                    className={`border-b border-ira-carbon-700/50 ${
                      lap.is_best ? 'bg-ira-gold/5' : ''
                    } ${!lap.is_valid ? 'opacity-50' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-white">
                        {lap.lap_number}
                        {lap.is_best && <span className="ml-2 text-ira-gold">⚡</span>}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold ${lap.is_best ? 'text-ira-gold' : 'text-white'}`}>
                        {formatLapTime(lap.lap_time_ms)}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="font-mono text-white/70">{formatLapTime(lap.sector1_ms)}</span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="font-mono text-white/70">{formatLapTime(lap.sector2_ms)}</span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="font-mono text-white/70">{formatLapTime(lap.sector3_ms)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white/70">
                        {lap.max_speed_kmh ? `${Math.round(lap.max_speed_kmh)} km/h` : '--'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-white/50">
            No lap data available
          </div>
        )}
      </div>

      {/* AI Analysis Placeholder */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">AI Coaching</h2>
          <span className="text-xs bg-ira-gold/20 text-ira-gold px-2 py-1 rounded">Coming to Web</span>
        </div>
        <p className="text-white/60">
          AI-powered coaching analysis is available in the iOS and Android apps. 
          Web version coming soon!
        </p>
      </div>
    </div>
  )
}
