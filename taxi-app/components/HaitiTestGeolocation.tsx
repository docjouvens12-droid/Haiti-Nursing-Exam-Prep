'use client'

import { useLayoutEffect } from 'react'

const TEST_POSITION: GeolocationPosition = {
  coords: {
    latitude: 18.5392,
    longitude: -72.3364,
    accuracy: 15,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON: () => ({}),
  },
  timestamp: Date.now(),
  toJSON: () => ({}),
}

const TEST_MODE_KEY = 'taxi-haiti-test-mode'

function isInsideHaiti(latitude: number, longitude: number) {
  return latitude >= 17.8 && latitude <= 20.2 && longitude >= -74.7 && longitude <= -71.4
}

export default function HaitiTestGeolocation() {
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return

    const params = new URLSearchParams(window.location.search)
    const requestedTestMode = params.get('test') === 'haiti'
    if (requestedTestMode) window.localStorage.setItem(TEST_MODE_KEY, 'haiti')

    const forceTestMode = requestedTestMode || window.localStorage.getItem(TEST_MODE_KEY) === 'haiti'
    const geo = navigator.geolocation
    const originalGetCurrentPosition = geo.getCurrentPosition.bind(geo)
    const originalWatchPosition = geo.watchPosition.bind(geo)

    geo.getCurrentPosition = ((success: PositionCallback, error?: PositionErrorCallback | null, options?: PositionOptions) => {
      if (forceTestMode) {
        window.setTimeout(() => success({ ...TEST_POSITION, timestamp: Date.now() }), 0)
        return
      }

      originalGetCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        if (isInsideHaiti(latitude, longitude)) success(position)
        else success({ ...TEST_POSITION, timestamp: Date.now() })
      }, error ?? undefined, options)
    }) as typeof geo.getCurrentPosition

    geo.watchPosition = ((success: PositionCallback, error?: PositionErrorCallback | null, options?: PositionOptions) => {
      if (forceTestMode) {
        const id = window.setInterval(() => success({ ...TEST_POSITION, timestamp: Date.now() }), 5000)
        window.setTimeout(() => success({ ...TEST_POSITION, timestamp: Date.now() }), 0)
        return id
      }

      return originalWatchPosition((position) => {
        const { latitude, longitude } = position.coords
        if (isInsideHaiti(latitude, longitude)) success(position)
        else success({ ...TEST_POSITION, timestamp: Date.now() })
      }, error ?? undefined, options)
    }) as typeof geo.watchPosition

    return () => {
      geo.getCurrentPosition = originalGetCurrentPosition
      geo.watchPosition = originalWatchPosition
    }
  }, [])

  return null
}
