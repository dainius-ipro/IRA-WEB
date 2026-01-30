'use client'

// AdminProStudioClient.tsx - Admin version of Pro Studio for single session
// Reuses same UI as public Pro Studio but with single session context

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { TrackMap } from '@/components/track-map'
import { TelemetryCharts } from '@/components/charts'

interface Lap {
  id: string
  lap_number: number
  lap_time_ms: number | null
  max_speed_kmh: number | null
  is_best: boolean
  sector1_ms: number | null
  sector2_ms: number | null
  sector3_ms: number | null
}

interface Session {
  id: string
  name: string | null
  session_date: string
  tracks: { id: string; name: string; country: string | null } | null
  profiles: { full_name: string | null; email: string | null } | null
  laps: Lap[]
}

interface Props {
  session: Session
  trackId: string
}

const LAP_COLORS = [
  { bg: 'bg-red-500', text: 'text-red-400', hex: '#ef4444' },
  { bg: 'bg-green-500', text: 'text-green-400', hex: '#22c55e' },
  { bg: 'bg-cyan-500', text: 'text-cyan-400', hex: '#06b6d4' },
  { bg: 'bg-yellow-500', text: 'text-yellow-400', hex: '#eab308' },
  { bg: 'bg-purple-500', text: 'text-purple-400', hex: '#a855f7' },
]

