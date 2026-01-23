// app/app/sessions/import/page.tsx
// Import session page - placeholder

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Upload, FileText, ArrowLeft } from 'lucide-react'

export default function ImportSessionPage() {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        href="/app"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">Import Session</h1>
      <p className="text-white/60 mb-8">Upload your telemetry data to start analyzing</p>

      {/* Upload Area */}
      <div 
        className={`card p-12 border-2 border-dashed transition-all cursor-pointer ${
          isDragging 
            ? 'border-ira-red bg-ira-red/5' 
            : 'border-ira-carbon-600 hover:border-ira-carbon-500'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false) }}
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-ira-carbon-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-white/40" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Drop your file here
          </h3>
          <p className="text-white/60 mb-6">
            or click to browse
          </p>
          <input 
            type="file" 
            accept=".csv,.drk"
            className="hidden"
            id="file-upload"
          />
          <label 
            htmlFor="file-upload"
            className="btn-racing inline-flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-5 h-5" />
            Select File
          </label>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="mt-8 card">
        <h3 className="font-semibold text-white mb-4">Supported Formats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormatBadge name="MyChron" ext=".csv" supported />
          <FormatBadge name="RaceChrono" ext=".csv" supported />
          <FormatBadge name="AiM" ext=".drk" coming />
          <FormatBadge name="Alfano" ext=".csv" coming />
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-6 p-4 rounded-lg bg-ira-gold/10 border border-ira-gold/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">🚧</span>
          <div>
            <h4 className="font-semibold text-ira-gold">Web Import Coming Soon</h4>
            <p className="text-white/60 text-sm mt-1">
              Full import functionality is coming to the web app. For now, please use the 
              <Link href="https://apps.apple.com/app/ira-racing" className="text-ira-red hover:underline mx-1">iOS</Link>
              or 
              <Link href="https://play.google.com/store/apps/details?id=com.ipro.ira" className="text-ira-red hover:underline ml-1">Android</Link>
              {' '}apps to import sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormatBadge({ name, ext, supported, coming }: { 
  name: string; 
  ext: string; 
  supported?: boolean;
  coming?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg border ${
      supported 
        ? 'bg-ira-carbon-700 border-ira-carbon-600' 
        : 'bg-ira-carbon-800/50 border-ira-carbon-700'
    }`}>
      <div className="font-medium text-white">{name}</div>
      <div className="text-xs text-white/50">{ext}</div>
      {coming && (
        <div className="text-xs text-ira-gold mt-1">Coming soon</div>
      )}
    </div>
  )
}
