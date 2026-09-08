import { NextRequest, NextResponse } from 'next/server'

type Result = { id: string; label: string; center: [number, number] }

export async function GET(request: NextRequest) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))

  if (!token) return NextResponse.json({ results: [], error: 'MAPBOX_TOKEN_MISSING' }, { status: 500 })
  if (q.length < 3) return NextResponse.json({ results: [] })

  const params = new URLSearchParams({
    q,
    access_token: token,
    country: 'ht',
    autocomplete: 'true',
    limit: '10',
    language: 'fr',
    types: 'address,street,neighborhood,locality,place,district,region',
  })

  if (Number.isFinite(lat) && Number.isFinite(lng)) params.set('proximity', `${lng},${lat}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5500)

  try {
    const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`, {
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json({ results: [], error: `MAPBOX_${response.status}` }, { status: 502 })
    }

    const json = await response.json()
    let results: Result[] = (json.features ?? []).flatMap((f: any) => {
      const center = f.geometry?.coordinates
      if (!Array.isArray(center) || center.length < 2) return []
      const props = f.properties ?? {}
      const label = props.full_address || [props.name, props.place_formatted].filter(Boolean).join(', ') || f.name || 'Destination'
      return [{
        id: f.id || props.mapbox_id || `${center[0]},${center[1]}`,
        label,
        center: [Number(center[0]), Number(center[1])] as [number, number],
      }]
    })

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const toRad = (value: number) => value * Math.PI / 180
      const distance = (result: Result) => {
        const dLat = toRad(result.center[1] - lat)
        const dLng = toRad(result.center[0] - lng)
        const lat1 = toRad(lat)
        const lat2 = toRad(result.center[1])
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
        return 6371 * 2 * Math.asin(Math.sqrt(a))
      }
      results = [...results].sort((a, b) => distance(a) - distance(b))
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    const timeoutError = error?.name === 'AbortError'
    return NextResponse.json({ results: [], error: timeoutError ? 'GEOCODE_TIMEOUT' : 'GEOCODE_FAILED' }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}
