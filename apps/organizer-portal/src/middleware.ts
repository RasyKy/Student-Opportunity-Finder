import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = userData?.role

  // Admins bypass verification entirely
  if (role === 'admin') return supabaseResponse

  // Students don't belong here
  if (role === 'student') return NextResponse.redirect(new URL('/', request.url))

  // Organizers — check verification status
  const { data: profile } = await supabase
    .from('organizer_profiles')
    .select('verification_status')
    .eq('user_id', user.id)
    .single()

  const isVerified = profile?.verification_status === 'verified'

  // Verified → full access
  if (isVerified) return supabaseResponse

  // Not verified → allow only /dashboard/verification/* routes
  if (!path.startsWith('/dashboard/verification')) {
    return NextResponse.redirect(new URL('/dashboard/verification', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
