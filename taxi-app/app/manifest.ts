import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Taxi Platform Haiti',
    short_name: 'Taxi Haiti',
    description: 'Mande yon taksi rapidman an Ayiti',
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
