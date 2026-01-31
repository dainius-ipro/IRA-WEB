'use client'

// ProStudioClient.tsx - Alfano ADA / Race Studio style interface
// All-in-one telemetry analysis with lap table, track map, charts, video placeholder

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { TrackMap } from '@/components/track-map'
import { TelemetryCharts } from '@/components/charts'

interface Lap {
  id: string
  lap_number: number
  lap_time_ms: number
  max_speed_kmh: number | null
  is_best: boolean
  sector1_ms: number | null
  sector2_ms: number | null
  sector3_ms: number | null
}

interface Session {
  id: string
  session_date: string
  tracks: { name: string } | null
  laps: Lap[]
}

interface Props {
  sessions: Session[]
  userId: string
}

export default function ProStudioClient({ sessions, userId }: Props) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(sessions[0] || null)
  const [selectedLapIds, setSelectedLapIds] = useState<string[]>([])
  const [telemetryPoints, setTelemetryPoints] = useState<any[]>([])
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false)
  const [activePanel, setActivePanel] = useState<'map' | 'charts' | 'video'>('map')
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load telemetry when session changes
  useEffect(() => {
    if (!selectedSession) return
    
    const loadTelemetry = async () => {
      setIsLoadingTelemetry(true)
      const lapIds = selectedSession.laps.map(l => l.id)
      
      const { data } = await supabase
        .from('telemetry_points')
        .select('*')
        .in('lap_id', lapIds)
        .order('timestamp', { ascending: true })
      
      setTelemetryPoints(data || [])
      setIsLoadingTelemetry(false)
      
      // Auto-select best lap
      const bestLap = selectedSession.laps.find(l => l.is_best)
      if (bestLap) {
        setSelectedLapIds([bestLap.id])
      } else if (selectedSession.laps.length > 0) {
        setSelectedLapIds([selectedSession.laps[0].id])
      }
    }
    
    loadTelemetry()
  }, [selectedSession])

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
    if (!selectedSession) return null
    const times = selectedSession.laps.map(l => l.lap_time_ms).filter(Boolean)
    return times.length > 0 ? Math.min(...times) : null
  }, [selectedSession])

  const toggleLapSelection = (lapId: string) => {
    setSelectedLapIds(prev => 
      prev.includes(lapId) 
        ? prev.filter(id => id !== lapId)
        : [...prev, lapId].slice(-5) // Max 5 laps
    )
  }

  const selectedLaps = selectedSession?.laps.filter(l => selectedLapIds.includes(l.id)) || []

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Header Bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app" className="text-white/60 hover:text-white text-sm">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-bold text-ira-gold">⚡ Pro Studio</h1>
        </div>
        
        {/* Session Selector */}
        <select 
          value={selectedSession?.id || ''}
          onChange={(e) => {
            const s = sessions.find(s => s.id === e.target.value)
            setSelectedSession(s || null)
          }}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white"
        >
          {sessions.map(s => (
            <option key={s.id} value={s.id}>
              {s.tracks?.name || 'Unknown'} - {new Date(s.session_date).toLocaleDateString()}
            </option>
          ))}
        </select>
        
        <div className="text-sm text-white/50">
          {selectedLapIds.length}/5 laps selected
        </div>
      </div>

      {/* Main Layout - Split Screen */}
      <div className="flex h-[calc(100vh-52px)]">
        
        {/* Left Panel - Lap Table */}
        <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          {/* Lap Table Header */}
          <div className="bg-zinc-800 px-2 py-2 text-xs font-medium grid grid-cols-6 gap-1">
            <span className="text-white/50">Lap</span>
            <span className="text-white/50">Time</span>
            <span className="text-white/50">S1</span>
            <span className="text-white/50">S2</span>
            <span className="text-white/50">S3</span>
            <span className="text-white/50">Delta</span>
          </div>
          
          {/* Lap Rows */}
          <div className="flex-1 overflow-y-auto">
            {selectedSession?.laps.map((lap, idx) => {
              const isSelected = selectedLapIds.includes(lap.id)
              const isBest = lap.lap_time_ms === bestLapTime
              const delta = formatDelta(lap.lap_time_ms, bestLapTime)
              
              // Color coding for lap selection
              const colors = ['text-red-500', 'text-green-500', 'text-cyan-500', 'text-yellow-500', 'text-purple-500']
              const colorClass = isSelected ? colors[selectedLapIds.indexOf(lap.id)] : 'text-white'
              
              return (
                <div 
                  key={lap.id}
                  onClick={() => toggleLapSelection(lap.id)}
                  className={`
                    px-2 py-1.5 grid grid-cols-6 gap-1 text-xs font-mono cursor-pointer border-b border-zinc-800
                    ${isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}
                    ${isBest ? 'bg-purple-900/30' : ''}
                  `}
                >
                  <span className={colorClass}>{lap.lap_number}</span>
                  <span className={`${isBest ? 'text-purple-400' : colorClass}`}>
                    {formatTime(lap.lap_time_ms)}
                  </span>
                  <span className="text-white/70">{lap.sector1_ms ? (lap.sector1_ms/1000).toFixed(2) : '--'}</span>
                  <span className="text-white/70">{lap.sector2_ms ? (lap.sector2_ms/1000).toFixed(2) : '--'}</span>
                  <span className="text-white/70">{lap.sector3_ms ? (lap.sector3_ms/1000).toFixed(2) : '--'}</span>
                  <span className={delta.startsWith('+') ? 'text-red-400' : 'text-green-400'}>
                    {delta}
                  </span>
                </div>
              )
            })}
          </div>
          
          {/* Stats Footer */}
          <div className="bg-zinc-800 px-3 py-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/50">Best:</span>
              <span className="text-purple-400 font-mono">{formatTime(bestLapTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Laps:</span>
              <span className="text-white">{selectedSession?.laps.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Visualization */}
        <div className="flex-1 flex flex-col">
          
          {/* Panel Tabs */}
          <div className="bg-zinc-900 border-b border-zinc-800 px-4 flex gap-1">
            {[
              { id: 'map', label: '🗺️ Track Map', icon: '🗺️' },
              { id: 'charts', label: '📊 Telemetry', icon: '📊' },
              { id: 'video', label: '🎥 Video', icon: '🎥' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id as any)}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors
                  ${activePanel === tab.id 
                    ? 'text-white bg-zinc-800 border-t-2 border-ira-red' 
                    : 'text-white/50 hover:text-white'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 relative">
            {isLoadingTelemetry ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white/50">Loading telemetry...</div>
              </div>
            ) : (
              <>
                {/* Track Map Panel */}
                {activePanel === 'map' && (
                  <div className="h-full">
                    {telemetryPoints.length > 0 ? (
                      <TrackMap 
                        telemetryPoints={telemetryPoints}
                        laps={selectedSession?.laps as any || []}
                        selectedLapIds={selectedLapIds}
                        showHeatmap={true}
                        className="h-full"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/50">
                        No GPS data available
                      </div>
                    )}
                  </div>
                )}

                {/* Telemetry Charts Panel */}
                {activePanel === 'charts' && (
                  <div className="h-full overflow-y-auto p-4">
                    {telemetryPoints.length > 0 ? (
                      <TelemetryCharts 
                        telemetryPoints={telemetryPoints}
                        selectedLapIds={selectedLapIds}
                        laps={selectedSession?.laps as any || []}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/50">
                        No telemetry data available
                      </div>
                    )}
                  </div>
                )}

                {/* Video Panel - Coming Soon */}
                {activePanel === 'video' && (
                  <div className="h-full flex flex-col items-center justify-center bg-zinc-900">
                    <div className="text-6xl mb-4">🎥</div>
                    <h3 className="text-xl font-bold text-white mb-2">Video Overlay</h3>
                    <p className="text-white/50 text-center max-w-md">
                      Sync your onboard video with telemetry data for frame-by-frame analysis
                    </p>
                    <div className="mt-4 px-4 py-2 bg-ira-gold/20 text-ira-gold rounded-full text-sm font-medium">
                      🚧 Coming Soon
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Info Bar */}
          <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex gap-6">
              {selectedLaps.map((lap, idx) => {
                const colors = ['bg-red-500', 'bg-green-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-purple-500']
                return (
                  <div key={lap.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${colors[idx]}`}></div>
                    <span className="text-white/70">Lap {lap.lap_number}</span>
                    <span className="text-white font-mono">{formatTime(lap.lap_time_ms)}</span>
                  </div>
                )
              })}
            </div>
            <div className="text-white/50">
              {telemetryPoints.length.toLocaleString()} data points
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
