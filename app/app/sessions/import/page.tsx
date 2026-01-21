// app/app/sessions/import/page.tsx
// IRA Web - CSV Import Page

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase/client'
import { 
  Upload, 
  FileText, 
  X, 
  Check, 
  Loader2,
  AlertCircle,
  ArrowLeft,
  HelpCircle
} from 'lucide-react'

type ImportStatus = 'idle' | 'parsing' | 'uploading' | 'processing' | 'complete' | 'error'

interface ParsedSession {
  name: string
  date: string
  lapsCount: number
  pointsCount: number
  dataSource: string
}

export default function ImportPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [parsedSession, setParsedSession] = useState<ParsedSession | null>(null)
  const [progress, setProgress] = useState(0)

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile)
      parseFile(droppedFile)
    } else {
      setError('Please upload a CSV file')
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseFile(selectedFile)
    }
  }

  // Parse CSV file (client-side preview)
  const parseFile = async (file: File) => {
    setStatus('parsing')
    setError(null)
    
    try {
      const text = await file.text()
      const lines = text.split('\n')
      
      // Detect format
      const header = lines[0].toLowerCase()
      let dataSource = 'unknown'
      
      if (header.includes('mychron') || header.includes('aim')) {
        dataSource = 'mychron'
      } else if (header.includes('racechrono')) {
        dataSource = 'racechrono'
      } else if (header.includes('alfano')) {
        dataSource = 'alfano'
      }
      
      // Count data
      const dataLines = lines.filter(l => l.trim() && !l.startsWith('#'))
      const pointsCount = dataLines.length - 1 // Minus header
      
      // Estimate laps (rough - actual parsing on server)
      const lapsCount = Math.max(1, Math.floor(pointsCount / 500))
      
      // Try to extract date from filename or content
      const dateMatch = file.name.match(/(\d{4}[-_]\d{2}[-_]\d{2})/)
      const date = dateMatch ? dateMatch[1].replace(/_/g, '-') : new Date().toISOString().split('T')[0]
      
      setParsedSession({
        name: file.name.replace('.csv', ''),
        date,
        lapsCount,
        pointsCount,
        dataSource
      })
      
      setStatus('idle')
    } catch (err) {
      setError('Failed to parse CSV file')
      setStatus('error')
    }
  }

  // Upload and process
  const handleImport = async () => {
    if (!file) return
    
    setStatus('uploading')
    setProgress(0)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      // Read file content
      const text = await file.text()
      
      setProgress(30)
      setStatus('processing')
      
      // Create session record
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          name: parsedSession?.name || file.name,
          session_date: parsedSession?.date || new Date().toISOString(),
          data_source: parsedSession?.dataSource || 'unknown',
          original_filename: file.name,
          status: 'processing'
        })
        .select()
        .single()
      
      if (sessionError) throw sessionError
      
      setProgress(60)
      
      // TODO: Call edge function to parse and store telemetry
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update session status
      await supabase
        .from('sessions')
        .update({ status: 'complete' })
        .eq('id', session.id)
      
      setProgress(100)
      setStatus('complete')
      
      // Redirect to session
      setTimeout(() => {
        router.push(`/app/sessions/${session.id}`)
      }, 1000)
      
    } catch (err) {
      console.error('Import error:', err)
      setError(err instanceof Error ? err.message : 'Failed to import session')
      setStatus('error')
    }
  }

  const resetImport = () => {
    setFile(null)
    setParsedSession(null)
    setStatus('idle')
    setError(null)
    setProgress(0)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/app/sessions" 
          className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Import Session</h1>
        <p className="text-white/60">
          Upload your telemetry CSV file to analyze your racing data
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-ira-danger/10 border border-ira-danger/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-ira-danger flex-shrink-0" />
          <span className="text-ira-danger">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-ira-danger hover:text-ira-danger/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Drop Zone */}
      {!file && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            card border-2 border-dashed transition-all duration-200 cursor-pointer
            ${isDragging 
              ? 'border-ira-red bg-ira-red/5' 
              : 'border-ira-carbon-600 hover:border-ira-carbon-500'
            }
          `}
        >
          <label className="block py-16 text-center cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className={`
              w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center transition-colors
              ${isDragging ? 'bg-ira-red/20' : 'bg-ira-carbon-700'}
            `}>
              <Upload className={`w-10 h-10 ${isDragging ? 'text-ira-red' : 'text-white/40'}`} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isDragging ? 'Drop your file here' : 'Drag & drop your CSV file'}
            </h3>
            <p className="text-white/50 mb-4">
              or click to browse
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/40">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                MyChron
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                RaceChrono
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                AiM
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Alfano
              </span>
            </div>
          </label>
        </div>
      )}

      {/* File Preview */}
      {file && parsedSession && (
        <div className="card">
          {/* File Info */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-lg bg-ira-red/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-ira-red" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{file.name}</h3>
              <p className="text-sm text-white/50">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {status === 'idle' && (
              <button 
                onClick={resetImport}
                className="p-2 rounded-lg hover:bg-ira-carbon-700 transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            )}
          </div>

          {/* Parsed Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-ira-carbon-700/50 mb-6">
            <div>
              <div className="text-sm text-white/40 mb-1">Format</div>
              <div className="font-medium text-white capitalize">{parsedSession.dataSource}</div>
            </div>
            <div>
              <div className="text-sm text-white/40 mb-1">Date</div>
              <div className="font-medium text-white">{parsedSession.date}</div>
            </div>
            <div>
              <div className="text-sm text-white/40 mb-1">Est. Laps</div>
              <div className="font-medium text-white">~{parsedSession.lapsCount}</div>
            </div>
            <div>
              <div className="text-sm text-white/40 mb-1">Data Points</div>
              <div className="font-medium text-white">{parsedSession.pointsCount.toLocaleString()}</div>
            </div>
          </div>

          {/* Progress Bar */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">
                  {status === 'uploading' ? 'Uploading...' : 'Processing telemetry...'}
                </span>
                <span className="text-sm text-white/60">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-ira-carbon-700 overflow-hidden">
                <div 
                  className="h-full bg-ira-red transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'complete' && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-ira-success/10 border border-ira-success/20 mb-6">
              <Check className="w-5 h-5 text-ira-success" />
              <span className="text-ira-success">Session imported successfully! Redirecting...</span>
            </div>
          )}

          {/* Action Buttons */}
          {status === 'idle' && (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleImport}
                className="btn-racing flex-1"
              >
                <Upload className="w-5 h-5 mr-2" />
                Import Session
              </button>
              <button 
                onClick={resetImport}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          )}

          {(status === 'uploading' || status === 'processing') && (
            <button disabled className="btn-racing w-full opacity-50 cursor-not-allowed">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {status === 'uploading' ? 'Uploading...' : 'Processing...'}
            </button>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 card bg-ira-carbon-800/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-ira-gold/10 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-ira-gold" />
          </div>
          <div>
            <h4 className="font-bold text-white mb-2">Supported Formats</h4>
            <p className="text-sm text-white/60 mb-4">
              IRA supports telemetry data from the most popular karting data loggers:
            </p>
            <ul className="text-sm text-white/60 space-y-2">
              <li>• <strong className="text-white">MyChron 6T</strong> - Export as CSV from Race Studio</li>
              <li>• <strong className="text-white">RaceChrono Pro</strong> - Export session as CSV</li>
              <li>• <strong className="text-white">AiM</strong> - Export from Race Studio 3</li>
              <li>• <strong className="text-white">Alfano</strong> - Export from Alfano software</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
