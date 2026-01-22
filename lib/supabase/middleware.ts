// lib/supabase/middleware.ts
// Middleware helper for Supabase auth

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

type CookieToSet = {
  name: string
  value: string
  options?: any
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(cookiesToSet: CookieToSet[]) {
          // NOTE/compiler fix:
          // NextRequest.cookies.set supports only (name, value) in this runtime.
          // Options are supported only on Response cookies.

          try {
            cookiesToSet.forEach((c: CookieToSet) => {
              request.cookies.set(c.name, c.value)
            })
          } catch {
            // Some environments disallow mutating request cookies - ignore safely.
          }

          supabaseResponse = NextResponse.next({ request })

          cookiesToSet.forEach((c: CookieToSet) => {
            supabaseResponse.cookies.set(c.name, c.value, c.options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/app', '/settings', '/analysis']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Auth pages
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}