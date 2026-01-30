import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Types
interface Track {
  id: string
  name: string
  country: string | null
  length_meters: number | null
}

interface Session {
  id: string
  session_date: string
  status: string
  best_lap_time: number | null
  total_laps: number | null
  profiles: {
    display_name: string | null
    email: string
  } | null
}

function formatLapTime(seconds: number | null): string {
  if (!seconds) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3)
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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Get track details
  const { data: trackData } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', trackId)
    .single()

  const track = trackData as Track | null

  if (!track) {
    notFound()
  }

  // Get all sessions for this track
  const { data: sessionsData } = await supabase
    .from('sessions')
    .select(`
      id,
      session_date,
      status,
      best_lap_time,
      total_laps,
      profiles (
        display_name,
        email
      )
    `)
    .eq('track_id', trackId)
    .order('session_date', { ascending: false })

  const sessions = (sessionsData || []) as Session[]

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link href="/admin" className="hover:text-white transition-colors">
          Admin
        </Link>
        <span>/</span>
        <Link href="/admin/tracks" className="hover:text-white transition-colors">
          Tracks
        </Link>
        <span>/</span>
        <span className="text-white">{track.name}</span>
      </div>

      {/* Track Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🏁 {track.name}</h1>
          <div className="flex items-center gap-4 text-zinc-400">
            {track.country && <span>{track.country}</span>}
            {track.length_meters && <span>{track.length_meters}m</span>}
            <span>{sessions.length} sessions</span>
          </div>
        </div>
        <Link
          href="/admin/tracks"
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          ← Back to Tracks
        </Link>
      </div>

      {/* Sessions Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">All Sessions</h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No sessions found for this track
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Laps
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Best Lap
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-4 text-white">
                    {session.profiles?.display_name || session.profiles?.email || 'Unknown'}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {formatDate(session.session_date)}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {session.total_laps || '-'}
                  </td>
                  <td className="px-4 py-4 text-green-400 font-mono">
                    {formatLapTime(session.best_lap_time)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      session.status === 'complete' 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/tracks/${trackId}/sessions/${session.id}`}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-500 transition-colors"
                    >
                      Pro Studio →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}