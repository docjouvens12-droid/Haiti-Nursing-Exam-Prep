import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Session manquante.' }, { status: 401 })
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_my_driver_dashboard`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: '{}',
      cache: 'no-store',
    })

    const text = await response.text()
    let payload: unknown = null
    try {
      payload = text ? JSON.parse(text) : null
    } catch {
      payload = { error: text || 'Réponse Supabase invalide.' }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: (payload as any)?.message || (payload as any)?.error || `Supabase ${response.status}` },
        { status: response.status },
      )
    }

    return NextResponse.json({ data: payload }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Impossible de charger le tableau de bord.' },
      { status: 500 },
    )
  }
}
