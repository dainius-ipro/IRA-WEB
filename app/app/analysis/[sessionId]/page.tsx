// app/app/analysis/[sessionId]/page.tsx
// IRA Web - Session Analysis Page with Track Map

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AnalysisView } from './AnalysisView'

interface PageProps {
  params: { sessionId: string }
  searchParams: { tab?: string; lap?: string }
}

export default async function AnalysisPage({ params, searchParams }: PageProps) {
  const supabase = await createServerSupabaseClient()
  
  // Fetch session with laps
  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      track:tracks(*),
      driver:drivers(*),
      laps:laps(*)
    `)
    .eq('id', params.sessionId)
    .single()

  if (error || !session) {
    notFound()
  }

  // Fetch telemetry points for all laps
  const lapIds = session.laps?.map((l: any) => l.id) || []
  
  const { data: telemetryPoints } = await supabase
    .from('telemetry_points')
    .select('*')
    .in('lap_id', lapIds)
    .order('timestamp', { ascending: true })

  // Sort laps by lap number
  const sortedLaps = session.laps?.sort((a: any, b: any) => a.lap_number - b.lap_number) || []

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-ira-carbon-700">
        <Link 
          href={`/app/sessions/${params.sessionId}`}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Session
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {session.name || session.track?.name || 'Session Analysis'}
            </h1>
            <p className="text-white/60">
              {session.track?.name && `${session.track.name}, ${session.track.country}`}
              {' • '}
              {sortedLaps.length} laps
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Content */}
      <div className="flex-1 overflow-hidden">
        <AnalysisView 
          session={session}
          laps={sortedLaps}
          telemetryPoints={telemetryPoints || []}
          initialTab={searchParams.tab}
          initialLapId={searchParams.lap}
        />
      </div>
    </div>
  )
}
