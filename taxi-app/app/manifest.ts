import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MOVI',
    short_name: 'MOVI',
    description: 'Deplase fasil, rapidman ak an sekirite',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f7faf9',
    theme_color: '#0f705a',
    orientation: 'portrait',
    lang: 'fr-HT',
    categories: ['travel', 'navigation'],
    icons: [
      {
        src: '/taxi-haiti-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/taxi-haiti-icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
