import { NextRequest, NextResponse } from ‘next/server’
import { createServerSupabaseClient } from ‘@/lib/supabase/server’

const LAMBDA_URL = ‘https://ugo5c26hexgdezdzgikoo27nny0crxvz.lambda-url.eu-north-1.on.aws/’

export async function POST(request: NextRequest) {
try {
const supabase = await createServerSupabaseClient()
const { data: { user } } = await supabase.auth.getUser()

```
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const body = await request.json()
const { sessionId, lapId, analysisType = 'general' } = body

const { data: sessionData, error: sessionError } = await supabase
  .from('sessions')
  .select('*, tracks(name), laps(id, lap_number, lap_time_ms, max_speed_kmh, avg_speed_kmh)')
  .eq('id', sessionId)
  .single()

if (sessionError || !sessionData) {
  return NextResponse.json({ error: 'Session not found' }, { status: 404 })
}

const session = sessionData as any
const lapsArray = (session.laps || []) as any[]

let targetLap = null
if (lapId) {
  targetLap = lapsArray.find((l: any) => l.id === lapId)
} else {
  targetLap = lapsArray.find((l: any) => l.lap_time_ms === session.best_lap_time_ms) || lapsArray[0]
}

const lambdaRequest = {
  sessionData: {
    track: session.tracks?.name || session.name || 'Unknown Track',
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

const lambdaResponse = await fetch(LAMBDA_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(lambdaRequest),
})

if (!lambdaResponse.ok) {
  return NextResponse.json({ error: 'AI service error' }, { status: 502 })
}

const lambdaData = await lambdaResponse.json()

if (!lambdaData.success || !lambdaData.analysis) {
  return NextResponse.json({ error: lambdaData.error || 'No analysis returned' }, { status: 500 })
}

let savedInsight = null
try {
  const { data: insight } = await (supabase as any)
    .from('ai_insights')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      insight_type: analysisType,
      title: analysisType === 'general' ? 'Session Analysis' : 'AI Coaching',
      summary: lambdaData.analysis.substring(0, 500),
      detailed_analysis: lambdaData.analysis,
      model_version: lambdaData.model || 'claude',
      tokens_used: (lambdaData.usage?.input_tokens || 0) + (lambdaData.usage?.output_tokens || 0),
    })
    .select()
    .single()
  savedInsight = insight
} catch (e) {
  // ignore
}

return NextResponse.json({
  success: true,
  analysis: lambdaData.analysis,
  insight: savedInsight || {
    id: 'temp-' + Date.now(),
    title: 'Session Analysis',
    insight_type: analysisType,
    detailed_analysis: lambdaData.analysis,
    created_at: new Date().toISOString(),
  },
  usage: lambdaData.usage,
})
```

} catch (error: any) {
return NextResponse.json({ error: error.message || ‘Internal error’ }, { status: 500 })
}
}