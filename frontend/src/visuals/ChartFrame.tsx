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
    <div className="bnt-card overflow-hidden">
      {title && <h3 className="-mx-4 -mt-4 mb-3 bg-[#EB0029] px-4 py-3 text-sm font-bold text-white">{title}</h3>}
      {subtitle && <p className="bnt-card__subtitle px-1">{subtitle}</p>}
      <div style={{ position: 'relative' }} className="px-1 pb-1">{children}</div>
      {legend}
    </div>
  );
}
