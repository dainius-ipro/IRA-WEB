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
          // 1) Update request cookies (so Supabase sees fresh cookies immediately)
          try {
            cookiesToSet.forEach((c: CookieToSet) => {
              request.cookies.set(c.name, c.value, c.options)
            })
          } catch {
            // Some Next.js environments may disallow mutating request cookies.
            // It's safe to ignore; response cookies will still be set.
          }

          // 2) Create a new response with updated request
          supabaseResponse = NextResponse.next({ request })

          // 3) Set cookies on the response
          cookiesToSet.forEach((c: CookieToSet) => {
            supabaseResponse.cookies.set(c.name, c.value, c.options)
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
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

  // Redirect logged-in users away from auth pages
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