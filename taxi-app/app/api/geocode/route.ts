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

function completeLabel(props: any, fallbackName = '') {
  const name = String(props?.name || fallbackName || '').trim()
  const fullAddress = String(props?.full_address || '').trim()
  const placeFormatted = String(props?.place_formatted || '').trim()

  // Prefer Mapbox's complete address when it really contains more than the feature name.
  if (fullAddress && normalize(fullAddress) !== normalize(name)) return fullAddress

  // For streets/addresses where Mapbox sends the street name separately from city/region,
  // combine both so the passenger sees the complete location instead of only the city.
  if (name && placeFormatted) {
    const normalizedName = normalize(name)
    const normalizedContext = normalize(placeFormatted)
    if (!normalizedContext.startsWith(normalizedName)) return `${name}, ${placeFormatted}`
  }

  return fullAddress || placeFormatted || name || 'Destination'
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
        const label = completeLabel(props, name)

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

    const typeRank = (type = '') => {
      const rank: Record<string, number> = {
        address: 0,
        street: 1,
        neighborhood: 2,
        locality: 3,
        place: 4,
        district: 5,
        region: 6,
      }
      return rank[type] ?? 7
    }

    results = [...results].sort((a, b) => {
      const aLabel = normalize(a.label)
      const bLabel = normalize(b.label)
      const aMatches = aLabel.includes(normalizedQuery) ? 0 : 1
      const bMatches = bLabel.includes(normalizedQuery) ? 0 : 1
      if (aMatches !== bMatches) return aMatches - bMatches

      // Street/address results must appear before a city/region with the same text.
      const aType = typeRank(a.featureType)
      const bType = typeRank(b.featureType)
      if (aType !== bType) return aType - bType

      return distance(a) - distance(b)
    })

    const matchingResults = results.filter((result) => normalize(result.label).includes(normalizedQuery))
    if (matchingResults.length) results = matchingResults

    return NextResponse.json({ results: results.slice(0, 12), query: q })
  } catch {
    return NextResponse.json({ results: [], error: 'GEOCODE_FAILED' }, { status: 502 })
  }
}
