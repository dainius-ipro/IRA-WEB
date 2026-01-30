// app/admin/tracks/page.tsx
// Admin Tracks List - Click to see all sessions for that track

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, ChevronRight } from 'lucide-react'

export default async function AdminTracksPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Get all tracks with session counts
  const { data: tracks } = await supabase
    .from('tracks')
    .select(`
      *,
      sessions:sessions(count)
    `)
    .order('name')

  return (
    <div className="min-h-screen bg-ira-carbon-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <Link 
          href="/admin"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">🏁 All Tracks</h1>
        <p className="text-white/60 mb-8">Click on a track to view all sessions</p>

        {/* Tracks Grid */}
        <div className="grid gap-4">
          {tracks?.map((track: any) => {
            const sessionCount = track.sessions?.[0]?.count || 0
            return (
              <Link 
                key={track.id}
                href={`/admin/tracks/${track.id}`}
                className="card p-4 hover:bg-ira-carbon-700/50 transition-colors group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-ira-carbon-700 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-ira-red" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{track.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      {track.country && <span>{track.country}</span>}
                      {track.length_meters && <span>{track.length_meters}m</span>}
                      <span className="text-ira-gold">{sessionCount} sessions</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
              </Link>
            )
          })}

          {(!tracks || tracks.length === 0) && (
            <div className="card p-12 text-center text-white/50">
              No tracks found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
