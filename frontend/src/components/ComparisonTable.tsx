import React from 'react';
import { ComparisonTable as BaseComparisonTable } from '../visuals/ComparisonTable';
import type { ComparisonTableProps } from '../visuals/types';

export const ComparisonTable: React.FC<ComparisonTableProps> = (props) => {
  return <BaseComparisonTable {...props} />;
};
export default ComparisonTable;
