import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          borderRadius: 40,
          background: 'linear-gradient(145deg,#21be78 0%,#0b9561 52%,#055d3e 100%)',
          color: 'white',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div style={{ fontSize: 78, fontWeight: 900, lineHeight: 0.72, letterSpacing: -9, marginTop: 8 }}>M</div>
        <div
          style={{
            position: 'absolute',
            width: 30,
            height: 38,
            borderRadius: '16px 16px 16px 0',
            background: 'linear-gradient(#89f29a,#52df79)',
            transform: 'rotate(-45deg)',
            top: 24,
            right: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              background: '#0c8c5b',
              transform: 'rotate(45deg)',
            }}
          />
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, marginTop: 10, letterSpacing: -2 }}>Movi</div>
        <div style={{ fontSize: 8, marginTop: 4 }}>Mouvman pou yon pi bon demen</div>
      </div>
    ),
    size,
  )
}
