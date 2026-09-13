import React from 'react';
import { Chart } from '../visuals/Chart';
import type { ChartProps } from '../visuals/types';
import { ActionContext } from '../types/a2ui';

export const BarChart: React.FC<Partial<ChartProps> & { onAction?: (ctx: ActionContext) => void }> = (props) => {
  return (
    <div className="my-2 animate-in fade-in duration-200">
      <Chart
        id="barchart"
        chartType={props.chartType || (props.series && props.series.length > 1 ? 'groupedBar' : 'bar')}
        title={props.title}
        subtitle={props.subtitle}
        dataPath={props.dataPath || '/data'}
        categoryKey={props.categoryKey}
        valueKey={props.valueKey}
        series={props.series}
        data={props.data || {}}
        height={props.height || 280}
        valueFormat={props.valueFormat || 'currency'}
        currency={props.currency || 'MXN'}
        onAction={props.onAction ? (event, datum) => props.onAction?.({ action: event.name, params: datum, source_component: 'BarChart' }) : undefined}
        {...props}
      />
    </div>
  );
};
export default BarChart;
