// app/app/sessions/[id]/SessionTabs.tsx
// Client component with AI Coaching integration

'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { TelemetryCharts } from '@/components/charts'
import type { Lap, TelemetryPoint } from '@/types/database'

const TrackMap = dynamic(
  () => import('@/components/track-map/TrackMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[500px] flex items-center justify-center bg-ira-carbon-800 rounded-xl">
        <div className="animate-spin w-8 h-8 border-2 border-ira-red border-t-transparent rounded-full" />
      </div>
    )
  }
)

type TabType = 'laps' | 'map' | 'telemetry' | 'ai'

interface SessionTabsProps {
  laps: Lap[]
  telemetryPoints: TelemetryPoint[]
  aiInsights: any[]
  sessionId: string
}

function formatLapTime(ms: number | null): string {
  if (!ms) return '--:--.---'
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const millis = ms % 1000
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`
}

export default function SessionTabs({ 
  laps, 
  telemetryPoints, 
  aiInsights,
  sessionId 
}: SessionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('laps')
  const [selectedLapIds, setSelectedLapIds] = useState<string[]>(() => {
    const bestLap = laps.find(l => l.is_best)
    return bestLap ? [bestLap.id] : laps.length > 0 ? [laps[0].id] : []
  })

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'laps', label: 'Lap Times', icon: '🏁' },
    { id: 'map', label: 'Track Map', icon: '🗺️' },
    { id: 'telemetry', label: 'Telemetry', icon: '📈' },
    { id: 'ai', label: 'AI Coach', icon: '🤖' },
  ]

  const hasGpsData = useMemo(() => {
    return telemetryPoints.filter(p => p.latitude && p.longitude).length > 0
  }, [telemetryPoints])

  const toggleLapSelection = (lapId: string) => {
    setSelectedLapIds(prev => {
      if (prev.includes(lapId)) {
        if (prev.length === 1) return prev
        return prev.filter(id => id !== lapId)
      } else {
        if (prev.length >= 3) return [...prev.slice(1), lapId]
        return [...prev, lapId]
      }
    })
  }

  return (
    <div>
      <div className="flex gap-1 p-1 rounded-xl bg-ira-carbon-800 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-ira-red text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === 'map' && <span className={`ml-1 w-2 h-2 rounded-full ${hasGpsData ? 'bg-green-500' : 'bg-red-500'}`} />}
            {tab.id === 'telemetry' && <span className={`ml-1 w-2 h-2 rounded-full ${telemetryPoints.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} />}
          </button>
        ))}
      </div>

      <div className="card min-h-[400px]">
        {activeTab === 'laps' && <LapsTab laps={laps} selectedLapIds={selectedLapIds} onToggleLap={toggleLapSelection} />}
        {activeTab === 'map' && <MapTab telemetryPoints={telemetryPoints} laps={laps} selectedLapIds={selectedLapIds} hasGpsData={hasGpsData} />}
        {activeTab === 'telemetry' && <TelemetryTab telemetryPoints={telemetryPoints} laps={laps} selectedLapIds={selectedLapIds} />}
        {activeTab === 'ai' && <AITab aiInsights={aiInsights} sessionId={sessionId} />}
      </div>
    </div>
  )
}

