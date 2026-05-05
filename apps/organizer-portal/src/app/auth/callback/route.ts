import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (!sessionError) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const admin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: existing } = await admin
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (existing?.role !== 'admin') {
          await admin.from('users').upsert({
            id: user.id,
            email: user.email,
            role: 'organizer',
            name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '',
          }, { onConflict: 'id' })
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`)
}
