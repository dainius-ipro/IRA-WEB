// components/track-map/TrackMap.tsx
// MapLibre GL JS track visualization with speed heatmap

‘use client’

import { useEffect, useRef, useState, useMemo } from ‘react’
import maplibregl from ‘maplibre-gl’
import ‘maplibre-gl/dist/maplibre-gl.css’
import { getSpeedColorHex } from ‘@/lib/utils’
import type { TelemetryPoint, Lap } from ‘@/types/database’

interface TrackMapProps {
telemetryPoints: TelemetryPoint[]
laps?: Lap[]
selectedLapIds?: string[]
showHeatmap?: boolean
showBeacons?: boolean
interactive?: boolean
onPointClick?: (point: TelemetryPoint) => void
className?: string
}

const SPEED_COLORS = {
slow: ‘#22C55E’,
medium: ‘#F59E0B’,
fast: ‘#EF4444’,
}

export function TrackMap({
telemetryPoints,
laps,
selectedLapIds,
showHeatmap = true,
showBeacons = true,
interactive = true,
onPointClick,
className = ‘’
}: TrackMapProps) {
const mapContainer = useRef<HTMLDivElement>(null)
const map = useRef<maplibregl.Map | null>(null)
const [isLoaded, setIsLoaded] = useState(false)
const [mapStyle, setMapStyle] = useState<‘dark’ | ‘satellite’>(‘dark’)

// Filter points by selected laps - WITH FALLBACK
const filteredPoints = useMemo(() => {
console.log(’[TrackMap] Input:’, {
totalPoints: telemetryPoints.length,
selectedLapIds,
uniqueLapIds: […new Set(telemetryPoints.map(p => p.lap_id))].slice(0, 5)
})

```
if (!selectedLapIds || selectedLapIds.length === 0) {
  return telemetryPoints
}

const filtered = telemetryPoints.filter(p => selectedLapIds.includes(p.lap_id))

// FALLBACK: If filtering returns empty but we have telemetry, show all
if (filtered.length === 0 && telemetryPoints.length > 0) {
  console.warn('[TrackMap] Lap ID mismatch! Showing all points as fallback')
  return telemetryPoints
}

return filtered
```

}, [telemetryPoints, selectedLapIds])

// Calculate bounds
const bounds = useMemo(() => {
if (filteredPoints.length === 0) return null

```
const validPoints = filteredPoints.filter(p => p.latitude && p.longitude)
if (validPoints.length === 0) return null

const lats = validPoints.map(p => p.latitude!)
const lngs = validPoints.map(p => p.longitude!)

return {
  minLat: Math.min(...lats),
  maxLat: Math.max(...lats),
  minLng: Math.min(...lngs),
  maxLng: Math.max(...lngs),
  centerLat: (Math.min(...lats) + Math.max(...lats)) / 2,
  centerLng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
}
```

}, [filteredPoints])

const maxSpeed = useMemo(() => {
const speeds = filteredPoints.map(p => p.gps_speed_kmh || 0)
return Math.max(…speeds, 1)
}, [filteredPoints])

const trackGeoJSON = useMemo(() => {
const validPoints = filteredPoints.filter(p => p.latitude && p.longitude)
if (validPoints.length < 2) return null

```
const features = []

for (let i = 0; i < validPoints.length - 1; i++) {
  const p1 = validPoints[i]
  const p2 = validPoints[i + 1]
  const speed = p1.gps_speed_kmh || 0
  const color = getSpeedColorHex(speed, maxSpeed)
  
  features.push({
    type: 'Feature' as const,
    properties: { speed, color, index: i },
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [p1.longitude!, p1.latitude!],
        [p2.longitude!, p2.latitude!],
      ],
    },
  })
}

return { type: 'FeatureCollection' as const, features }
```

}, [filteredPoints, maxSpeed])

const beaconsGeoJSON = useMemo(() => {
const beacons = filteredPoints.filter(p => p.is_beacon && p.latitude && p.longitude)

```
return {
  type: 'FeatureCollection' as const,
  features: beacons.map(p => ({
    type: 'Feature' as const,
    properties: { beaconNumber: p.beacon_number },
    geometry: {
      type: 'Point' as const,
      coordinates: [p.longitude!, p.latitude!],
    },
  })),
}
```

}, [filteredPoints])

useEffect(() => {
if (!mapContainer.current || !bounds) return

```
const mapInstance = new maplibregl.Map({
  container: mapContainer.current,
  style: mapStyle === 'dark' 
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  center: [bounds.centerLng, bounds.centerLat],
  zoom: 15,
  attributionControl: false,
  interactive,
})

map.current = mapInstance

mapInstance.on('load', () => {
  setIsLoaded(true)
  mapInstance.fitBounds(
    [
      [bounds.minLng - 0.001, bounds.minLat - 0.001],
      [bounds.maxLng + 0.001, bounds.maxLat + 0.001],
    ],
    { padding: 50, duration: 0 }
  )
})

if (interactive) {
  mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right')
}

return () => {
  mapInstance.remove()
  map.current = null
}
```

}, [bounds, mapStyle, interactive])

useEffect(() => {
if (!map.current || !isLoaded || !trackGeoJSON) return

```
const mapInstance = map.current

if (mapInstance.getLayer('track-line')) {
  mapInstance.removeLayer('track-line')
}
if (mapInstance.getSource('track')) {
  mapInstance.removeSource('track')
}

mapInstance.addSource('track', { type: 'geojson', data: trackGeoJSON })

if (showHeatmap) {
  mapInstance.addLayer({
    id: 'track-line',
    type: 'line',
    source: 'track',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-opacity': 0.9 },
  })
} else {
  mapInstance.addLayer({
    id: 'track-line',
    type: 'line',
    source: 'track',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#E10600', 'line-width': 3, 'line-opacity': 0.8 },
  })
}
```

}, [isLoaded, trackGeoJSON, showHeatmap])

useEffect(() => {
if (!map.current || !isLoaded || !showBeacons) return

```
const mapInstance = map.current

if (mapInstance.getLayer('beacons')) mapInstance.removeLayer('beacons')
if (mapInstance.getLayer('beacon-labels')) mapInstance.removeLayer('beacon-labels')
if (mapInstance.getSource('beacons')) mapInstance.removeSource('beacons')

mapInstance.addSource('beacons', { type: 'geojson', data: beaconsGeoJSON })

mapInstance.addLayer({
  id: 'beacons',
  type: 'circle',
  source: 'beacons',
  paint: {
    'circle-radius': 8,
    'circle-color': '#FFD700',
    'circle-stroke-width': 2,
    'circle-stroke-color': '#15151E',
  },
})

mapInstance.addLayer({
  id: 'beacon-labels',
  type: 'symbol',
  source: 'beacons',
  layout: { 'text-field': ['get', 'beaconNumber'], 'text-size': 10, 'text-offset': [0, 0], 'text-anchor': 'center' },
  paint: { 'text-color': '#15151E' },
})
```

}, [isLoaded, beaconsGeoJSON, showBeacons])

useEffect(() => {
if (!map.current || !isLoaded || !onPointClick) return

```
const mapInstance = map.current

const handleClick = (e: maplibregl.MapMouseEvent) => {
  const features = mapInstance.queryRenderedFeatures(e.point, { layers: ['track-line'] })
  if (features.length > 0) {
    const index = features[0].properties?.index
    if (index !== undefined && filteredPoints[index]) {
      onPointClick(filteredPoints[index])
    }
  }
}

mapInstance.on('click', handleClick)
mapInstance.on('mouseenter', 'track-line', () => { mapInstance.getCanvas().style.cursor = 'pointer' })
mapInstance.on('mouseleave', 'track-line', () => { mapInstance.getCanvas().style.cursor = '' })

return () => { mapInstance.off('click', handleClick) }
```

}, [isLoaded, filteredPoints, onPointClick])

if (!bounds) {
return (
<div className={`flex items-center justify-center bg-ira-carbon-800 rounded-xl ${className}`}>
<div className="text-center text-white/50 p-8">
<p className="text-lg mb-2">No GPS data available</p>
<p className="text-sm">
Points: {telemetryPoints.length} | With GPS: {telemetryPoints.filter(p => p.latitude && p.longitude).length}
</p>
</div>
</div>
)
}

return (
<div className={`relative rounded-xl overflow-hidden ${className}`}>
<div ref={mapContainer} className="w-full h-full" />

```
  {interactive && (
    <div className="absolute top-4 left-4 flex gap-1 p-1 rounded-lg bg-ira-carbon-800/90 backdrop-blur-sm">
      <button
        onClick={() => setMapStyle('dark')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          mapStyle === 'dark' ? 'bg-ira-red text-white' : 'text-white/60 hover:text-white'
        }`}
      >
        Dark
      </button>
      <button
        onClick={() => setMapStyle('satellite')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          mapStyle === 'satellite' ? 'bg-ira-red text-white' : 'text-white/60 hover:text-white'
        }`}
      >
        Light
      </button>
    </div>
  )}

  {showHeatmap && (
    <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-ira-carbon-800/90 backdrop-blur-sm">
      <div className="text-xs text-white/60 mb-2">Speed</div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SPEED_COLORS.slow }} />
          <span className="text-xs text-white/80">Slow</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SPEED_COLORS.medium }} />
          <span className="text-xs text-white/80">Mid</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SPEED_COLORS.fast }} />
          <span className="text-xs text-white/80">Fast</span>
        </div>
      </div>
      <div className="text-xs text-white/40 mt-1">Max: {Math.round(maxSpeed)} km/h</div>
    </div>
  )}

  {!isLoaded && (
    <div className="absolute inset-0 flex items-center justify-center bg-ira-carbon-800">
      <div className="animate-spin w-8 h-8 border-2 border-ira-red border-t-transparent rounded-full" />
    </div>
  )}
</div>
```

)
}

export default TrackMap