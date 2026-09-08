import { NextRequest, NextResponse } from 'next/server'

type Result = { id: string; label: string; center: [number, number]; featureType?: string }

const SEARCH_TYPES = 'address,street,neighborhood,locality,place,district,region'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

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
          featureType: props.feature_type || f.feature_type || '',
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
    batches.push(await searchMapbox(q, true))

    if (!batches[0].length && !/ha[iï]ti/i.test(q)) {
      batches.push(await searchMapbox(`${q}, Haïti`, true))
    }

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

    let results = Array.from(deduped.values())
    const normalizedQuery = normalize(q)

    const toRad = (value: number) => value * Math.PI / 180
    const distance = (result: Result) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 0
      const dLat = toRad(result.center[1] - lat)
      const dLng = toRad(result.center[0] - lng)
      const lat1 = toRad(lat)
      const lat2 = toRad(result.center[1])
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
      return 6371 * 2 * Math.asin(Math.sqrt(a))
    }

    results = [...results].sort((a, b) => {
      const aLabel = normalize(a.label)
      const bLabel = normalize(b.label)
      const aMatches = aLabel.includes(normalizedQuery) ? 0 : 1
      const bMatches = bLabel.includes(normalizedQuery) ? 0 : 1
      if (aMatches !== bMatches) return aMatches - bMatches

      const aRegionPenalty = a.featureType === 'region' ? 1 : 0
      const bRegionPenalty = b.featureType === 'region' ? 1 : 0
      if (aRegionPenalty !== bRegionPenalty) return aRegionPenalty - bRegionPenalty

      return distance(a) - distance(b)
    })

    const matchingResults = results.filter((result) => normalize(result.label).includes(normalizedQuery))
    if (matchingResults.length) results = matchingResults

    return NextResponse.json({ results: results.slice(0, 12), query: q })
  } catch {
    return NextResponse.json({ results: [], error: 'GEOCODE_FAILED' }, { status: 502 })
  }
}
