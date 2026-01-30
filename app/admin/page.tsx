// app/admin/page.tsx
// Admin Dashboard - Tracks, Drivers, Sessions overview

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Get all stats
  const [
    { count: usersCount },
    { count: sessionsCount },
    { count: lapsCount },
    { count: tracksCount },
    { data: tracks },
    { data: recentSessions },
    { data: topDrivers }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('laps').select('*', { count: 'exact', head: true }),
    supabase.from('tracks').select('*', { count: 'exact', head: true }),
    supabase.from('tracks').select('*, sessions:sessions(count)').order('name').limit(5),
    supabase.from('sessions').select('*, profiles(full_name, email), tracks(name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('sessions').select('user_id, profiles(full_name)').limit(100)
  ])

  // Calculate driver session counts
  const driverCounts = (topDrivers || []).reduce((acc: any, s: any) => {
    const name = s.profiles?.full_name || 'Unknown'
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})
  const sortedDrivers = Object.entries(driverCounts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10)

  return (
    <div className="min-h-screen bg-ira-carbon-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/60">IRA Platform Overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-ira-red">{usersCount || 0}</div>
            <div className="text-white/50">Total Users</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-green-500">{sessionsCount || 0}</div>
            <div className="text-white/50">Sessions</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-ira-gold">{lapsCount || 0}</div>
            <div className="text-white/50">Total Laps</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-4xl font-bold text-blue-500">{tracksCount || 0}</div>
            <div className="text-white/50">Tracks</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Tracks List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">🏁 Tracks</h2>
              <Link 
                href="/admin/tracks"
                className="text-sm text-ira-red hover:text-ira-red/80 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-ira-carbon-800">
                  <tr>
                    <th className="text-left py-3 px-4 text-white/50">Track</th>
                    <th className="text-left py-3 px-4 text-white/50">Country</th>
                    <th className="text-right py-3 px-4 text-white/50">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks?.map((track: any) => (
                    <tr key={track.id} className="border-t border-ira-carbon-700 hover:bg-ira-carbon-700/30">
                      <td className="py-3 px-4">
                        <Link href={`/admin/tracks/${track.id}`} className="text-white font-medium hover:text-ira-red">
                          {track.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-white/70">{track.country || '-'}</td>
                      <td className="py-3 px-4 text-right text-ira-gold font-mono">
                        {track.sessions?.[0]?.count || 0}
                      </td>
                    </tr>
                  ))}
                  {(!tracks || tracks.length === 0) && (
                    <tr><td colSpan={3} className="py-8 text-center text-white/50">No tracks yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Drivers */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">🏆 Top Drivers</h2>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-ira-carbon-800">
                  <tr>
                    <th className="text-left py-3 px-4 text-white/50">#</th>
                    <th className="text-left py-3 px-4 text-white/50">Driver</th>
                    <th className="text-right py-3 px-4 text-white/50">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDrivers.map(([name, count], i) => (
                    <tr key={name} className="border-t border-ira-carbon-700">
                      <td className="py-3 px-4 text-white/50">{i + 1}</td>
                      <td className="py-3 px-4 text-white font-medium">{name}</td>
                      <td className="py-3 px-4 text-right text-ira-gold font-mono">{count as number}</td>
                    </tr>
                  ))}
                  {sortedDrivers.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-white/50">No drivers yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">📊 Recent Sessions</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-ira-carbon-800">
                <tr>
                  <th className="text-left py-3 px-4 text-white/50">Session</th>
                  <th className="text-left py-3 px-4 text-white/50">Driver</th>
                  <th className="text-left py-3 px-4 text-white/50">Track</th>
                  <th className="text-left py-3 px-4 text-white/50">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions?.map((session: any) => (
                  <tr key={session.id} className="border-t border-ira-carbon-700 hover:bg-ira-carbon-700/30">
                    <td className="py-3 px-4 text-white font-medium">
                      {session.tracks?.name ? (
                        <Link 
                          href={`/admin/tracks/${session.track_id}/sessions/${session.id}`}
                          className="hover:text-ira-red"
                        >
                          {session.name || 'Unnamed'}
                        </Link>
                      ) : (
                        session.name || 'Unnamed'
                      )}
                    </td>
                    <td className="py-3 px-4 text-white/70">
                      {session.profiles?.full_name || session.profiles?.email || '-'}
                    </td>
                    <td className="py-3 px-4 text-white/70">{session.tracks?.name || '-'}</td>
                    <td className="py-3 px-4 text-white/50">
                      {new Date(session.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!recentSessions || recentSessions.length === 0) && (
                  <tr><td colSpan={4} className="py-8 text-center text-white/50">No sessions yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
