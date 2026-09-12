import React from 'react';
import banorteIcon from '../assets/brand/banorte-icon.webp';
import banorteWordmark from '../assets/brand/banorte-wordmark.webp';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  /** `red` is for a Banorte-red surface; the supplied red artwork is inverted to white. */
  theme?: 'light' | 'dark' | 'red';
  alt?: string;
}

/** Single source of truth for the supplied Banorte artwork. */
export const BanorteLogo: React.FC<LogoProps> = ({
  className = 'h-8 w-auto',
  variant = 'full',
  theme = 'light',
  alt = 'Banorte',
}) => (
  <img
    src={variant === 'icon' ? banorteIcon : banorteWordmark}
    alt={alt}
    className={`${className} object-contain ${theme === 'red' || theme === 'dark' ? 'brightness-0 invert' : ''}`}
  />
);
