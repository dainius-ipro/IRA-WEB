// app/admin/page.tsx
// Admin Dashboard - Tracks, Drivers, Sessions overview

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  // TODO: Add admin role check
  // if (!isAdmin(user)) redirect('/app')

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
    supabase.from('tracks').select('*').order('name'),
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
            <h2 className="text-xl font-bold text-white mb-4">🏁 All Tracks</h2>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-ira-carbon-800">
                  <tr>
                    <th className="text-left py-3 px-4 text-white/50">Track</th>
                    <th className="text-left py-3 px-4 text-white/50">Country</th>
                    <th className="text-left py-3 px-4 text-white/50">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks?.map((track: any) => (
                    <tr key={track.id} className="border-t border-ira-carbon-700">
                      <td className="py-3 px-4 text-white font-medium">{track.name}</td>
                      <td className="py-3 px-4 text-white/70">{track.country || '-'}</td>
                      <td className="py-3 px-4 text-white/70">{track.length_meters ? `${track.length_meters}m` : '-'}</td>
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
            <h2 className="text-xl font-bold text-white mb-4">🏆 Top Drivers (by sessions)</h2>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-ira-carbon-800">
                  <tr>
                    <th className="text-left py-3 px-4 text-white/50">#</th>
                    <th className="text-left py-3 px-4 text-white/50">Driver</th>
                    <th className="text-left py-3 px-4 text-white/50">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDrivers.map(([name, count]: any, idx: number) => (
                    <tr key={name} className="border-t border-ira-carbon-700">
                      <td className="py-3 px-4 text-white/50">{idx + 1}</td>
                      <td className="py-3 px-4 text-white font-medium">{name}</td>
                      <td className="py-3 px-4 text-ira-gold">{count}</td>
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
        <h2 className="text-xl font-bold text-white mb-4 mt-8">📊 Recent Sessions</h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-ira-carbon-800">
              <tr>
                <th className="text-left py-3 px-4 text-white/50">Date</th>
                <th className="text-left py-3 px-4 text-white/50">Driver</th>
                <th className="text-left py-3 px-4 text-white/50">Track</th>
                <th className="text-left py-3 px-4 text-white/50">Best Lap</th>
                <th className="text-left py-3 px-4 text-white/50">Source</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions?.map((s: any) => (
                <tr key={s.id} className="border-t border-ira-carbon-700">
                  <td className="py-3 px-4 text-white">{new Date(s.session_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-white">{s.profiles?.full_name || s.profiles?.email || 'Unknown'}</td>
                  <td className="py-3 px-4 text-white">{s.tracks?.name || s.name || '-'}</td>
                  <td className="py-3 px-4 text-ira-gold font-mono">
                    {s.best_lap_time_ms ? `${Math.floor(s.best_lap_time_ms/60000)}:${((s.best_lap_time_ms%60000)/1000).toFixed(3).padStart(6,'0')}` : '--'}
                  </td>
                  <td className="py-3 px-4 text-white/50 text-sm">{s.data_source || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
