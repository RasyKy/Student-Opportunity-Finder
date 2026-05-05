"use client";

import { createClient } from '@/lib/supabase/client'

interface Props {
  variant?: 'login' | 'signup' | 'cta' | 'hero'
  className?: string
  children: React.ReactNode
}

export default function GoogleSignInButton({ variant = 'signup', className, children }: Props) {
  async function handleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button onClick={handleSignIn} className={className}>
      {children}
    </button>
  )
}
