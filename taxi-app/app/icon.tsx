import { ImageResponse } from 'next/og'

export const size = { width: 1024, height: 1024 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 220,
          background: 'linear-gradient(145deg,#21be78 0%,#0b9561 52%,#055d3e 100%)',
          color: 'white',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 28% 10%,rgba(255,255,255,.16),transparent 34%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 35 }}>
          <div style={{ fontSize: 420, fontWeight: 900, lineHeight: 0.72, letterSpacing: -55 }}>M</div>
          <div
            style={{
              position: 'absolute',
              width: 150,
              height: 190,
              borderRadius: '80px 80px 80px 0',
              background: 'linear-gradient(#89f29a,#52df79)',
              transform: 'rotate(-45deg)',
              top: 160,
              right: 190,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 16px 28px rgba(0,55,38,.28)',
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 999,
                background: '#0c8c5b',
                transform: 'rotate(45deg)',
              }}
            />
          </div>
        </div>
        <div style={{ fontSize: 150, fontWeight: 900, lineHeight: 1, marginTop: 24, letterSpacing: -8 }}>Movi</div>
        <div style={{ fontSize: 42, marginTop: 18, opacity: 0.98 }}>Mouvman pou yon pi bon demen</div>
      </div>
    ),
    size,
  )
}
