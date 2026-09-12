import { NextRequest, NextResponse } from 'next/server'

type Result = { id: string; label: string; center: [number, number]; featureType?: string }

const SEARCH_TYPES = 'address,street,neighborhood,locality,place,district,region'
const PRECISE_TYPES = new Set(['address', 'street', 'neighborhood'])

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

  if (fullAddress && normalize(fullAddress) !== normalize(name)) return fullAddress

  if (name && placeFormatted) {
    const normalizedName = normalize(name)
    const normalizedContext = normalize(placeFormatted)
    if (!normalizedContext.startsWith(normalizedName)) return `${name}, ${placeFormatted}`
  }

  return fullAddress || placeFormatted || name || 'Destination'
}

function looksLikeStreetAddress(query: string) {
  const q = normalize(query)
  const hasNumber = /(^|\s)\d+[a-z]?(\s|$)/i.test(q)
  const hasStreetWord = /\b(rue|ruelle|route|avenue|av|boulevard|bd|impasse|chemin|road|street|st)\b/i.test(q)
  return hasNumber || hasStreetWord
}

function buildAddressVariants(query: string) {
  const clean = query.trim().replace(/\s+/g, ' ')
  const variants = new Set<string>([clean])

  if (!/ha[iï]ti/i.test(clean)) variants.add(`${clean}, Haïti`)

  // Haitian users commonly type "125 rue egalite gonaives" without commas.
  // Adding punctuation/context gives Mapbox a better chance to parse house/street/city separately.
  const normalized = normalize(clean)
  const knownCities = ['gonaives', 'les gonaives', 'port au prince', 'cap haitien', 'saint marc', 'jacmel', 'les cayes', 'petion ville', 'delmas']
  for (const city of knownCities) {
    const index = normalized.lastIndexOf(city)
    if (index > 0) {
      const wordsBeforeCity = clean.slice(0, Math.min(clean.length, index)).trim().replace(/[,:-]+$/g, '')
      if (wordsBeforeCity) {
        variants.add(`${wordsBeforeCity}, ${city}, Haïti`)
      }
    }
  }

  return Array.from(variants)
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

  async function searchMapboxV6(query: string, useTypes = true): Promise<Result[]> {
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
        return [{
          id: f.id || props.mapbox_id || `${center[0]},${center[1]}`,
          label: completeLabel(props, name),
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

  async function searchMapboxSearchBox(query: string): Promise<Result[]> {
    const params = new URLSearchParams({
      q: query,
      access_token: token as string,
      country: 'HT',
      language: 'fr',
      limit: '10',
    })
    if (proximity) params.set('proximity', proximity)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/forward?${params.toString()}`, {
        signal: controller.signal,
        cache: 'no-store',
      })
      if (!response.ok) return []

      const json = await response.json()
      return (json.features ?? []).flatMap((f: any) => {
        const props = f.properties ?? {}
        const center = f.geometry?.coordinates || props.coordinates?.longitude && props.coordinates?.latitude
          ? [props.coordinates?.longitude, props.coordinates?.latitude]
          : null
        if (!Array.isArray(center) || center.length < 2 || !Number.isFinite(Number(center[0])) || !Number.isFinite(Number(center[1]))) return []

        return [{
          id: f.id || props.mapbox_id || `searchbox-${center[0]},${center[1]}`,
          label: completeLabel(props, props.name || ''),
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
    const variants = buildAddressVariants(q)

    for (const variant of variants) {
      batches.push(await searchMapboxV6(variant, true))
    }

    const hasPreciseV6 = batches.some(batch => batch.some(result => PRECISE_TYPES.has(result.featureType || '')))
    if (!hasPreciseV6 && looksLikeStreetAddress(q)) {
      for (const variant of variants) batches.push(await searchMapboxSearchBox(variant))
    }

    if (!batches.some(batch => batch.length)) {
      batches.push(await searchMapboxV6(q, false))
    }

    const deduped = new Map<string, Result>()
    for (const batch of batches) {
      for (const result of batch) {
        const key = `${result.center[0].toFixed(6)},${result.center[1].toFixed(6)}|${normalize(result.label)}`
        if (!deduped.has(key)) deduped.set(key, result)
      }
    }

    let results = Array.from(deduped.values())
    const normalizedQuery = normalize(q)
    const addressLike = looksLikeStreetAddress(q)

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

    // If the user entered a house number/street, never let a city-only result replace it.
    // Keep only precise results when Mapbox found at least one; otherwise show no misleading city suggestion.
    if (addressLike) {
      const precise = results.filter(result => PRECISE_TYPES.has(result.featureType || ''))
      if (precise.length) results = precise
      else results = []
    }

    results = [...results].sort((a, b) => {
      const aLabel = normalize(a.label)
      const bLabel = normalize(b.label)
      const aMatches = aLabel.includes(normalizedQuery) ? 0 : 1
      const bMatches = bLabel.includes(normalizedQuery) ? 0 : 1
      if (aMatches !== bMatches) return aMatches - bMatches

      const aType = typeRank(a.featureType)
      const bType = typeRank(b.featureType)
      if (aType !== bType) return aType - bType

      return distance(a) - distance(b)
    })

    return NextResponse.json({ results: results.slice(0, 12), query: q, precise: addressLike })
  } catch {
    return NextResponse.json({ results: [], error: 'GEOCODE_FAILED' }, { status: 502 })
  }
}
