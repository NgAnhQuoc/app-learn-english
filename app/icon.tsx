import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #1a1a2e, #16213e, #0f3460)',
          borderRadius: '24%',
          color: '#ffd700',
          fontSize: 22,
          fontWeight: 800,
          fontFamily: 'system-ui, sans-serif',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
          textShadow: '0 2px 5px rgba(0,0,0,0.8)',
        }}
      >
        M
      </div>
    ),
    {
      ...size,
    }
  )
}
