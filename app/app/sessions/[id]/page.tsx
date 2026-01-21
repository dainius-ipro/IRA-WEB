// app/app/sessions/[id]/page.tsx
// IRA Web - Session Detail Page

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Map, 
  Clock, 
  Gauge,
  Thermometer,
  Wind,
  Trophy,
  BarChart3,
  Play,
  Brain,
  Share2,
  MoreHorizontal
} from 'lucide-react'
import { formatLapTime, formatDistance, formatRelativeDate } from '@/lib/utils'

interface PageProps {
  params: { id: string }
}

export default async function SessionDetailPage({ params }: PageProps) {
  const supabase = await createServerSupabaseClient()
  
  // Fetch session with related data
  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      track:tracks(*),
      driver:drivers(*),
      laps:laps(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !session) {
    notFound()
  }

  // Sort laps by lap number
  const sortedLaps = session.laps?.sort((a: any, b: any) => a.lap_number - b.lap_number) || []
  const bestLap = sortedLaps.find((l: any) => l.is_best) || sortedLaps[0]

  // Fetch weather if available
  const { data: weather } = await supabase
    .from('session_weather')
    .select('*')
    .eq('session_id', session.id)
    .single()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/app/sessions" 
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {session.name || session.track?.name || 'Untitled Session'}
            </h1>
            <div className="flex items-center gap-4 text-white/60">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(session.session_date).toLocaleDateString('en', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {session.track && (
                <span className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  {session.track.name}, {session.track.country}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="btn-ghost">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="btn-ghost">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatCard 
          icon={<Trophy className="w-5 h-5" />}
          label="Best Lap"
          value={formatLapTime(session.best_lap_time_ms)}
          highlight
        />
        <StatCard 
          icon={<Clock className="w-5 h-5" />}
          label="Total Laps"
          value={session.total_laps?.toString() || '-'}
        />
        <StatCard 
          icon={<Map className="w-5 h-5" />}
          label="Distance"
          value={formatDistance(session.total_distance_meters)}
        />
        <StatCard 
          icon={<Gauge className="w-5 h-5" />}
          label="Max Speed"
          value={bestLap?.max_speed_kmh ? `${Math.round(bestLap.max_speed_kmh)} km/h` : '-'}
        />
        {weather && (
          <>
            <StatCard 
              icon={<Thermometer className="w-5 h-5" />}
              label="Temperature"
              value={`${Math.round(weather.temperature)}°C`}
            />
            <StatCard 
              icon={<Wind className="w-5 h-5" />}
              label="Track"
              value={weather.track_condition}
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Laps Table */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Lap Times</h2>
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Compare
                </button>
                <button className="btn-ghost text-sm">
                  <Play className="w-4 h-4 mr-2" />
                  Playback
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-white/50 border-b border-ira-carbon-700">
                    <th className="pb-3 font-medium">Lap</th>
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">S1</th>
                    <th className="pb-3 font-medium">S2</th>
                    <th className="pb-3 font-medium">S3</th>
                    <th className="pb-3 font-medium">Max Speed</th>
                    <th className="pb-3 font-medium">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLaps.map((lap: any, index: number) => {
                    const delta = bestLap && lap.lap_time_ms && bestLap.lap_time_ms
                      ? lap.lap_time_ms - bestLap.lap_time_ms
                      : null
                    
                    return (
                      <tr 
                        key={lap.id}
                        className={`
                          border-b border-ira-carbon-700/50 hover:bg-ira-carbon-700/30 transition-colors
                          ${lap.is_best ? 'bg-ira-gold/5' : ''}
                        `}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{lap.lap_number}</span>
                            {lap.is_best && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-ira-gold/20 text-ira-gold">
                                BEST
                              </span>
                            )}
                            {!lap.is_valid && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-ira-danger/20 text-ira-danger">
                                INVALID
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`py-3 font-mono font-bold ${lap.is_best ? 'text-ira-gold' : 'text-white'}`}>
                          {formatLapTime(lap.lap_time_ms)}
                        </td>
                        <td className="py-3 font-mono text-white/70 text-sm">
                          {formatSectorTime(lap.sector1_ms)}
                        </td>
                        <td className="py-3 font-mono text-white/70 text-sm">
                          {formatSectorTime(lap.sector2_ms)}
                        </td>
                        <td className="py-3 font-mono text-white/70 text-sm">
                          {formatSectorTime(lap.sector3_ms)}
                        </td>
                        <td className="py-3 text-white/70">
                          {lap.max_speed_kmh ? `${Math.round(lap.max_speed_kmh)}` : '-'}
                        </td>
                        <td className={`py-3 font-mono text-sm ${
                          delta === 0 ? 'text-ira-gold' : 
                          delta && delta > 0 ? 'text-ira-danger' : 'text-ira-success'
                        }`}>
                          {delta !== null ? (delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${(delta / 1000).toFixed(3)}`) : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4">Analysis</h3>
            <div className="space-y-2">
              <Link 
                href={`/app/analysis/${session.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-ira-carbon-700 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-ira-red/10 flex items-center justify-center">
                  <Map className="w-5 h-5 text-ira-red" />
                </div>
                <div>
                  <div className="font-medium text-white">Track Map</div>
                  <div className="text-sm text-white/40">View racing line</div>
                </div>
              </Link>
              <Link 
                href={`/app/analysis/${session.id}?tab=charts`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-ira-carbon-700 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-ira-gold/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-ira-gold" />
                </div>
                <div>
                  <div className="font-medium text-white">Telemetry Charts</div>
                  <div className="text-sm text-white/40">Speed, RPM, G-Force</div>
                </div>
              </Link>
              <Link 
                href={`/app/coaching?session=${session.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-ira-carbon-700 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-ira-red/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-ira-red" />
                </div>
                <div>
                  <div className="font-medium text-white">AI Coaching</div>
                  <div className="text-sm text-white/40">Get personalized tips</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Session Info */}
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4">Session Info</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-white/50">Data Source</dt>
                <dd className="text-white capitalize">{session.data_source}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">File</dt>
                <dd className="text-white truncate max-w-[150px]" title={session.original_filename}>
                  {session.original_filename || '-'}
                </dd>
              </div>
              {session.driver && (
                <div className="flex justify-between">
                  <dt className="text-white/50">Driver</dt>
                  <dd className="text-white">{session.driver.name}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-white/50">Imported</dt>
                <dd className="text-white">{formatRelativeDate(session.created_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  highlight = false 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`card ${highlight ? 'border-ira-gold/30 bg-ira-gold/5' : ''}`}>
      <div className={`w-8 h-8 rounded-lg ${highlight ? 'bg-ira-gold/20' : 'bg-ira-carbon-700'} flex items-center justify-center mb-2`}>
        <span className={highlight ? 'text-ira-gold' : 'text-white/60'}>{icon}</span>
      </div>
      <div className="text-sm text-white/50 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-ira-gold' : 'text-white'} font-mono`}>
        {value}
      </div>
    </div>
  )
}

function formatSectorTime(ms: number | null | undefined): string {
  if (!ms) return '-'
  return (ms / 1000).toFixed(3)
}
