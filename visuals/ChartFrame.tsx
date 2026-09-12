import React from 'react';

export function ChartFrame({
  title,
  subtitle,
  legend,
  children,
}: {
  title?: string;
  subtitle?: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bnt-card">
      {title && <h3 className="bnt-card__title">{title}</h3>}
      {subtitle && <p className="bnt-card__subtitle">{subtitle}</p>}
      <div style={{ position: 'relative' }}>{children}</div>
      {legend}
    </div>
  );
}
