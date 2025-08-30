import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #8B5CF6, #EC4899)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}
      >
        {/* Simplified brain icon for favicon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 8C18 8 14 12 14 17c-2 0-4 2-4 5s2 5 4 5c0 3 2 6 5 7 1 1 3 1 5 1s4 0 5-1c3-1 5-4 5-7 2 0 4-2 4-5s-2-5-4-5c0-5-4-9-10-9z"
            fill="white"
          />
          <circle cx="20" cy="28" r="1" fill="#8B5CF6"/>
          <circle cx="24" cy="26" r="1" fill="#A855F7"/>
          <circle cx="28" cy="28" r="1" fill="#EC4899"/>
        </svg>
      </div>
    ),
    { ...size }
  )
}
