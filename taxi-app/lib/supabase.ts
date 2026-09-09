import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'taxi-auth-default',
  },
})

// On iPhone/Safari, use the already-persisted local session first so a
// transient network validation cannot make the passenger UI flash back to
// the signed-out screen immediately after a successful login.
const originalGetUser = supabase.auth.getUser.bind(supabase.auth)
supabase.auth.getUser = (async (...args: Parameters<typeof originalGetUser>) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    return { data: { user: session.user }, error: null }
  }

  return originalGetUser(...args)
}) as typeof supabase.auth.getUser
