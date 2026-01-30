// app/admin/tracks/page.tsx
// All Tracks List

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'

export default async function AdminTracksPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Get all tracks with session counts
  const { data: tracks } = await supabase
    .from('tracks')
    .select(`
      id,
      name,
      country,
      length_meters,
      sessions:sessions(count)
    `)
    .order('name')

  const tracksList = (tracks || []) as any[]

  return (
    <div className="min-h-screen bg-ira-carbon-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/admin"
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">🏁 All Tracks</h1>
            <p className="text-white/60">{tracksList.length} tracks in database</p>
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracksList.map((track) => {
            const sessionCount = track.sessions?.[0]?.count || 0
            return (
              <Link
                key={track.id}
                href={`/admin/tracks/${track.id}`}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-ira-red/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">🏎️</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sessionCount > 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-zinc-700/50 text-zinc-400'
                  }`}>
                    {sessionCount} sessions
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white group-hover:text-ira-red transition-colors mb-2">
                  {track.name}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-white/50">
                  {track.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {track.country}
                    </div>
                  )}
                  {track.length_meters && (
                    <div>{track.length_meters}m</div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {tracksList.length === 0 && (
          <div className="text-center py-12 text-white/50">
            No tracks found
          </div>
        )}
      </div>
    </div>
  )
}
