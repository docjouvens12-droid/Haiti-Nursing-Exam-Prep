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

export default function HaitiTestGeolocation() {
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('test') !== 'haiti') return

    const geo = navigator.geolocation
    const originalGetCurrentPosition = geo.getCurrentPosition.bind(geo)
    const originalWatchPosition = geo.watchPosition.bind(geo)

    geo.getCurrentPosition = ((success: PositionCallback) => {
      window.setTimeout(() => success(TEST_POSITION), 0)
    }) as typeof geo.getCurrentPosition

    geo.watchPosition = ((success: PositionCallback) => {
      const id = window.setInterval(() => success({ ...TEST_POSITION, timestamp: Date.now() }), 5000)
      window.setTimeout(() => success({ ...TEST_POSITION, timestamp: Date.now() }), 0)
      return id
    }) as typeof geo.watchPosition

    return () => {
      geo.getCurrentPosition = originalGetCurrentPosition
      geo.watchPosition = originalWatchPosition
    }
  }, [])

  return null
}
