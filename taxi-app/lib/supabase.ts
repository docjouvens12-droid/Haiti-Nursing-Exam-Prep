import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

const fetchWithTimeout: typeof fetch = async (input, init = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)
  const upstreamSignal = init.signal

  const abortFromUpstream = () => controller.abort()
  if (upstreamSignal) {
    if (upstreamSignal.aborted) controller.abort()
    else upstreamSignal.addEventListener('abort', abortFromUpstream, { once: true })
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (error) {
    // Supabase query builders normally resolve with { data, error }. If fetch
    // throws on iPhone after an abort/timeout, callers without try/catch can
    // remain forever in their loading state. Convert that transport failure
    // into a normal HTTP error response so the query resolves cleanly.
    if (controller.signal.aborted) {
      return new Response(
        JSON.stringify({ message: 'Request timed out. Please try again.' }),
        {
          status: 504,
          statusText: 'Gateway Timeout',
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
    upstreamSignal?.removeEventListener('abort', abortFromUpstream)
  }
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'taxi-auth-default',
  },
  global: {
    fetch: fetchWithTimeout,
  },
})

// On iPhone/Safari, always prefer the locally persisted session and re-check
// it after any slower getUser() request. This prevents an auth request started
// before sign-in from resolving later with null and clearing a newly signed-in
// user from the React state.
const originalGetUser = supabase.auth.getUser.bind(supabase.auth)
supabase.auth.getUser = (async (...args: Parameters<typeof originalGetUser>) => {
  const before = await supabase.auth.getSession()
  if (before.data.session?.user) {
    return { data: { user: before.data.session.user }, error: null }
  }

  const result = await originalGetUser(...args)
  if (result.data.user) return result

  const after = await supabase.auth.getSession()
  if (after.data.session?.user) {
    return { data: { user: after.data.session.user }, error: null }
  }

  return result
}) as typeof supabase.auth.getUser
