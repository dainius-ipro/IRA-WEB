// app/auth/signout/route.ts
// Sign out handler

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  
  await supabase.auth.signOut()
  
  // Get origin from headers (works in production)
  const headersList = await headers()
  const host = headersList.get('host') || 'iraapp.ipro.cat'
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const origin = `${protocol}://${host}`
  
  return NextResponse.redirect(`${origin}/login`)
}
