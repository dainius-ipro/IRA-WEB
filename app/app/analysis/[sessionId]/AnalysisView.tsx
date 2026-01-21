// app/app/analysis/[sessionId]/AnalysisView.tsx
// Client-side analysis view with track map and charts

'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Map, BarChart3, Brain, Play } from 'lucide-react'
import { LapSelector } from '@/components/track-map/LapSelector'
import { TrackMapControls } from '@/components/track-map/TrackMapControls'
import type { Session, Lap, TelemetryPoint, Track, Driver } from '@/types/database'

// Dynamic import for MapLibre (no SSR)
const TrackMap = dynamic(
  () => import('@/components/track-map/TrackMap').then(mod => mod.TrackMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-ira-carbon-800">
        <div className="animate-spin w-8 h-8 border-2 border-ira-red border-t-transparent rounded-full" />
      </div>
    )
  }
)

type Tab = 'map' | 'charts' | 'coaching' | 'playback'

interface AnalysisViewProps {
  session: Session & { track?: Track | null; driver?: Driver | null }
  laps: Lap[]
  telemetryPoints: TelemetryPoint[]
  initialTab?: string
  initialLapId?: string
}

export function AnalysisView({ 
  session, 
  laps, 
  telemetryPoints,
  initialTab,
  initialLapId
}: AnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>((initialTab as Tab) || 'map')
  
  // Find best lap for initial selection
  const bestLap = laps.find(l => l.is_best)
  const [selectedLapIds, setSelectedLapIds] = useState<string[]>(
    initialLapId ? [initialLapId] : bestLap ? [bestLap.id] : laps.length > 0 ? [laps[0].id] : []
  )
  
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showBeacons, setShowBeacons] = useState(true)
  const [selectedPoint, setSelectedPoint] = useState<TelemetryPoint | null>(null)

  const handlePointClick = useCallback((point: TelemetryPoint) => {
    setSelectedPoint(point)
  }, [])

  const tabs = [
    { id: 'map' as Tab, label: 'Track Map', icon: Map },
    { id: 'charts' as Tab, label: 'Charts', icon: BarChart3 },
    { id: 'playback' as Tab, label: 'Playback', icon: Play },
    { id: 'coaching' as Tab, label: 'AI Coaching', icon: Brain },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-ira-carbon-700">
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-ira-carbon-800">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-ira-red text-white' 
                    : 'text-white/60 hover:text-white'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab-specific controls */}
          {activeTab === 'map' && (
            <TrackMapControls
              showHeatmap={showHeatmap}
              onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
              showBeacons={showBeacons}
              onToggleBeacons={() => setShowBeacons(!showBeacons)}
            />
          )}
        </div>

        {/* Lap Selector (for map and charts) */}
        {(activeTab === 'map' || activeTab === 'charts') && (
          <div className="mt-4">
            <LapSelector
              laps={laps}
              selectedLapIds={selectedLapIds}
              onSelectionChange={setSelectedLapIds}
            />
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'map' && (
          <div className="h-full p-6">
            <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Track Map */}
              <div className="lg:col-span-3 h-full min-h-[400px]">
                <TrackMap
                  telemetryPoints={telemetryPoints}
                  laps={laps}
                  selectedLapIds={selectedLapIds}
                  showHeatmap={showHeatmap}
                  showBeacons={showBeacons}
                  onPointClick={handlePointClick}
                  className="w-full h-full"
                />
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4">
                {/* Point Info */}
                {selectedPoint && (
                  <div className="card">
                    <h3 className="text-sm font-medium text-white/60 mb-3">Selected Point</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-white/50">Speed</dt>
                        <dd className="text-white font-mono">
                          {selectedPoint.gps_speed_kmh?.toFixed(1) || '-'} km/h
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-white/50">RPM</dt>
                        <dd className="text-white font-mono">
                          {selectedPoint.rpm || '-'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-white/50">Lat G</dt>
                        <dd className="text-white font-mono">
                          {selectedPoint.lateral_g?.toFixed(2) || '-'} g
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-white/50">Lon G</dt>
                        <dd className="text-white font-mono">
                          {selectedPoint.longitudinal_g?.toFixed(2) || '-'} g
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-white/50">Distance</dt>
                        <dd className="text-white font-mono">
                          {selectedPoint.distance_meters?.toFixed(0) || '-'} m
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="card">
                  <h3 className="text-sm font-medium text-white/60 mb-3">Session Stats</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-white/50">Total Points</dt>
                      <dd className="text-white">{telemetryPoints.length.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-white/50">Sample Rate</dt>
                      <dd className="text-white">20 Hz</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-white/50">GPS Quality</dt>
                      <dd className="text-ira-success">Good</dd>
                    </div>
                  </dl>
                </div>

                {/* Tips */}
                <div className="p-4 rounded-lg bg-ira-gold/10 border border-ira-gold/20">
                  <h4 className="text-sm font-medium text-ira-gold mb-2">💡 Tip</h4>
                  <p className="text-xs text-white/60">
                    Click on the track to see detailed telemetry at that point. 
                    Select multiple laps to compare racing lines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="h-full p-6">
            <ChartsView 
              telemetryPoints={telemetryPoints}
              laps={laps}
              selectedLapIds={selectedLapIds}
              onPointHover={handlePointClick}
            />
          </div>
        )}

        {activeTab === 'playback' && (
          <div className="h-full p-6">
            <PlaybackPlaceholder />
          </div>
        )}

        {activeTab === 'coaching' && (
          <div className="h-full p-6">
            <CoachingPlaceholder sessionId={session.id} />
          </div>
        )}
      </div>
    </div>
  )
}

// Dynamic import for Charts (client-only)
const TelemetryCharts = dynamic(
  () => import('@/components/charts/TelemetryCharts').then(mod => mod.TelemetryCharts),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-ira-carbon-800">
        <div className="animate-spin w-8 h-8 border-2 border-ira-red border-t-transparent rounded-full" />
      </div>
    )
  }
)

// Charts component with real data
function ChartsView({ 
  telemetryPoints, 
  laps, 
  selectedLapIds,
  onPointHover
}: { 
  telemetryPoints: TelemetryPoint[]
  laps: Lap[]
  selectedLapIds: string[]
  onPointHover?: (point: TelemetryPoint | null) => void
}) {
  return (
    <div className="h-full">
      <TelemetryCharts
        telemetryPoints={telemetryPoints}
        laps={laps}
        selectedLapIds={selectedLapIds}
        onPointHover={onPointHover}
      />
    </div>
  )
}

function PlaybackPlaceholder() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Play className="w-16 h-16 text-ira-carbon-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Track Playback</h3>
        <p className="text-white/50 mb-4">
          Watch your kart move around the track with telemetry overlay
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-ira-gold/10 text-ira-gold text-sm">
          🚧 Coming Soon
        </span>
      </div>
    </div>
  )
}

function CoachingPlaceholder({ sessionId }: { sessionId: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Brain className="w-16 h-16 text-ira-carbon-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">AI Coaching</h3>
        <p className="text-white/50 mb-4">
          Get personalized insights powered by Claude AI
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-ira-gold/10 text-ira-gold text-sm">
          🚧 Coming Soon
        </span>
      </div>
    </div>
  )
}

export default AnalysisView
