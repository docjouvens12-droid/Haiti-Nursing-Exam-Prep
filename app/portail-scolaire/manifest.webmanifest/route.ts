export function GET() {
  const manifest = {
    name: 'Portail Scolaire Haïti',
    short_name: 'Portail Scolaire',
    description: 'Portail scolaire pour la direction, les enseignants et les élèves en Haïti.',
    start_url: '/portail-scolaire',
    scope: '/portail-scolaire/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f4f7fb',
    theme_color: '#0f4c81',
    lang: 'fr-HT',
    icons: [
      {
        src: '/portail-scolaire-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/portail-scolaire-icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }

  return Response.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
