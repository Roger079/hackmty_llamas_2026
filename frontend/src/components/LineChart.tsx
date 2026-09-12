import React from 'react';
import { Chart } from '../visuals/Chart';
import type { ChartProps } from '../visuals/types';
import { ActionContext } from '../types/a2ui';

export const LineChart: React.FC<Partial<ChartProps> & { onAction?: (ctx: ActionContext) => void }> = (props) => {
  return (
    <div className="my-2 animate-in fade-in duration-200">
      <Chart
        id="linechart"
        chartType="line"
        title={props.title}
        subtitle={props.subtitle}
        dataPath={props.dataPath || '/data'}
        categoryKey={props.categoryKey || 'x'}
        valueKey={props.valueKey || 'y'}
        series={props.series}
        data={props.data || {}}
        height={props.height || 260}
        valueFormat={props.valueFormat || 'currency'}
        currency={props.currency || 'MXN'}
        {...props}
      />
    </div>
  );
};
export default LineChart;
