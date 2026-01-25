// app/account/delete/page.tsx - Account deletion (Apple App Store requirement)
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please login first to delete your account')
        return
      }

      if (user.email !== email) {
        setError('Email does not match your account')
        return
      }

      // Delete user data (sessions, laps, telemetry will cascade)
      await supabase.from('sessions').delete().eq('user_id', user.id)
      await supabase.from('ai_insights').delete().eq('user_id', user.id)
      await supabase.from('profiles').delete().eq('id', user.id)

      // Sign out
      await supabase.auth.signOut()

      setSuccess(true)
      
      // Redirect after 3 seconds
      setTimeout(() => router.push('/'), 3000)

    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-ira-carbon-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">Account Deleted</h1>
          <p className="text-white/60">Your account and all data has been permanently deleted.</p>
          <p className="text-white/40 text-sm mt-4">Redirecting to home...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ira-carbon-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Delete Account</h1>
          <p className="text-white/60">This action is permanent and cannot be undone.</p>
        </div>

        <div className="card p-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-red-400 mb-2">Warning: This will permanently delete:</h3>
            <ul className="text-red-400/80 text-sm space-y-1">
              <li>• Your profile and account</li>
              <li>• All racing sessions and laps</li>
              <li>• All telemetry data</li>
              <li>• All AI coaching insights</li>
            </ul>
          </div>

          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Your Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg bg-ira-carbon-800 border border-white/10 text-white placeholder-white/30 focus:border-ira-red focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Type DELETE to confirm</label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 rounded-lg bg-ira-carbon-800 border border-white/10 text-white placeholder-white/30 focus:border-ira-red focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading || confirmText !== 'DELETE'}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Deleting...' : 'Permanently Delete My Account'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Changed your mind? <a href="/app" className="text-ira-red hover:underline">Go back to app</a>
          </p>
        </div>
      </div>
    </div>
  )
}
