// app/app/sessions/page.tsx
// IRA Web - Sessions List

import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Upload, 
  Calendar, 
  Clock, 
  Map, 
  Filter,
  Search,
  ArrowRight,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react'
import { formatLapTime, formatRelativeDate, formatDistance } from '@/lib/utils'

export default async function SessionsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch all sessions with track info
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      track:tracks(id, name, country, city),
      driver:drivers(id, name, nickname)
    `)
    .eq('user_id', user?.id)
    .order('session_date', { ascending: false })

  // Get unique tracks for filter
  const tracks = [...new Set(sessions?.map(s => s.track?.name).filter(Boolean))]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sessions</h1>
          <p className="text-white/60">
            {sessions?.length || 0} sessions recorded
          </p>
        </div>
        <Link 
          href="/app/sessions/import" 
          className="btn-racing flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Import Session
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text"
            placeholder="Search sessions..."
            className="input pl-10"
          />
        </div>
        <button className="btn-ghost flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
          <ChevronDown className="w-4 h-4" />
        </button>
        <button className="btn-ghost flex items-center gap-2">
          <Map className="w-5 h-5" />
          Track
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions List */}
      {sessions && sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function SessionCard({ session }: { session: any }) {
  const statusColors: Record<string, string> = {
    complete: 'bg-ira-success/20 text-ira-success',
    processing: 'bg-ira-warning/20 text-ira-warning',
    pending: 'bg-white/10 text-white/60',
    error: 'bg-ira-danger/20 text-ira-danger',
  }

  return (
    <Link 
      href={`/app/sessions/${session.id}`}
      className="card card-hover flex items-center gap-6 group"
    >
      {/* Date Column */}
      <div className="flex-shrink-0 w-20 text-center">
        <div className="text-2xl font-bold text-white">
          {new Date(session.session_date).getDate()}
        </div>
        <div className="text-sm text-white/50 uppercase">
          {new Date(session.session_date).toLocaleDateString('en', { month: 'short' })}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-16 bg-ira-carbon-600" />

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-bold text-white truncate">
            {session.name || session.track?.name || 'Untitled Session'}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[session.status] || statusColors.pending}`}>
            {session.status}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/50">
          {session.track && (
            <span className="flex items-center gap-1">
              <Map className="w-4 h-4" />
              {session.track.name}
              {session.track.country && `, ${session.track.country}`}
            </span>
          )}
          {session.driver && (
            <span>
              👤 {session.driver.nickname || session.driver.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatRelativeDate(session.session_date)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 flex-shrink-0">
        <div className="text-center">
          <div className="text-sm text-white/40 mb-1">Laps</div>
          <div className="text-lg font-bold text-white">
            {session.total_laps || '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-white/40 mb-1">Best Lap</div>
          <div className="text-lg font-bold text-ira-gold font-mono">
            {formatLapTime(session.best_lap_time_ms)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-white/40 mb-1">Distance</div>
          <div className="text-lg font-bold text-white">
            {formatDistance(session.total_distance_meters)}
          </div>
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-ira-red transition-colors flex-shrink-0" />
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="card text-center py-16">
      <div className="w-20 h-20 rounded-full bg-ira-carbon-700 flex items-center justify-center mx-auto mb-6">
        <Upload className="w-10 h-10 text-white/40" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No sessions yet</h3>
      <p className="text-white/50 mb-8 max-w-md mx-auto">
        Import your first telemetry file to start analyzing your racing data. 
        We support MyChron, RaceChrono, and AiM formats.
      </p>
      <Link href="/app/sessions/import" className="btn-racing">
        <Upload className="w-5 h-5 mr-2" />
        Import Your First Session
      </Link>
    </div>
  )
}
