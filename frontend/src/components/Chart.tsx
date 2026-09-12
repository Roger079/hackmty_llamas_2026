import React from 'react';
import { Chart as BaseChart } from '../visuals/Chart';
import type { ChartProps } from '../visuals/types';
import { ActionContext } from '../types/a2ui';

export const Chart: React.FC<ChartProps & { onAction?: (ctx: ActionContext) => void }> = (props) => {
  return <BaseChart {...props} />;
};
export default Chart;
