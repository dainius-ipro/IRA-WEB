// components/track-map/LapSelector.tsx
// Multi-lap selector for track visualization

'use client'

import { useState } from 'react'
import { Check, ChevronDown, Trophy } from 'lucide-react'
import { formatLapTime } from '@/lib/utils'
import type { Lap } from '@/types/database'

interface LapSelectorProps {
  laps: Lap[]
  selectedLapIds: string[]
  onSelectionChange: (lapIds: string[]) => void
  maxSelection?: number
}

// Lap colors for multi-lap overlay
const LAP_COLORS = [
  '#E10600', // IRA Red
  '#FFD700', // Gold
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#A855F7', // Purple
  '#F97316', // Orange
  '#EC4899', // Pink
  '#14B8A6', // Teal
]

export function LapSelector({
  laps,
  selectedLapIds,
  onSelectionChange,
  maxSelection = 8
}: LapSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleLap = (lapId: string) => {
    if (selectedLapIds.includes(lapId)) {
      // Remove lap
      onSelectionChange(selectedLapIds.filter(id => id !== lapId))
    } else if (selectedLapIds.length < maxSelection) {
      // Add lap
      onSelectionChange([...selectedLapIds, lapId])
    }
  }

  const handleSelectAll = () => {
    const validLaps = laps.filter(l => l.is_valid).slice(0, maxSelection)
    onSelectionChange(validLaps.map(l => l.id))
  }

  const handleSelectBest = () => {
    const bestLap = laps.find(l => l.is_best)
    if (bestLap) {
      onSelectionChange([bestLap.id])
    }
  }

  const handleClear = () => {
    onSelectionChange([])
  }

  const selectedCount = selectedLapIds.length

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ira-carbon-700 hover:bg-ira-carbon-600 transition-colors"
      >
        <span className="text-white">
          {selectedCount === 0 
            ? 'Select Laps' 
            : `${selectedCount} Lap${selectedCount > 1 ? 's' : ''} Selected`
          }
        </span>
        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Menu */}
          <div className="absolute top-full mt-2 left-0 z-50 w-72 p-2 rounded-xl bg-ira-carbon-800 border border-ira-carbon-700 shadow-xl">
            {/* Quick Actions */}
            <div className="flex gap-2 p-2 border-b border-ira-carbon-700 mb-2">
              <button
                onClick={handleSelectBest}
                className="flex-1 text-xs px-2 py-1.5 rounded bg-ira-gold/10 text-ira-gold hover:bg-ira-gold/20 transition-colors"
              >
                Best Lap
              </button>
              <button
                onClick={handleSelectAll}
                className="flex-1 text-xs px-2 py-1.5 rounded bg-ira-carbon-700 text-white/70 hover:text-white transition-colors"
              >
                All Valid
              </button>
              <button
                onClick={handleClear}
                className="flex-1 text-xs px-2 py-1.5 rounded bg-ira-carbon-700 text-white/70 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Lap List */}
            <div className="max-h-64 overflow-y-auto space-y-1">
              {laps.map((lap, index) => {
                const isSelected = selectedLapIds.includes(lap.id)
                const colorIndex = selectedLapIds.indexOf(lap.id)
                const color = colorIndex >= 0 ? LAP_COLORS[colorIndex % LAP_COLORS.length] : undefined
                
                return (
                  <button
                    key={lap.id}
                    onClick={() => handleToggleLap(lap.id)}
                    disabled={!isSelected && selectedLapIds.length >= maxSelection}
                    className={`
                      w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left
                      ${isSelected 
                        ? 'bg-ira-carbon-700' 
                        : 'hover:bg-ira-carbon-700/50'
                      }
                      ${!isSelected && selectedLapIds.length >= maxSelection 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                      }
                    `}
                  >
                    {/* Color indicator / Checkbox */}
                    <div 
                      className={`
                        w-5 h-5 rounded flex items-center justify-center flex-shrink-0
                        ${isSelected 
                          ? '' 
                          : 'border border-ira-carbon-600'
                        }
                      `}
                      style={{ backgroundColor: isSelected ? color : undefined }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    {/* Lap Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">Lap {lap.lap_number}</span>
                        {lap.is_best && (
                          <Trophy className="w-3 h-3 text-ira-gold" />
                        )}
                        {!lap.is_valid && (
                          <span className="text-xs px-1 py-0.5 rounded bg-ira-danger/20 text-ira-danger">
                            Invalid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lap Time */}
                    <span className={`font-mono text-sm ${lap.is_best ? 'text-ira-gold' : 'text-white/70'}`}>
                      {formatLapTime(lap.lap_time_ms)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 mt-2 border-t border-ira-carbon-700 text-xs text-white/40 text-center">
              Max {maxSelection} laps for comparison
            </div>
          </div>
        </>
      )}

      {/* Selected Laps Legend */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedLapIds.map((lapId, index) => {
            const lap = laps.find(l => l.id === lapId)
            if (!lap) return null
            
            const color = LAP_COLORS[index % LAP_COLORS.length]
            
            return (
              <div 
                key={lapId}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: `${color}20` }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span style={{ color }}>
                  L{lap.lap_number}: {formatLapTime(lap.lap_time_ms)}
                </span>
                <button
                  onClick={() => handleToggleLap(lapId)}
                  className="ml-1 hover:opacity-70"
                  style={{ color }}
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LapSelector
