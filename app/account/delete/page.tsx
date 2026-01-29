// app/account/delete/page.tsx - Account deletion (Apple App Store requirement)
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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
        setError('You must be logged in to delete your account')
        setIsLoading(false)
        return
      }

      if (user.email !== email) {
        setError('Email does not match your account')
        setIsLoading(false)
        return
      }

      // Call the delete account edge function
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Sign out
      await supabase.auth.signOut()
      setSuccess(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/')
      }, 3000)

    } catch (err) {
      setError('Failed to delete account. Please contact support.')
      console.error('Delete account error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Account Deleted</h1>
          <p className="text-gray-400">Your account has been permanently deleted.</p>
          <p className="text-gray-500 mt-2">Redirecting to home...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Delete Account</h1>
        <p className="text-gray-400 mb-6">
          This action is permanent and cannot be undone. All your data will be permanently deleted.
        </p>

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Enter your email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
              placeholder="DELETE"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {isLoading ? 'Deleting...' : 'Delete My Account'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Cancel
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6">
          If you need help, contact us at support@ira-racing.com
        </p>
      </div>
    </div>
  )
}
