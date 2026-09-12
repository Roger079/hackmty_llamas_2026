import React from 'react';
import { Chart } from '../visuals/Chart';
import type { ChartProps } from '../visuals/types';
import { ActionContext } from '../types/a2ui';

interface BanorteChartCardProps extends Partial<ChartProps> {
  onAction?: (ctx: ActionContext) => void;
  disabled?: boolean;
}

export const BanorteChartCard: React.FC<BanorteChartCardProps> = (props) => {
  return (
    <div className="my-3 animate-in fade-in duration-300">
      <Chart
        id={props.id || 'banorte-chart'}
        chartType={props.chartType || 'bar'}
        title={props.title || 'Visualización Financiera Banorte'}
        subtitle={props.subtitle}
        dataPath={props.dataPath}
        categoryKey={props.categoryKey}
        valueKey={props.valueKey}
        series={props.series}
        data={props.data}
        height={props.height || 280}
        valueFormat={props.valueFormat || 'currency'}
        currency={props.currency || 'MXN'}
      />
    </div>
  );
};
