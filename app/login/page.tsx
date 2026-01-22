// app/login/page.tsx
// IRA Web - Login Page with Google OAuth

'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'

function LoginContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/app'
  
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const supabase = getSupabaseClient()

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
        },
      })
      
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
      setIsGoogleLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
        },
      })
      
      if (error) throw error
      setEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ira-carbon-900 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ira-carbon-800 to-ira-carbon-900 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ira-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-ira-gold/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center p-12">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-ira-red rounded-xl flex items-center justify-center shadow-ira">
              <span className="text-white font-bold text-2xl">IRA</span>
            </div>
            <div>
              <div className="text-white font-bold text-xl">Intelligent Racing</div>
              <div className="text-white/60 text-sm">Analytics</div>
            </div>
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-6">
            Analyze. Improve.
            <span className="block text-gradient-ira">Win.</span>
          </h1>
          
          <p className="text-lg text-white/60 mb-8 max-w-md">
            Join 1,000+ racing families using AI-powered telemetry analysis 
            to improve lap times and track progress.
          </p>
          
          <div className="space-y-4">
            <Feature text="Import MyChron, RaceChrono, AiM data" />
            <Feature text="AI coaching in 6 languages" />
            <Feature text="Track visualization with speed heatmap" />
            <Feature text="Family sharing & notifications" />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-12 h-12 bg-ira-red rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">IRA</span>
            </div>
            <span className="text-white font-bold text-xl">Racing Analytics</span>
          </Link>

          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-white/60 mb-8">Sign in to access your racing data</p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-ira-danger/10 border border-ira-danger/20 text-ira-danger text-sm">
                {error}
              </div>
            )}

            {emailSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-ira-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-ira-success" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
                <p className="text-white/60 mb-4">
                  We sent a magic link to <span className="text-white">{email}</span>
                </p>
                <button 
                  onClick={() => setEmailSent(false)}
                  className="text-ira-red hover:text-ira-red-400 text-sm"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ira-carbon-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-ira-carbon-800 text-white/40">or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleMagicLink}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="driver@example.com"
                      required
                      className="input"
                    />
                  </div>
                  
                  <button type="submit" disabled={isLoading || !email} className="w-full btn-racing">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send Magic Link
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-white/40 text-sm mt-8">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-white/60 hover:text-white">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-white/60 hover:text-white">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-ira-red/20 flex items-center justify-center flex-shrink-0">
        <span className="text-ira-red text-xs">✓</span>
      </div>
      <span className="text-white/70">{text}</span>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ira-carbon-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-ira-red" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
