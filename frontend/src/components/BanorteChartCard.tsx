import React from 'react';
import { Chart } from '../visuals/Chart';
import type { ChartProps } from '../visuals/types';
import { ActionContext } from '../types/a2ui';

interface BanorteChartCardProps extends Omit<Partial<ChartProps>, 'onAction'> {
  onAction?: (ctx: ActionContext) => void;
  disabled?: boolean;
}

export const BanorteChartCard: React.FC<BanorteChartCardProps> = ({
  id = 'banorte-chart',
  chartType = 'bar',
  title = 'Visualización Financiera Banorte',
  height,
  valueFormat = 'currency',
  currency = 'MXN',
  onAction,
  disabled,
  ...rest
}) => {
  const isSankey = chartType === 'sankey';
  const resolvedHeight = isSankey ? Math.max(height || 420, 420) : (height || 300);

  return (
    <div className="my-3">
      <Chart
        id={id}
        chartType={chartType}
        title={title}
        height={resolvedHeight}
        valueFormat={valueFormat}
        currency={currency}
        onAction={onAction ? (event, datum) => onAction({ action: event.name, params: datum, source_component: 'BanorteChartCard' }) : undefined}
        {...rest}
      />
    </div>
  );
};
