// app/pro/page.tsx
// Pro Analysis Studio - Alfano ADA / Race Studio style
// All-in-one telemetry analysis screen

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProStudioClient from './ProStudioClient'

export default async function ProStudioPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Get user sessions with laps and telemetry
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      tracks(name),
      laps(
        id, 
        lap_number,
        lap_time_ms, 
        max_speed_kmh, 
        is_best,
        sector1_ms,
        sector2_ms,
        sector3_ms
      )
    `)
    .eq('user_id', user.id)
    .order('session_date', { ascending: false })
    .limit(20) as { data: any[] | null }

  return <ProStudioClient sessions={sessions || []} userId={user.id} />
}
