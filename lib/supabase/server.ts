// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

type CookieToSet = { name: string; value: string; options?: any }

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach((c: CookieToSet) => {
              cookieStore.set(c.name, c.value, c.options)
            })
          } catch {
            // The `cookies()` API can throw in some contexts (e.g. during static rendering).
          }
        },
      },
    }
  )
}