// app/app/pro/page.tsx
// Pro Analysis Panel - Race Studio / Alfano ADA style

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProAnalysisPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Get user sessions with full telemetry stats
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, tracks(name), laps(id, lap_time_ms, max_speed_kmh, is_best)')
    .eq('user_id', user.id)
    .order('session_date', { ascending: false })
    .limit(20) as { data: any[] | null }

  return (
    <div className="min-h-screen bg-ira-carbon-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Pro Analysis</h1>
            <p className="text-white/60">Advanced telemetry tools for coaches & professionals</p>
          </div>
          <Link href="/app" className="text-white/60 hover:text-white">← Back to Dashboard</Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-ira-red">{sessions?.length || 0}</div>
            <div className="text-sm text-white/50">Total Sessions</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-green-500">
              {sessions?.reduce((sum, s) => sum + ((s.laps as any[])?.length || 0), 0) || 0}
            </div>
            <div className="text-sm text-white/50">Total Laps</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-ira-gold">
              {new Set(sessions?.map(s => (s.tracks as any)?.name).filter(Boolean)).size}
            </div>
            <div className="text-sm text-white/50">Tracks Driven</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {Math.max(...(sessions?.flatMap(s => (s.laps as any[])?.map(l => l.max_speed_kmh) || [0]) || [0])).toFixed(0)}
            </div>
            <div className="text-sm text-white/50">Top Speed (km/h)</div>
          </div>
        </div>

        {/* Pro Tools Grid */}
        <h2 className="text-xl font-bold text-white mb-4">Analysis Tools</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6 hover:border-ira-red/50 transition-colors cursor-pointer">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Lap Overlay</h3>
            <p className="text-white/60 text-sm">Compare up to 5 laps simultaneously with delta analysis</p>
          </div>
          <div className="card p-6 hover:border-ira-red/50 transition-colors cursor-pointer">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-white mb-2">Sector Analysis</h3>
            <p className="text-white/60 text-sm">Breakdown by sector with theoretical best calculation</p>
          </div>
          <div className="card p-6 hover:border-ira-red/50 transition-colors cursor-pointer">
            <div className="text-3xl mb-3">🛑</div>
            <h3 className="text-lg font-bold text-white mb-2">Braking Zones</h3>
            <p className="text-white/60 text-sm">Detailed braking analysis with consistency metrics</p>
          </div>
          <div className="card p-6 hover:border-ira-red/50 transition-colors cursor-pointer">
            <div className="text-3xl mb-3">🏎️</div>
            <h3 className="text-lg font-bold text-white mb-2">Racing Line</h3>
            <p className="text-white/60 text-sm">GPS trajectory comparison with ideal line overlay</p>
          </div>
          <div className="card p-6 hover:border-ira-red/50 transition-colors cursor-pointer">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-lg font-bold text-white mb-2">Consistency Report</h3>
            <p className="text-white/60 text-sm">Lap time distribution, variance analysis, trends</p>
          </div>
          <div className="card p-6 hover:border-ira-red/50 transition-colors cursor-pointer">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-bold text-white mb-2">AI Deep Analysis</h3>
            <p className="text-white/60 text-sm">Full telemetry AI review with coaching report</p>
          </div>
        </div>

        {/* Recent Sessions Table */}
        <h2 className="text-xl font-bold text-white mb-4">Recent Sessions</h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-ira-carbon-800">
              <tr>
                <th className="text-left py-3 px-4 text-white/50 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium">Track</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium">Laps</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium">Best Lap</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions?.map((session: any) => {
                const bestLap = (session.laps as any[])?.find(l => l.is_best)
                return (
                  <tr key={session.id} className="border-t border-ira-carbon-700">
                    <td className="py-3 px-4 text-white">{new Date(session.session_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-white">{session.tracks?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-white">{(session.laps as any[])?.length || 0}</td>
                    <td className="py-3 px-4 text-ira-gold font-mono">
                      {bestLap ? `${Math.floor(bestLap.lap_time_ms/60000)}:${((bestLap.lap_time_ms%60000)/1000).toFixed(3).padStart(6,'0')}` : '--'}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/app/sessions/${session.id}`} className="text-ira-red hover:underline">
                        Analyze →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
