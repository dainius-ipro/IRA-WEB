// app/app/page.tsx
// IRA Web - Dashboard Home

import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Upload, 
  Clock, 
  Zap, 
  TrendingUp,
  Trophy,
  Map,
  ArrowRight,
  Calendar,
  Timer
} from 'lucide-react'
import { formatLapTime, formatRelativeDate, formatDistance } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch recent sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      track:tracks(name, country),
      driver:drivers(name)
    `)
    .eq('user_id', user?.id)
    .order('session_date', { ascending: false })
    .limit(5)

  // Fetch driver stats
  const { data: driverLevel } = await supabase
    .from('driver_levels')
    .select('*')
    .eq('driver_id', user?.id)
    .single()

  // Calculate quick stats
  const totalSessions = sessions?.length || 0
  const bestLapTime = sessions?.[0]?.best_lap_time_ms
  const totalDistance = sessions?.reduce((acc, s) => acc + (s.total_distance_meters || 0), 0) || 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Welcome back! Ready to analyze some laps?</p>
        </div>
        <Link 
          href="/app/sessions/import" 
          className="btn-racing flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Import Session
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={<Clock className="w-5 h-5" />}
          label="Total Sessions"
          value={totalSessions.toString()}
          color="red"
        />
        <StatCard 
          icon={<Timer className="w-5 h-5" />}
          label="Best Lap"
          value={formatLapTime(bestLapTime)}
          color="gold"
        />
        <StatCard 
          icon={<Map className="w-5 h-5" />}
          label="Total Distance"
          value={formatDistance(totalDistance)}
          color="red"
        />
        <StatCard 
          icon={<Zap className="w-5 h-5" />}
          label="XP Level"
          value={`Lv. ${driverLevel?.current_level || 1}`}
          subValue={`${driverLevel?.current_xp || 0} XP`}
          color="gold"
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Sessions</h2>
              <Link 
                href="/app/sessions" 
                className="text-sm text-ira-red hover:text-ira-red-400 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction 
                href="/app/sessions/import"
                icon={<Upload className="w-5 h-5" />}
                label="Import CSV"
                description="MyChron, RaceChrono, AiM"
              />
              <QuickAction 
                href="/app/analysis"
                icon={<TrendingUp className="w-5 h-5" />}
                label="Compare Laps"
                description="Analyze your best laps"
              />
              <QuickAction 
                href="/app/coaching"
                icon={<Zap className="w-5 h-5" />}
                label="AI Coaching"
                description="Get personalized tips"
              />
            </div>
          </div>

          {/* Achievements Preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Achievements</h2>
              <Link 
                href="/app/achievements" 
                className="text-sm text-ira-red hover:text-ira-red-400"
              >
                View all
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <AchievementBadge emoji="🏁" />
                <AchievementBadge emoji="⚡" />
                <AchievementBadge emoji="🔥" />
              </div>
              <div className="text-sm text-white/60">
                3 achievements unlocked
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Components

function StatCard({ 
  icon, 
  label, 
  value, 
  subValue,
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
  color: 'red' | 'gold'
}) {
  const colorClasses = {
    red: 'bg-ira-red/10 text-ira-red border-ira-red/20',
    gold: 'bg-ira-gold/10 text-ira-gold border-ira-gold/20',
  }
  
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} border flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm text-white/60">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subValue && (
        <div className="text-sm text-white/40 mt-1">{subValue}</div>
      )}
    </div>
  )
}

function SessionRow({ session }: { session: any }) {
  return (
    <Link 
      href={`/app/sessions/${session.id}`}
      className="flex items-center gap-4 p-4 rounded-lg bg-ira-carbon-700/50 hover:bg-ira-carbon-700 transition-colors group"
    >
      <div className="w-12 h-12 rounded-lg bg-ira-red/10 flex items-center justify-center flex-shrink-0">
        <Calendar className="w-6 h-6 text-ira-red" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-white truncate">
            {session.name || session.track?.name || 'Untitled Session'}
          </span>
          {session.track?.country && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-ira-carbon-600 text-white/60">
              {session.track.country}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-white/50">
          <span>{formatRelativeDate(session.session_date)}</span>
          {session.total_laps && (
            <span>{session.total_laps} laps</span>
          )}
          {session.best_lap_time_ms && (
            <span className="text-ira-gold font-mono">
              {formatLapTime(session.best_lap_time_ms)}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
    </Link>
  )
}

function QuickAction({ 
  href, 
  icon, 
  label, 
  description 
}: { 
  href: string
  icon: React.ReactNode
  label: string
  description: string
}) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-ira-carbon-700 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-ira-carbon-700 group-hover:bg-ira-red/20 flex items-center justify-center transition-colors">
        <span className="text-white/60 group-hover:text-ira-red transition-colors">
          {icon}
        </span>
      </div>
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-white/40">{description}</div>
      </div>
    </Link>
  )
}

function AchievementBadge({ emoji }: { emoji: string }) {
  return (
    <div className="w-10 h-10 rounded-full bg-ira-carbon-700 border-2 border-ira-carbon-800 flex items-center justify-center text-lg">
      {emoji}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-ira-carbon-700 flex items-center justify-center mx-auto mb-4">
        <Upload className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No sessions yet</h3>
      <p className="text-white/50 mb-6">
        Import your first CSV to start analyzing
      </p>
      <Link href="/app/sessions/import" className="btn-racing">
        Import Session
      </Link>
    </div>
  )
}