function LapsTab({ laps, selectedLapIds, onToggleLap }: { laps: Lap[]; selectedLapIds: string[]; onToggleLap: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Lap Times</h2>
        <span className="text-sm text-white/50">Click to select laps for comparison (max 3)</span>
      </div>
      {laps.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ira-carbon-700">
                <th className="text-left py-3 px-4 text-white/50 font-medium w-10"></th>
                <th className="text-left py-3 px-4 text-white/50 font-medium">Lap</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium">Time</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium hidden md:table-cell">S1</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium hidden md:table-cell">S2</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium hidden md:table-cell">S3</th>
                <th className="text-left py-3 px-4 text-white/50 font-medium">Max Speed</th>
              </tr>
            </thead>
            <tbody>
              {laps.map((lap: any) => {
                const isSelected = selectedLapIds.includes(lap.id)
                return (
                  <tr key={lap.id} onClick={() => onToggleLap(lap.id)} className={`border-b border-ira-carbon-700/50 cursor-pointer transition-colors ${lap.is_best ? 'bg-ira-gold/5' : ''} ${isSelected ? 'bg-ira-red/10 border-l-2 border-l-ira-red' : ''} ${!lap.is_valid ? 'opacity-50' : ''} hover:bg-white/5`}>
                    <td className="py-3 px-4">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-ira-red bg-ira-red' : 'border-white/30'}`}>
                        {isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="font-medium text-white">{lap.lap_number}{lap.is_best && <span className="ml-2 text-ira-gold">⚡</span>}</span></td>
                    <td className="py-3 px-4"><span className={`font-mono font-bold ${lap.is_best ? 'text-ira-gold' : 'text-white'}`}>{formatLapTime(lap.lap_time_ms)}</span></td>
                    <td className="py-3 px-4 hidden md:table-cell"><span className="font-mono text-white/70">{formatLapTime(lap.sector1_ms)}</span></td>
                    <td className="py-3 px-4 hidden md:table-cell"><span className="font-mono text-white/70">{formatLapTime(lap.sector2_ms)}</span></td>
                    <td className="py-3 px-4 hidden md:table-cell"><span className="font-mono text-white/70">{formatLapTime(lap.sector3_ms)}</span></td>
                    <td className="py-3 px-4"><span className="text-white/70">{lap.max_speed_kmh ? `${Math.round(lap.max_speed_kmh)} km/h` : '--'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-white/50">No lap data available</div>
      )}
    </div>
  )
}

function MapTab({ telemetryPoints, laps, selectedLapIds, hasGpsData }: { telemetryPoints: TelemetryPoint[]; laps: Lap[]; selectedLapIds: string[]; hasGpsData: boolean }) {
  if (!hasGpsData) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-ira-carbon-700 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-4xl">🗺️</span></div>
        <h3 className="text-xl font-bold text-white mb-2">No GPS Data</h3>
        <p className="text-white/60">This session does not have GPS coordinates.</p>
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Track Map</h2>
        <span className="text-sm text-white/50">Speed heatmap: 🟢 Slow → 🟡 Mid → 🔴 Fast</span>
      </div>
      <TrackMap telemetryPoints={telemetryPoints} laps={laps} selectedLapIds={selectedLapIds} showHeatmap={true} showBeacons={true} interactive={true} className="h-[500px]" />
    </div>
  )
}

function TelemetryTab({ telemetryPoints, laps, selectedLapIds }: { telemetryPoints: TelemetryPoint[]; laps: Lap[]; selectedLapIds: string[] }) {
  if (telemetryPoints.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-ira-carbon-700 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-4xl">📈</span></div>
        <h3 className="text-xl font-bold text-white mb-2">No Telemetry Data</h3>
        <p className="text-white/60">This session does not have telemetry data.</p>
      </div>
    )
  }
  return <div className="h-[500px]"><TelemetryCharts telemetryPoints={telemetryPoints} laps={laps} selectedLapIds={selectedLapIds} /></div>
}

function AITab({ aiInsights, sessionId }: { aiInsights: any[]; sessionId: string }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsights] = useState(aiInsights)

  const generateAnalysis = async (analysisType: string = 'general') => {
    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch('/api/ai-coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, analysisType }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate analysis')
      if (data.insight) setInsights(prev => [data.insight, ...prev])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">AI Coaching</h2>
        <button onClick={() => generateAnalysis('general')} disabled={isGenerating} className="px-4 py-2 rounded-lg bg-ira-red text-white font-medium hover:bg-ira-red/90 disabled:opacity-50 transition-colors">
          {isGenerating ? <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Analyzing...</span> : '🤖 Analyze Session'}
        </button>
      </div>
      {error && <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}
      {insights.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-ira-carbon-700 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-4xl">🤖</span></div>
          <h3 className="text-xl font-bold text-white mb-2">AI Coaching</h3>
          <p className="text-white/60 mb-6">Get personalized coaching tips based on your telemetry data.</p>
          <button onClick={() => generateAnalysis('general')} disabled={isGenerating} className="px-6 py-3 rounded-lg bg-ira-red text-white font-medium hover:bg-ira-red/90 disabled:opacity-50">Generate AI Analysis</button>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight: any, index: number) => (
            <div key={insight.id || index} className="p-4 rounded-lg bg-ira-carbon-700/50 border border-ira-carbon-600">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.insight_type === 'braking_zones' ? '🛑' : insight.insight_type === 'racing_line' ? '🎯' : insight.insight_type === 'consistency' ? '📊' : '💡'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{insight.title || 'AI Coaching'}</h3>
                    <span className="text-xs text-white/40">{insight.created_at ? new Date(insight.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{insight.detailed_analysis || insight.summary}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}