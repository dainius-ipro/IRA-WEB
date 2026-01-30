'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Get MapTiler key from env
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || ''

interface TrackMapProps {
  telemetryPoints: any[]
  laps: any[]
  selectedLapIds: string[]
  showHeatmap?: boolean
  className?: string
}

export default function TrackMap({ 
  telemetryPoints, 
  laps,
  selectedLapIds,
  showHeatmap = true,
  className = 'h-[500px]'
}: TrackMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapStyle, setMapStyle] = useState<'satellite' | 'streets'>('satellite')
  const [mapError, setMapError] = useState<string | null>(null)

  const gpsPoints = useMemo(() => {
    let points = telemetryPoints.filter(p => p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0)
    if (selectedLapIds.length > 0) {
      const filtered = points.filter(p => selectedLapIds.includes(p.lap_id))
      if (filtered.length > 0) points = filtered
    }
    return points
  }, [telemetryPoints, selectedLapIds])

  const speeds = useMemo(() => gpsPoints.map(p => p.gps_speed_kmh || 0), [gpsPoints])
  const minSpeed = Math.min(...speeds)
  const maxSpeed = Math.max(...speeds)

  const getSpeedColor = (speed: number): string => {
    const ratio = maxSpeed > minSpeed ? (speed - minSpeed) / (maxSpeed - minSpeed) : 0.5
    if (ratio < 0.33) return '#22c55e'
    if (ratio < 0.66) return '#eab308'
    return '#ef4444'
  }

  useEffect(() => {
    if (!mapContainer.current || gpsPoints.length === 0) return

    // Debug: log the key status
    console.log('MapTiler Key available:', !!MAPTILER_KEY, MAPTILER_KEY ? 'Key length: ' + MAPTILER_KEY.length : 'NO KEY')

    const bounds = gpsPoints.reduce(
      (b, p) => {
        b.minLng = Math.min(b.minLng, p.longitude)
        b.maxLng = Math.max(b.maxLng, p.longitude)
        b.minLat = Math.min(b.minLat, p.latitude)
        b.maxLat = Math.max(b.maxLat, p.latitude)
        return b
      },
      { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
    )

    const center: [number, number] = [(bounds.minLng + bounds.maxLng) / 2, (bounds.minLat + bounds.maxLat) / 2]

    // Use MapTiler satellite or fallback to free Carto dark style
    let style: string
    if (mapStyle === 'satellite' && MAPTILER_KEY) {
      style = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`
    } else if (mapStyle === 'satellite' && !MAPTILER_KEY) {
      // Fallback if no key - use streets
      console.warn('No MapTiler key, falling back to streets style')
      style = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      setMapError('MapTiler key missing - using fallback map')
    } else {
      style = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    }

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: style,
        center,
        zoom: 15,
        attributionControl: false,
      })

      map.current.on('error', (e) => {
        console.error('Map error:', e)
        setMapError('Map loading error')
      })

      map.current.on('load', () => {
        if (!map.current) return
        setMapError(null)

        // Add heatmap segments
        const features = gpsPoints.slice(1).map((point, i) => ({
          type: 'Feature' as const,
          properties: { color: getSpeedColor(point.gps_speed_kmh || 0) },
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [gpsPoints[i].longitude, gpsPoints[i].latitude],
              [point.longitude, point.latitude]
            ]
          }
        }))

        map.current.addSource('track', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features }
        })

        // Add colored segments
        const colors = ['#22c55e', '#eab308', '#ef4444']
        colors.forEach((color, idx) => {
          map.current!.addLayer({
            id: `track-${idx}`,
            type: 'line',
            source: 'track',
            filter: ['==', ['get', 'color'], color],
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': color, 'line-width': 4 }
          })
        })

        // Fit bounds
        map.current.fitBounds(
          [[bounds.minLng, bounds.minLat], [bounds.maxLng, bounds.maxLat]],
          { padding: 50 }
        )
      })
    } catch (err) {
      console.error('Map init error:', err)
      setMapError('Failed to initialize map')
    }

    return () => map.current?.remove()
  }, [gpsPoints, mapStyle])

  if (gpsPoints.length === 0) {
    return <div className={`${className} flex items-center justify-center bg-ira-carbon-800 rounded-xl`}>
      <p className="text-white/50">No GPS data</p>
    </div>
  }

  return (
    <div className="relative h-full">
      {mapError && (
        <div className="absolute top-3 left-3 z-20 bg-red-500/80 text-white px-3 py-1 rounded text-sm">
          {mapError}
        </div>
      )}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button 
          onClick={() => setMapStyle(s => s === 'satellite' ? 'streets' : 'satellite')}
          className="px-3 py-1 rounded bg-black/70 text-white text-sm hover:bg-black/90"
        >
          {mapStyle === 'satellite' ? '🛰️ Satellite' : '🗺️ Streets'}
        </button>
      </div>
      <div ref={mapContainer} className={`${className} h-full rounded-xl overflow-hidden`} />
      <div className="absolute bottom-3 left-3 bg-black/70 rounded px-3 py-2 text-xs text-white">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Slow
        <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mx-1 ml-3"></span> Mid
        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mx-1 ml-3"></span> Fast
      </div>
    </div>
  )
}