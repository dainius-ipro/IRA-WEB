// app/auth/callback/route.ts
// OAuth callback handler for Supabase Auth

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/app'
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createServerSupabaseClient()
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful authentication - redirect to app or specified path
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
