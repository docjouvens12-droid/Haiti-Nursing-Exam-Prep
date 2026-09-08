import { NextRequest, NextResponse } from 'next/server'

type Result = { id: string; label: string; center: [number, number] }

const SEARCH_TYPES = 'address,street,neighborhood,locality,place,district,region'

export async function GET(request: NextRequest) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))

  if (!token) return NextResponse.json({ results: [], error: 'MAPBOX_TOKEN_MISSING' }, { status: 500 })
  if (q.length < 3) return NextResponse.json({ results: [] })

  const proximity = Number.isFinite(lat) && Number.isFinite(lng) ? `${lng},${lat}` : null

  async function searchMapbox(query: string, useTypes = true): Promise<Result[]> {
    const params = new URLSearchParams({
      q: query,
      access_token: token as string,
      country: 'ht',
      autocomplete: 'true',
      limit: '10',
      language: 'fr',
    })

    if (useTypes) params.set('types', SEARCH_TYPES)
    if (proximity) params.set('proximity', proximity)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`, {
        signal: controller.signal,
        cache: 'no-store',
      })

      if (!response.ok) return []

      const json = await response.json()
      return (json.features ?? []).flatMap((f: any) => {
        const center = f.geometry?.coordinates
        if (!Array.isArray(center) || center.length < 2) return []

        const props = f.properties ?? {}
        const name = props.name || f.name || ''
        const context = props.place_formatted || ''
        const label = props.full_address || [name, context].filter(Boolean).join(', ') || 'Destination'

        return [{
          id: f.id || props.mapbox_id || `${center[0]},${center[1]}`,
          label,
          center: [Number(center[0]), Number(center[1])] as [number, number],
        }]
      })
    } catch {
      return []
    } finally {
      clearTimeout(timeout)
    }
  }

  try {
    const batches: Result[][] = []

    // 1) Natural query exactly as the passenger typed it.
    batches.push(await searchMapbox(q, true))

    // 2) Some Haitian neighborhoods/streets are indexed only when Haiti is
    // explicitly present in the query. This lets users type just “Lalue”,
    // “Raboto”, “Rue Egalite”, etc.
    if (!batches[0].length && !/ha[iï]ti/i.test(q)) {
      batches.push(await searchMapbox(`${q}, Haïti`, true))
    }

    // 3) Last Mapbox fallback: remove the type restriction. This catches
    // locally indexed POIs/areas whose feature type is not one of our usual
    // address/locality types.
    if (!batches.some((batch) => batch.length)) {
      batches.push(await searchMapbox(q, false))
      if (!/ha[iï]ti/i.test(q)) batches.push(await searchMapbox(`${q}, Haïti`, false))
    }

    const deduped = new Map<string, Result>()
    for (const batch of batches) {
      for (const result of batch) {
        const key = `${result.center[0].toFixed(6)},${result.center[1].toFixed(6)}|${result.label.toLowerCase()}`
        if (!deduped.has(key)) deduped.set(key, result)
      }
    }

    let results = Array.from(deduped.values()).slice(0, 12)

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

    return NextResponse.json({ results, query: q })
  } catch {
    return NextResponse.json({ results: [], error: 'GEOCODE_FAILED' }, { status: 502 })
  }
}
