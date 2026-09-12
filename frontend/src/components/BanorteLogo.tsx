import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  theme?: 'light' | 'dark' | 'red';
}

export const BanorteLogo: React.FC<LogoProps> = ({
  className = "h-8 w-auto",
  variant = 'full',
  theme = 'dark'
}) => {
  const textColor = theme === 'dark' || theme === 'red' ? '#FFFFFF' : '#1C1E21';
  const accentColor = theme === 'red' ? '#FFFFFF' : '#EB0029';
  const emblemFill = theme === 'red' ? '#FFFFFF' : '#EB0029';

  if (variant === 'icon') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className} fill="none">
        <rect width="48" height="48" rx="12" fill={theme === 'red' ? '#FFFFFF' : '#EB0029'} />
        <g fill={theme === 'red' ? '#EB0029' : '#FFFFFF'}>
          <path d="M12 34 L21 14 L26 14 L17 34 Z" />
          <path d="M20 34 L29 14 L34 14 L25 34 Z" />
          <polygon points="27,14 36,14 32,22 23,22" opacity="0.95" />
        </g>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 44" fill="none" className={className}>
      <g fill={emblemFill}>
        <path d="M6 34 L18 10 L25 10 L13 34 Z" />
        <path d="M17 34 L29 10 L36 10 L24 34 Z" />
        <path d="M28 34 L40 10 L47 10 L35 34 Z" />
        <polygon points="39,10 47,10 41,22 33,22" />
      </g>
      <text
        x="56"
        y="28"
        fontFamily="'Montserrat', 'Helvetica Neue', Arial, sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="1.5"
        fill={textColor}
      >
        BAN<tspan fill={accentColor}>O</tspan>RTE
      </text>
    </svg>
  );
};
