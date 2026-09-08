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

// Safari/iOS can occasionally fail the network-backed getUser() check
// immediately after a successful sign-in/navigation even though the local
// Supabase session is already present. Keep RLS as the security boundary,
// but let client UI recover from the persisted session instead of flashing
// the signed-out screen.
const originalGetUser = supabase.auth.getUser.bind(supabase.auth)
supabase.auth.getUser = (async (...args: Parameters<typeof originalGetUser>) => {
  const result = await originalGetUser(...args)
  if (result.data.user) return result

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    return { data: { user: session.user }, error: null }
  }

  return result
}) as typeof supabase.auth.getUser
