// components/track-map/TrackMapControls.tsx
// Controls for track map visualization

'use client'

import { Palette, MapPin, Maximize2, RotateCcw } from 'lucide-react'

interface TrackMapControlsProps {
  showHeatmap: boolean
  onToggleHeatmap: () => void
  showBeacons: boolean
  onToggleBeacons: () => void
  onResetView?: () => void
  onFullscreen?: () => void
}

export function TrackMapControls({
  showHeatmap,
  onToggleHeatmap,
  showBeacons,
  onToggleBeacons,
  onResetView,
  onFullscreen
}: TrackMapControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Heatmap Toggle */}
      <button
        onClick={onToggleHeatmap}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
          ${showHeatmap 
            ? 'bg-ira-red text-white' 
            : 'bg-ira-carbon-700 text-white/60 hover:text-white'
          }
        `}
        title="Toggle speed heatmap"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm">Heatmap</span>
      </button>

      {/* Beacons Toggle */}
      <button
        onClick={onToggleBeacons}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
          ${showBeacons 
            ? 'bg-ira-gold text-ira-carbon-900' 
            : 'bg-ira-carbon-700 text-white/60 hover:text-white'
          }
        `}
        title="Toggle sector markers"
      >
        <MapPin className="w-4 h-4" />
        <span className="text-sm">Sectors</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-ira-carbon-600" />

      {/* Reset View */}
      {onResetView && (
        <button
          onClick={onResetView}
          className="p-2 rounded-lg bg-ira-carbon-700 text-white/60 hover:text-white transition-colors"
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}

      {/* Fullscreen */}
      {onFullscreen && (
        <button
          onClick={onFullscreen}
          className="p-2 rounded-lg bg-ira-carbon-700 text-white/60 hover:text-white transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default TrackMapControls
