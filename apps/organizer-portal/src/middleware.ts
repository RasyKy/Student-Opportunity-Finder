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

  // Don't run middleware on the auth callback — let it complete
  if (request.nextUrl.pathname === '/auth/callback') {
    return supabaseResponse
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Fetch user role from the users table
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // If no user record exists yet (e.g. first login), block until callback completes
  if (roleError || !userData) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const role = userData.role

  // Admins bypass verification entirely
  if (role === 'admin') return supabaseResponse

  // Students don't belong here
  if (role === 'student') return NextResponse.redirect(new URL('/', request.url))

  // Fetch verification status from organizer_profiles
  const { data: profile, error: profileError } = await supabase
    .from('organizer_profiles')
    .select('verification_status')
    .eq('user_id', user.id)
    .maybeSingle()

  // If no profile exists, redirect to verification
  if (profileError || !profile) {
    return NextResponse.redirect(new URL('/dashboard/verification', request.url))
  }

  const isVerified = profile.verification_status === 'verified'

  // Verified → full access
  if (isVerified) return supabaseResponse

  // Not verified → allow only /dashboard/verification/* routes
  if (!request.nextUrl.pathname.startsWith('/dashboard/verification')) {
    return NextResponse.redirect(new URL('/dashboard/verification', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
