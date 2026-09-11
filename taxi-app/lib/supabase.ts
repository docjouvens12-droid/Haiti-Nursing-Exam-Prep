import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const storageKey = 'taxi-auth-default'

function extractSession(raw: string | null) {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const session = parsed?.currentSession ?? parsed?.session ?? parsed
    if (!session?.access_token || !session?.user?.id) return null
    return session
  } catch {
    return null
  }
}

function migrateLegacySession() {
  if (typeof window === 'undefined') return
  try {
    const current = extractSession(window.localStorage.getItem(storageKey))
    if (current) return

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (!key || key === storageKey) continue
      if (!key.includes('auth') && !key.includes('supabase') && !key.includes('sb-')) continue

      const raw = window.localStorage.getItem(key)
      const session = extractSession(raw)
      if (!session) continue

      window.localStorage.setItem(storageKey, JSON.stringify(session))
      break
    }
  } catch {
    // Storage migration must never block MOVI.
  }
}

migrateLegacySession()

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
    storageKey,
  },
  global: {
    fetch: fetchWithTimeout,
  },
})

function readPersistedSession() {
  if (typeof window === 'undefined') return null
  try {
    migrateLegacySession()
    return extractSession(window.localStorage.getItem(storageKey))
  } catch {
    return null
  }
}

// Safari/PWA can occasionally leave the Supabase auth lock waiting even though
// a valid persisted session is already present. Prefer that local session so
// MOVI role routing and driver/admin dashboards can render immediately.
const originalGetSession = supabase.auth.getSession.bind(supabase.auth)
supabase.auth.getSession = (async () => {
  const persisted = readPersistedSession()
  if (persisted) {
    return { data: { session: persisted }, error: null }
  }
  return originalGetSession()
}) as typeof supabase.auth.getSession

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
