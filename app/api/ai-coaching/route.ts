import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const LAMBDA_URL = 'https://ugo5c26hexgdezdzgikoo27nny0crxvz.lambda-url.eu-north-1.on.aws/'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, analysisType = 'general' } = body

    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*, tracks(name), laps(id, lap_number, lap_time_ms, max_speed_kmh)')
      .eq('id', sessionId)
      .single()

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const session = sessionData as any
    const laps = (session.laps || []) as any[]
    const targetLap = laps[0]

    const lambdaRequest = {
      sessionData: {
        track: session.tracks?.name || session.name || 'Unknown',
        driver: 'Driver',
        bestLap: session.best_lap_time_ms ? session.best_lap_time_ms / 1000 : 60,
        totalLaps: laps.length,
        topSpeed: targetLap?.max_speed_kmh || 100,
      },
      analysisType,
    }

    const lambdaResponse = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lambdaRequest),
    })

    const lambdaData = await lambdaResponse.json()

    if (!lambdaData.success) {
      return NextResponse.json({ error: lambdaData.error || 'Analysis failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analysis: lambdaData.analysis,
      insight: {
        id: 'temp-' + Date.now(),
        title: 'Session Analysis',
        insight_type: analysisType,
        detailed_analysis: lambdaData.analysis,
        created_at: new Date().toISOString(),
      },
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 })
  }
}