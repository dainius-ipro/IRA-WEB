// app/app/sessions/[id]/page.tsx
// Session detail page with tabs: Laps, Map, Telemetry, AI
// FIX: Added telemetry fetch error handling and debug stats

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import SessionTabs from './SessionTabs'

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

  // Get telemetry points for all laps
  const lapIds = laps.map((l: any) => l.id)
  
  let telemetryPoints: any[] = []
  let telemetryError: string | null = null
  
  if (lapIds.length > 0) {
    // Fetch telemetry - each lap has ~1000-2000 points at 20Hz
    const { data: telemetryData, error: fetchError } = await supabase
      .from('telemetry_points')
      .select('*')
      .in('lap_id', lapIds)
      .order('timestamp', { ascending: true })
      .limit(100000) // Safety limit for large sessions
    
    if (fetchError) {
      console.error('Telemetry fetch error:', fetchError)
      telemetryError = fetchError.message
    }
    
    telemetryPoints = telemetryData || []
    console.log(`[Session ${id}] Fetched ${telemetryPoints.length} telemetry points for ${lapIds.length} laps`)
  }

  // Get AI insights
  const { data: aiInsightsData } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('session_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  const aiInsights = (aiInsightsData || []) as any[]

  // Count GPS points
  const gpsPointCount = telemetryPoints.filter(p => p.latitude && p.longitude).length

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
          <div className={`text-2xl font-bold ${telemetryPoints.length > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {telemetryPoints.length > 0 ? `${(telemetryPoints.length / 1000).toFixed(1)}k` : '0'}
          </div>
          <div className="text-sm text-white/50">
            Telemetry
            {telemetryError && <span className="text-red-400 ml-1">⚠️</span>}
          </div>
        </div>
        <div className="card p-4 text-center">
          <div className={`text-2xl font-bold ${gpsPointCount > 0 ? 'text-green-500' : 'text-yellow-500'}`}>
            {gpsPointCount > 0 ? `${(gpsPointCount / 1000).toFixed(1)}k` : '0'}
          </div>
          <div className="text-sm text-white/50">GPS Points</div>
        </div>
      </div>

      {/* Error Banner */}
      {telemetryError && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          <strong>Telemetry Error:</strong> {telemetryError}
          <p className="text-sm mt-1 text-red-400/70">
            This might be a Supabase RLS policy issue. Check if telemetry_points table has proper read policies.
          </p>
        </div>
      )}

      {/* Tabs Component */}
      <SessionTabs 
        laps={laps}
        telemetryPoints={telemetryPoints}
        aiInsights={aiInsights}
        sessionId={id}
      />
    </div>
  )
}