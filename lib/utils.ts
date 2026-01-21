// lib/utils.ts
// Utility functions for IRA Web

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format lap time from milliseconds to readable string
 * @param ms - Time in milliseconds
 * @returns Formatted time string (e.g., "1:23.456")
 */
export function formatLapTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '--:--.---'
  
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`
  }
  return seconds.toFixed(3)
}

/**
 * Format delta time (positive = slower, negative = faster)
 * @param deltaMs - Delta in milliseconds
 * @returns Formatted delta string with +/- prefix
 */
export function formatDelta(deltaMs: number | null | undefined): string {
  if (deltaMs === null || deltaMs === undefined) return '--'
  
  const prefix = deltaMs >= 0 ? '+' : ''
  const seconds = deltaMs / 1000
  return `${prefix}${seconds.toFixed(3)}`
}

/**
 * Format speed for display
 * @param kmh - Speed in km/h
 * @returns Formatted speed string
 */
export function formatSpeed(kmh: number | null | undefined): string {
  if (kmh === null || kmh === undefined) return '--'
  return `${Math.round(kmh)} km/h`
}

/**
 * Format distance
 * @param meters - Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(meters: number | null | undefined): string {
  if (meters === null || meters === undefined) return '--'
  
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${Math.round(meters)} m`
}

/**
 * Format temperature
 * @param celsius - Temperature in Celsius
 * @returns Formatted temperature string
 */
export function formatTemp(celsius: number | null | undefined): string {
  if (celsius === null || celsius === undefined) return '--'
  return `${Math.round(celsius)}°C`
}

/**
 * Get speed color for heatmap
 * @param speed - Current speed
 * @param maxSpeed - Maximum speed in session
 * @returns Tailwind color class
 */
export function getSpeedColor(speed: number, maxSpeed: number): string {
  const ratio = speed / maxSpeed
  
  if (ratio < 0.33) return 'text-speed-slow' // Green - braking
  if (ratio < 0.66) return 'text-speed-medium' // Yellow - transition
  return 'text-speed-fast' // Red - full throttle
}

/**
 * Get speed color as hex for charts/maps
 */
export function getSpeedColorHex(speed: number, maxSpeed: number): string {
  const ratio = speed / maxSpeed
  
  if (ratio < 0.33) return '#22C55E' // Green
  if (ratio < 0.66) return '#F59E0B' // Yellow/Orange
  return '#EF4444' // Red
}

/**
 * Format relative date
 * @param date - Date string or Date object
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 7) {
    return d.toLocaleDateString()
  }
  if (diffDays > 0) {
    return `${diffDays}d ago`
  }
  if (diffHours > 0) {
    return `${diffHours}h ago`
  }
  if (diffMins > 0) {
    return `${diffMins}m ago`
  }
  return 'Just now'
}

/**
 * Generate initials from name
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Calculate consistency score from lap times
 * @param lapTimes - Array of lap times in ms
 * @returns Consistency score 0-100
 */
export function calculateConsistency(lapTimes: number[]): number {
  if (lapTimes.length < 2) return 100
  
  const validTimes = lapTimes.filter(t => t > 0)
  if (validTimes.length < 2) return 100
  
  const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length
  const variance = validTimes.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / validTimes.length
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = (stdDev / avg) * 100
  
  // Convert to 0-100 score (lower variation = higher score)
  return Math.max(0, Math.min(100, 100 - coefficientOfVariation * 10))
}
