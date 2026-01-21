// components/charts/DeltaChart.tsx
// Delta time comparison chart between two laps

'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { TelemetryPoint } from '@/types/database'

interface DeltaChartProps {
  referenceLapPoints: TelemetryPoint[]
  comparisonLapPoints: TelemetryPoint[]
  referenceLapNumber: number
  comparisonLapNumber: number
  className?: string
}

export function DeltaChart({
  referenceLapPoints,
  comparisonLapPoints,
  referenceLapNumber,
  comparisonLapNumber,
  className = ''
}: DeltaChartProps) {
  // Calculate delta at each distance point
  const deltaData = useMemo(() => {
    if (referenceLapPoints.length === 0 || comparisonLapPoints.length === 0) {
      return []
    }

    // Create time-at-distance maps
    const refTimeMap = new Map<number, number>()
    referenceLapPoints.forEach(p => {
      const distance = Math.round((p.distance_meters || 0) / 10) * 10 // 10m intervals
      if (!refTimeMap.has(distance)) {
        refTimeMap.set(distance, p.timestamp)
      }
    })

    const compTimeMap = new Map<number, number>()
    comparisonLapPoints.forEach(p => {
      const distance = Math.round((p.distance_meters || 0) / 10) * 10
      if (!compTimeMap.has(distance)) {
        compTimeMap.set(distance, p.timestamp)
      }
    })

    // Calculate delta (positive = comparison is slower)
    const data: { distance: number; delta: number; deltaMs: number }[] = []
    
    refTimeMap.forEach((refTime, distance) => {
      const compTime = compTimeMap.get(distance)
      if (compTime !== undefined) {
        const deltaMs = (compTime - refTime) * 1000 // Convert to milliseconds
        data.push({
          distance,
          delta: deltaMs / 1000, // Seconds for display
          deltaMs,
        })
      }
    })

    return data.sort((a, b) => a.distance - b.distance)
  }, [referenceLapPoints, comparisonLapPoints])

  // Find max absolute delta for symmetric Y axis
  const maxDelta = useMemo(() => {
    if (deltaData.length === 0) return 1
    const max = Math.max(...deltaData.map(d => Math.abs(d.delta)))
    return Math.ceil(max * 10) / 10 // Round up to 0.1
  }, [deltaData])

  if (deltaData.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-ira-carbon-800 rounded-xl ${className}`}>
        <p className="text-white/50">Not enough data for comparison</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Delta Time</h3>
          <p className="text-sm text-white/50">
            Lap {comparisonLapNumber} vs Lap {referenceLapNumber} (reference)
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-ira-success" />
            <span className="text-white/60">Faster</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-ira-danger" />
            <span className="text-white/60">Slower</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={deltaData}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <defs>
              <linearGradient id="deltaPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="deltaNegative" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#2A2A36" 
              vertical={false}
            />
            <XAxis 
              dataKey="distance" 
              stroke="#6E6E82"
              tickFormatter={(v) => `${v}m`}
              tick={{ fill: '#6E6E82', fontSize: 11 }}
            />
            <YAxis 
              stroke="#6E6E82"
              domain={[-maxDelta, maxDelta]}
              tickFormatter={(v) => v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}
              tick={{ fill: '#6E6E82', fontSize: 11 }}
              label={{ 
                value: 'Δ sec', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#6E6E82',
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#15151E',
                border: '1px solid #2A2A36',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#A8A8B8', marginBottom: '4px' }}
              labelFormatter={(v) => `Distance: ${v}m`}
              formatter={(value: number) => {
                const formatted = value > 0 ? `+${value.toFixed(3)}` : value.toFixed(3)
                const color = value > 0 ? '#EF4444' : '#22C55E'
                return [
                  <span style={{ color }}>{formatted}s</span>,
                  'Delta'
                ]
              }}
            />
            
            {/* Zero reference line */}
            <ReferenceLine 
              y={0} 
              stroke="#FFD700" 
              strokeWidth={2}
            />

            {/* Positive delta (slower - red) */}
            <Area
              type="monotone"
              dataKey="delta"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#deltaPositive)"
              baseValue={0}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-center gap-8 mt-4 p-4 rounded-lg bg-ira-carbon-700/50">
        {(() => {
          const lastDelta = deltaData[deltaData.length - 1]?.deltaMs || 0
          const isFaster = lastDelta < 0
          
          return (
            <>
              <div className="text-center">
                <div className="text-sm text-white/50 mb-1">Final Delta</div>
                <div className={`text-2xl font-bold font-mono ${isFaster ? 'text-ira-success' : 'text-ira-danger'}`}>
                  {lastDelta > 0 ? '+' : ''}{(lastDelta / 1000).toFixed(3)}s
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-white/50 mb-1">Result</div>
                <div className={`text-lg font-bold ${isFaster ? 'text-ira-success' : 'text-ira-danger'}`}>
                  {isFaster ? '🟢 Faster' : '🔴 Slower'}
                </div>
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}

export default DeltaChart
