// app/api/ai-coaching/route.ts
// AI Coaching API - calls Lambda for analysis

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
    const { sessionId, lapId, analysisType = 'general' } = body

    console.log('[AI-Coaching] Request:', { sessionId, lapId, analysisType, userId: user.id })

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*, tracks(name), laps(id, lap_number, lap_time_ms, max_speed_kmh, avg_speed_kmh)')
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      console.error('[AI-Coaching] Session error:', sessionError)
      return NextResponse.json({ error: `Session error: ${sessionError.message}` }, { status: 400 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get specific lap if provided
    let targetLap = null
    const lapsArray = (session.laps || []) as any[]
    
    if (lapId) {
      targetLap = lapsArray.find((l: any) => l.id === lapId)
    } else {
      targetLap = lapsArray.find((l: any) => l.lap_time_ms === session.best_lap_time_ms) || lapsArray[0]
    }

    // Prepare Lambda request
    const lambdaRequest = {
      sessionData: {
        track: (session.tracks as any)?.name || session.name || 'Unknown Track',
        driver: 'Driver',
        bestLap: session.best_lap_time_ms ? session.best_lap_time_ms / 1000 : undefined,
        avgLap: targetLap?.lap_time_ms ? targetLap.lap_time_ms / 1000 : undefined,
        totalLaps: session.total_laps || lapsArray.length,
        topSpeed: targetLap?.max_speed_kmh,
        avgSpeed: targetLap?.avg_speed_kmh,
        lapNumber: targetLap?.lap_number,
      },
      analysisType,
    }

    console.log('[AI-Coaching] Calling Lambda with:', lambdaRequest)

    // Call Lambda
    const lambdaResponse = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lambdaRequest),
    })

    if (!lambdaResponse.ok) {
      const errorText = await lambdaResponse.text()
      console.error('[AI-Coaching] Lambda error:', errorText)
      return NextResponse.json({ error: 'AI service error' }, { status: 502 })
    }

    const lambdaData = await lambdaResponse.json()

    console.log('[AI-Coaching] Lambda response:', { success: lambdaData.success, hasAnalysis: !!lambdaData.analysis })

    if (!lambdaData.success || !lambdaData.analysis) {
      return NextResponse.json({ error: lambdaData.error || 'No analysis returned' }, { status: 500 })
    }

    // Try to save insight - but don't fail if insert fails
    let savedInsight = null
    try {
      const { data: insight, error: insertError } = await supabase
        .from('ai_insights')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          insight_type: analysisType,
          title: getInsightTitle(analysisType),
          summary: lambdaData.analysis.substring(0, 500),
          detailed_analysis: lambdaData.analysis,
          model_version: lambdaData.model || 'claude',
          tokens_used: (lambdaData.usage?.input_tokens || 0) + (lambdaData.usage?.output_tokens || 0),
        })
        .select()
        .single()

      if (insertError) {
        console.error('[AI-Coaching] Insert error (non-fatal):', insertError)
      } else {
        savedInsight = insight
      }
    } catch (e) {
      console.error('[AI-Coaching] Insert exception (non-fatal):', e)
    }

    return NextResponse.json({
      success: true,
      analysis: lambdaData.analysis,
      insight: savedInsight || {
        id: `temp-${Date.now()}`,
        title: getInsightTitle(analysisType),
        insight_type: analysisType,
        detailed_analysis: lambdaData.analysis,
        created_at: new Date().toISOString(),
      },
      usage: lambdaData.usage,
    })

  } catch (error: any) {
    console.error('[AI-Coaching] Fatal error:', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}

function getInsightTitle(type: string): string {
  const titles: Record<string, string> = {
    general: 'Session Analysis',
    lap_comparison: 'Lap Comparison',
    braking_zones: 'Braking Analysis',
    racing_line: 'Racing Line Tips',
    consistency: 'Consistency Analysis',
  }
  return titles[type] || 'AI Coaching'
}