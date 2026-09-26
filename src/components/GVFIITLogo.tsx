import { useId } from 'react';

interface GVFIITLogoProps {
  className?: string;
  size?: number;
}

export default function GVFIITLogo({ className = "", size = 48 }: GVFIITLogoProps) {
  const gradId = 'gvGrad-' + useId().replace(/:/g, '');
  const maskId = 'gvMask-' + useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 280 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ height: size, width: 'auto' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--logo-stop-1, #1a2a5c)" />
          <stop offset="50%" stopColor="var(--logo-stop-2, #1a6b5a)" />
          <stop offset="100%" stopColor="var(--logo-stop-3, #0d7a3e)" />
        </linearGradient>

        <mask id={maskId}>
          {/* Everything white is visible */}
          <rect width="200" height="200" fill="white" />

          {/* Black strokes create the hollow tube effect (the cutouts) */}
          <path
            d="M 61 25 L 35 25 L 15 60 L 35 95 L 65 95 L 85 60 L 49 60"
            fill="none"
            stroke="black"
            strokeWidth="8"
            strokeLinejoin="miter"
            strokeLinecap="butt"
          />
          <path
            d="M 117 82 L 143 29"
            fill="none"
            stroke="black"
            strokeWidth="8"
            strokeLinejoin="miter"
            strokeLinecap="butt"
          />
        </mask>
      </defs>

      {/* GV part scaled down and positioned on the left */}
      <g transform="translate(10, 10) scale(0.6)">
        {/* The Solid Strokes that will be masked to create the outline effect */}
        <g mask={`url(#${maskId})`}>
          {/* G outer stroke */}
          <path
            d="M 65 25 L 35 25 L 15 60 L 35 95 L 65 95 L 85 60 L 45 60"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="16"
            strokeLinejoin="miter"
            strokeLinecap="butt"
          />

          {/* V outer stroke */}
          <path
            d="M 75 25 L 110 95 L 145 25"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="16"
            strokeLinejoin="miter"
            strokeLinecap="butt"
          />
        </g>
      </g>

      {/* FIIT Text and Heartbeat positioned on the right */}
      <g transform="translate(120, 65)">
        <text
          x="0"
          y="0"
          textAnchor="start"
          fontFamily="'Outfit', 'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="56"
          letterSpacing="4"
          fill={`url(#${gradId})`}
        >
          FIIT
        </text>

        {/* Heartbeat / Pulse - exactly matching original trace */}
        <path
          d="M 5 20 L 40 20 L 48 7 L 56 37 L 64 20 L 125 20"
          stroke={`url(#${gradId})`}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
