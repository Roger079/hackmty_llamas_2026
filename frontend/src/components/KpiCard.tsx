import React from 'react';
import { KpiCard as BaseKpiCard } from '../visuals/KpiCard';
import type { KpiCardProps } from '../visuals/types';

export const KpiCard: React.FC<KpiCardProps> = (props) => {
  return <BaseKpiCard {...props} />;
};
export default KpiCard;
