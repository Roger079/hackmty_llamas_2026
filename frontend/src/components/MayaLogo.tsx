import React from 'react';

interface MayaLogoProps {
  size?: number;
  showStatus?: boolean;
  className?: string;
  label?: string;
}

/**
 * Maya's mark: a conversational four-point spark with an inset M gesture.
 * It stays intentionally simple so it remains legible from navigation-icon
 * size through the larger identity treatment on the login screen.
 */
export const MayaLogo: React.FC<MayaLogoProps> = ({
  size = 40,
  showStatus = false,
  className = '',
  label,
}) => (
  <span
    className={`relative inline-grid shrink-0 place-items-center rounded-[28%] bg-[#FFF0F4] ${className}`}
    style={{ width: size, height: size }}
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
  >
    <svg viewBox="0 0 48 48" className="h-[72%] w-[72%] overflow-visible" fill="none">
      <path
        d="M24 2.5C26.8 13.2 34.8 21.2 45.5 24C34.8 26.8 26.8 34.8 24 45.5C21.2 34.8 13.2 26.8 2.5 24C13.2 21.2 21.2 13.2 24 2.5Z"
        fill="#E4003B"
      />
      <path
        d="M15.2 29.7V19.1L24 27.7L32.8 19.1V29.7"
        stroke="white"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="1.65" fill="white" />
    </svg>
    {showStatus && (
      <span className="absolute -bottom-0.5 -right-0.5 h-[22%] w-[22%] rounded-full bg-emerald-500 ring-2 ring-white" />
    )}
  </span>
);
