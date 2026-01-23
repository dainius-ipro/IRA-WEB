// app/auth/signout/route.ts
// Sign out handler

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  
  await supabase.auth.signOut()
  
  const requestUrl = new URL(request.url)
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
