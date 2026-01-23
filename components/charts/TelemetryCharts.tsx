// components/charts/TelemetryCharts.tsx
// Telemetry visualization with Recharts - Speed, RPM, G-Force

'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from 'recharts'
import { formatLapTime } from '@/lib/utils'
import type { TelemetryPoint, Lap } from '@/types/database'

const LAP_COLORS = ['#E10600', '#FFD700', '#3B82F6', '#22C55E', '#A855F7', '#F97316']

type ChartType = 'speed' | 'rpm' | 'gforce' | 'temps'

interface TelemetryChartsProps {
  telemetryPoints: TelemetryPoint[]
  laps: Lap[]
  selectedLapIds: string[]
  onPointHover?: (point: TelemetryPoint | null) => void
  syncedDistance?: number | null
}

export function TelemetryCharts({
  telemetryPoints,
  laps,
  selectedLapIds,
  onPointHover,
  syncedDistance,
}: TelemetryChartsProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('speed')
  const [showOverlay, setShowOverlay] = useState(true)

  const chartData = useMemo(() => {
    // Filter by selected laps with fallback
    let selectedPoints = telemetryPoints.filter(p => selectedLapIds.includes(p.lap_id))
    
    // FALLBACK: If no points match, use all telemetry
    if (selectedPoints.length === 0 && telemetryPoints.length > 0) {
      selectedPoints = telemetryPoints
    }

    if (selectedLapIds.length === 1 || !showOverlay) {
      return selectedPoints
        .sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0))
        .map(p => ({
          distance: Math.round(p.distance_meters || 0),
          speed: p.gps_speed_kmh || 0,
          rpm: p.rpm || 0,
          latG: p.lateral_g || 0,
          lonG: p.longitudinal_g || 0,
          exhaust: p.exhaust_temp_celsius || 0,
          water: p.water_temp_celsius || 0,
          lapId: p.lap_id,
          timestamp: p.timestamp,
        }))
    }

    const distanceMap = new Map<number, any>()
    
    selectedLapIds.forEach((lapId, lapIndex) => {
      const lapPoints = selectedPoints
        .filter(p => p.lap_id === lapId)
        .sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0))

      lapPoints.forEach(p => {
        const distance = Math.round((p.distance_meters || 0) / 5) * 5
        const existing = distanceMap.get(distance) || { distance }
        existing[`speed_${lapIndex}`] = p.gps_speed_kmh || 0
        existing[`rpm_${lapIndex}`] = p.rpm || 0
        existing[`latG_${lapIndex}`] = p.lateral_g || 0
        existing[`lonG_${lapIndex}`] = p.longitudinal_g || 0
        distanceMap.set(distance, existing)
      })
    })

    return Array.from(distanceMap.values()).sort((a, b) => a.distance - b.distance)
  }, [telemetryPoints, selectedLapIds, showOverlay])

  const selectedLapsInfo = useMemo(() => {
    return selectedLapIds.map((id, index) => {
      const lap = laps.find(l => l.id === id)
      return {
        id,
        number: lap?.lap_number || 0,
        time: lap?.lap_time_ms || 0,
        color: LAP_COLORS[index % LAP_COLORS.length],
        isBest: lap?.is_best || false,
      }
    })
  }, [selectedLapIds, laps])

  const chartConfigs: Record<ChartType, { title: string; dataKeys: string[]; yAxisLabel: string; domain?: [number | 'auto', number | 'auto'] }> = {
    speed: {
      title: 'Speed',
      dataKeys: showOverlay && selectedLapIds.length > 1 ? selectedLapIds.map((_, i) => `speed_${i}`) : ['speed'],
      yAxisLabel: 'km/h',
      domain: [0, 'auto'],
    },
    rpm: {
      title: 'RPM',
      dataKeys: showOverlay && selectedLapIds.length > 1 ? selectedLapIds.map((_, i) => `rpm_${i}`) : ['rpm'],
      yAxisLabel: 'RPM',
      domain: [0, 'auto'],
    },
    gforce: {
      title: 'G-Force',
      dataKeys: showOverlay && selectedLapIds.length > 1 ? selectedLapIds.flatMap((_, i) => [`latG_${i}`, `lonG_${i}`]) : ['latG', 'lonG'],
      yAxisLabel: 'g',
      domain: [-3, 3],
    },
    temps: {
      title: 'Temperatures',
      dataKeys: ['exhaust', 'water'],
      yAxisLabel: '°C',
      domain: [0, 'auto'],
    },
  }

  const config = chartConfigs[activeChart]

  const handleMouseMove = useCallback((e: any) => {
    if (e?.activePayload?.[0]?.payload && onPointHover) {
      const distance = e.activePayload[0].payload.distance
      const point = telemetryPoints.find(p => Math.abs((p.distance_meters || 0) - distance) < 10)
      onPointHover(point || null)
    }
  }, [telemetryPoints, onPointHover])

  const handleMouseLeave = useCallback(() => { onPointHover?.(null) }, [onPointHover])

  // Show message if no data
  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-white/50">
          <p className="text-lg mb-2">No telemetry data</p>
          <p className="text-sm">Total points: {telemetryPoints.length}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 rounded-lg bg-ira-carbon-800">
          {(Object.keys(chartConfigs) as ChartType[]).map(type => (
            <button
              key={type}
              onClick={() => setActiveChart(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeChart === type ? 'bg-ira-red text-white' : 'text-white/60 hover:text-white'}`}
            >
              {chartConfigs[type].title}
            </button>
          ))}
        </div>
        {selectedLapIds.length > 1 && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showOverlay} onChange={(e) => setShowOverlay(e.target.checked)} className="w-4 h-4 rounded border-ira-carbon-600 bg-ira-carbon-700 text-ira-red focus:ring-ira-red" />
            <span className="text-sm text-white/70">Overlay laps</span>
          </label>
        )}
      </div>

      {selectedLapIds.length > 1 && showOverlay && (
        <div className="flex-shrink-0 flex flex-wrap gap-3 mb-4">
          {selectedLapsInfo.map((lap) => (
            <div key={lap.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: `${lap.color}15` }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lap.color }} />
              <span style={{ color: lap.color }}>Lap {lap.number}{lap.isBest && ' 🏆'}</span>
              <span className="text-white/40 font-mono text-xs">{formatLapTime(lap.time)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A36" vertical={false} />
            <XAxis dataKey="distance" stroke="#6E6E82" tickFormatter={(v) => `${v}m`} tick={{ fill: '#6E6E82', fontSize: 11 }} />
            <YAxis stroke="#6E6E82" domain={config.domain} tickFormatter={(v) => activeChart === 'temps' ? `${v}°` : v} tick={{ fill: '#6E6E82', fontSize: 11 }} label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft', fill: '#6E6E82', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#15151E', border: '1px solid #2A2A36', borderRadius: '8px', padding: '8px 12px' }}
              labelStyle={{ color: '#A8A8B8', marginBottom: '4px' }}
              itemStyle={{ color: '#fff', padding: '2px 0' }}
              labelFormatter={(v) => `Distance: ${v}m`}
              formatter={(value: number, name: string) => {
                const unit = activeChart === 'speed' ? ' km/h' : activeChart === 'rpm' ? ' rpm' : activeChart === 'temps' ? '°C' : ' g'
                return [`${value.toFixed(1)}${unit}`, name]
              }}
            />
            {syncedDistance !== null && syncedDistance !== undefined && (
              <ReferenceLine x={syncedDistance} stroke="#FFD700" strokeWidth={2} strokeDasharray="5 5" />
            )}
            {showOverlay && selectedLapIds.length > 1 ? (
              config.dataKeys.map((key) => {
                const lapIndex = parseInt(key.split('_')[1]) || 0
                const color = LAP_COLORS[lapIndex % LAP_COLORS.length]
                return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} name={`Lap ${selectedLapsInfo[lapIndex]?.number || lapIndex + 1}`} />
              })
            ) : (
              config.dataKeys.map((key, index) => {
                const colors = activeChart === 'gforce' ? ['#3B82F6', '#22C55E'] : activeChart === 'temps' ? ['#EF4444', '#3B82F6'] : [LAP_COLORS[0]]
                return <Line key={key} type="monotone" dataKey={key} stroke={colors[index] || LAP_COLORS[0]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name={key === 'latG' ? 'Lateral G' : key === 'lonG' ? 'Longitudinal G' : key === 'exhaust' ? 'Exhaust' : key === 'water' ? 'Water' : config.title} />
              })
            )}
            <Brush dataKey="distance" height={30} stroke="#E10600" fill="#1F1F28" tickFormatter={(v) => `${v}m`} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {(activeChart === 'gforce' || activeChart === 'temps') && selectedLapIds.length === 1 && (
        <div className="flex-shrink-0 flex justify-center gap-6 mt-2">
          {activeChart === 'gforce' ? (
            <>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-sm text-white/60">Lateral G</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-sm text-white/60">Longitudinal G</span></div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-sm text-white/60">Exhaust</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-sm text-white/60">Water</span></div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default TelemetryCharts