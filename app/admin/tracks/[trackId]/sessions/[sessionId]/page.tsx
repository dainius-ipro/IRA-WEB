// app/admin/tracks/[trackId]/sessions/[sessionId]/page.tsx
// Admin Session Pro View - Full Alfano ADA style analysis

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AdminProStudioClient from './AdminProStudioClient'

export default async function AdminSessionProPage({ 
  params 
}: { 
  params: Promise<{ trackId: string; sessionId: string }> 
}) {
  const { trackId, sessionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Get session with laps and track
  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      tracks(id, name, country),
      profiles(full_name, email),
      laps(
        id,
        lap_number,
        lap_time_ms,
        is_valid,
        is_best,
        max_speed_kmh,
        avg_speed_kmh,
        sector1_ms,
        sector2_ms,
        sector3_ms
      )
    `)
    .eq('id', sessionId)
    .single()

  if (error || !session) {
    redirect(`/admin/tracks/${trackId}`)
  }

  // Sort laps by lap number
  const sortedLaps = [...(session.laps || [])].sort((a: any, b: any) => a.lap_number - b.lap_number)

  return (
    <div className="min-h-screen bg-black">
      {/* Compact Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/admin/tracks/${trackId}`}
              className="text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-white font-semibold">
                {session.name || 'Session'}
              </h1>
              <div className="text-xs text-white/50">
                {session.tracks?.name} • {session.profiles?.full_name || 'Unknown Driver'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/50">
              {new Date(session.session_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Pro Studio Interface */}
      <AdminProStudioClient 
        session={{
          ...session,
          laps: sortedLaps
        }}
        trackId={trackId}
      />
    </div>
  )
}