export default function AdminProStudioClient({ session, trackId }: Props) {
  const [selectedLapIds, setSelectedLapIds] = useState<string[]>([])
  const [telemetryPoints, setTelemetryPoints] = useState<any[]>([])
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false)
  const [activePanel, setActivePanel] = useState<'map' | 'charts' | 'video'>('map')
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load telemetry on mount
  useEffect(() => {
    const loadTelemetry = async () => {
      setIsLoadingTelemetry(true)
      const lapIds = session.laps.map(l => l.id)
      
      if (lapIds.length === 0) {
        setIsLoadingTelemetry(false)
        return
      }
      
      const { data } = await supabase
        .from('telemetry_points')
        .select('*')
        .in('lap_id', lapIds)
        .order('timestamp', { ascending: true })
      
      setTelemetryPoints(data || [])
      setIsLoadingTelemetry(false)
      
      // Auto-select best lap
      const bestLap = session.laps.find(l => l.is_best)
      if (bestLap) {
        setSelectedLapIds([bestLap.id])
      } else if (session.laps.length > 0) {
        setSelectedLapIds([session.laps[0].id])
      }
    }
    
    loadTelemetry()
  }, [session.id])

  const formatTime = (ms: number | null) => {
    if (!ms) return '--:--:---'
    const mins = Math.floor(ms / 60000)
    const secs = ((ms % 60000) / 1000).toFixed(3).padStart(6, '0')
    return `${mins}:${secs}`
  }

  const formatDelta = (current: number | null, best: number | null) => {
    if (!current || !best) return ''
    const delta = (current - best) / 1000
    if (delta === 0) return ''
    return delta > 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3)
  }

  const bestLapTime = useMemo(() => {
    const times = session.laps.map(l => l.lap_time_ms).filter(Boolean) as number[]
    return times.length > 0 ? Math.min(...times) : null
  }, [session])

  const toggleLapSelection = (lapId: string) => {
    setSelectedLapIds(prev => 
      prev.includes(lapId) 
        ? prev.filter(id => id !== lapId)
        : [...prev, lapId].slice(-5) // Max 5 laps
    )
  }

  const getLapColor = (lapId: string) => {
    const index = selectedLapIds.indexOf(lapId)
    return index >= 0 ? LAP_COLORS[index] : null
  }

  // Filter telemetry for selected laps
  const filteredTelemetry = useMemo(() => {
    if (selectedLapIds.length === 0) return telemetryPoints
    return telemetryPoints.filter(p => selectedLapIds.includes(p.lap_id))
  }, [telemetryPoints, selectedLapIds])

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left Panel - Lap Table */}
      <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        {/* Session Info */}
        <div className="p-3 border-b border-zinc-800">
          <div className="text-xs text-zinc-500">
            {session.laps.length} laps • {selectedLapIds.length} selected
          </div>
        </div>

        {/* Lap Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/50 sticky top-0">
              <tr>
                <th className="py-2 px-2 text-left text-zinc-500 font-medium">Lap</th>
                <th className="py-2 px-2 text-right text-zinc-500 font-medium">Time</th>
                <th className="py-2 px-2 text-right text-zinc-500 font-medium">S1</th>
                <th className="py-2 px-2 text-right text-zinc-500 font-medium">S2</th>
                <th className="py-2 px-2 text-right text-zinc-500 font-medium">S3</th>
                <th className="py-2 px-2 text-right text-zinc-500 font-medium">Δ</th>
              </tr>
            </thead>
            <tbody>
              {session.laps.map((lap) => {
                const color = getLapColor(lap.id)
                const isSelected = selectedLapIds.includes(lap.id)
                const isBest = lap.lap_time_ms === bestLapTime
                return (
                  <tr 
                    key={lap.id}
                    onClick={() => toggleLapSelection(lap.id)}
                    className={`cursor-pointer border-b border-zinc-800/50 transition-colors ${
                      isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-800/30'
                    }`}
                  >
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        {color && (
                          <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                        )}
                        <span className={`font-mono ${isBest ? 'text-purple-400 font-bold' : 'text-white'}`}>
                          {lap.lap_number}
                        </span>
                      </div>
                    </td>
                    <td className={`py-2 px-2 text-right font-mono ${isBest ? 'text-purple-400 font-bold' : 'text-white'}`}>
                      {formatTime(lap.lap_time_ms)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-zinc-400 text-xs">
                      {formatTime(lap.sector1_ms)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-zinc-400 text-xs">
                      {formatTime(lap.sector2_ms)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-zinc-400 text-xs">
                      {formatTime(lap.sector3_ms)}
                    </td>
                    <td className={`py-2 px-2 text-right font-mono text-xs ${
                      lap.lap_time_ms === bestLapTime ? 'text-purple-400' : 'text-red-400'
                    }`}>
                      {formatDelta(lap.lap_time_ms, bestLapTime)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {session.laps.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              No laps in this session
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Visualization */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Tab Bar */}
        <div className="flex border-b border-zinc-800">
          {(['map', 'charts', 'video'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePanel(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activePanel === tab
                  ? 'text-white border-b-2 border-red-500 bg-zinc-900/50'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab === 'map' && '🗺️ Track Map'}
              {tab === 'charts' && '📊 Telemetry'}
              {tab === 'video' && '🎬 Video'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {isLoadingTelemetry && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-white">Loading telemetry...</div>
            </div>
          )}

          {activePanel === 'map' && (
            <div className="h-full">
              <TrackMap 
                laps={session.laps as any}
                selectedLapIds={selectedLapIds}
                telemetryPoints={filteredTelemetry}
                lapColors={selectedLapIds.map((_, i) => LAP_COLORS[i]?.hex || '#ffffff')}
              />
            </div>
          )}

          {activePanel === 'charts' && (
            <div className="h-full overflow-auto p-4">
              <TelemetryCharts 
                telemetryPoints={filteredTelemetry}
                laps={session.laps as any}
                selectedLapIds={selectedLapIds}
              />
            </div>
          )}

          {activePanel === 'video' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-zinc-500">
                <div className="text-6xl mb-4">🎬</div>
                <div className="text-xl font-medium">Video Overlay</div>
                <div className="text-sm">Coming soon</div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {selectedLapIds.map((lapId, i) => {
              const lap = session.laps.find(l => l.id === lapId)
              return (
                <span key={lapId} className={`flex items-center gap-1 ${LAP_COLORS[i]?.text || 'text-white'}`}>
                  <span className={`w-2 h-2 rounded-full ${LAP_COLORS[i]?.bg || 'bg-white'}`} />
                  Lap {lap?.lap_number}
                </span>
              )
            })}
          </div>
          <div className="text-zinc-500">
            {telemetryPoints.length.toLocaleString()} data points
          </div>
        </div>
      </div>
    </div>
  )
}
