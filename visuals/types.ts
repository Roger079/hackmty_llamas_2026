import type { ReactNode } from 'react';

export type ValueFormat = 'number' | 'currency' | 'percent' | 'text' | 'date';
export type SemaforoStatus = 'good' | 'warning' | 'bad' | 'neutral';
export type ChartType = 'line' | 'multiLine' | 'bar' | 'barHorizontal' | 'groupedBar' | 'stackedBar' | 'area' | 'stackedArea' | 'pie' | 'donut' | 'treemap' | 'sunburst' | 'sankey' | 'waterfall' | 'gauge' | 'radar' | 'scatter' | 'bubble' | 'calendarHeatmap' | 'candlestick' | 'boxplot' | 'histogram' | 'bullet';
export type Dynamic<T> = T | { value?: T; path?: string };
export type RecordRow = Record<string, unknown>;

export interface SeriesConfig { name?: Dynamic<string>; dataPath: string; xKey?: string; yKey?: string; colorKey?: string; sizeKey?: string; openKey?: string; highKey?: string; lowKey?: string; closeKey?: string; q1Key?: string; medianKey?: string; q3Key?: string; minKey?: string; maxKey?: string; color?: string }
export interface ThresholdBand { from: Dynamic<number>; to: Dynamic<number>; label?: Dynamic<string>; status?: SemaforoStatus }
export interface ProjectionScenario { name?: Dynamic<string>; dataPath: string; xKey: string; yKey: string; confidenceLowKey?: string; confidenceHighKey?: string }
export interface ChartAction { event: { name: string; context?: Record<string, unknown> } }
export interface ChartProps { id: string; component?: 'Chart'; chartType: ChartType; title?: Dynamic<string>; subtitle?: Dynamic<string>; dataPath?: string; categoryKey?: string; valueKey?: string; parentKey?: string; dateKey?: string; series?: SeriesConfig[]; scenarios?: ProjectionScenario[]; sankeyNodesPath?: string; sankeyLinksPath?: string; waterfallStartLabel?: Dynamic<string>; waterfallEndLabel?: Dynamic<string>; gaugeMin?: Dynamic<number>; gaugeMax?: Dynamic<number>; gaugeValue?: Dynamic<number>; thresholds?: ThresholdBand[]; bulletValue?: Dynamic<number>; bulletTarget?: Dynamic<number>; benchmarkSeries?: SeriesConfig; stacked?: Dynamic<boolean>; showLegend?: Dynamic<boolean>; xAxisLabel?: Dynamic<string>; yAxisLabel?: Dynamic<string>; valueFormat?: ValueFormat; currency?: string; colorPositive?: string; colorNegative?: string; action?: ChartAction; data?: Record<string, unknown>; height?: number; className?: string; onAction?: (event: ChartAction['event'], datum: RecordRow) => void }
export interface KpiCardProps { id?: string; label: Dynamic<string>; value: Dynamic<number>; valueFormat?: ValueFormat; currency?: string; deltaValue?: Dynamic<number>; deltaDirection?: 'up' | 'down' | 'flat'; status?: SemaforoStatus; icon?: ReactNode; data?: Record<string, unknown>; className?: string }
export interface ProgressIndicatorProps { id?: string; variant: 'bar' | 'ring' | 'gauge'; label?: Dynamic<string>; value: Dynamic<number>; min?: Dynamic<number>; max: Dynamic<number>; target?: Dynamic<number>; valueFormat?: ValueFormat; currency?: string; status?: SemaforoStatus; data?: Record<string, unknown>; className?: string }
export interface TableColumn { key: string; label: Dynamic<string>; type: 'text' | 'number' | 'currency' | 'percent' | 'date' | 'status'; sortable?: boolean }
export interface DataTableProps { id?: string; title?: Dynamic<string>; rowsPath?: string; rows?: RecordRow[]; columns: TableColumn[]; filterable?: Dynamic<boolean>; sortable?: Dynamic<boolean>; statusColumnKey?: string; pageSize?: number; data?: Record<string, unknown>; className?: string; virtualizeAfter?: number }
export interface ComparisonColumn { key: string; label: Dynamic<string>; highlight?: boolean }
export interface ComparisonTableProps { id?: string; title?: Dynamic<string>; columns: ComparisonColumn[]; rowsPath?: string; rows?: Array<{ attribute: string; values: Record<string, unknown> }>; data?: Record<string, unknown>; className?: string }
export interface TimelineStep { label: Dynamic<string>; date?: Dynamic<string>; status: 'completed' | 'current' | 'pending' | 'error'; description?: Dynamic<string> }
export interface TimelineProps { id?: string; title?: Dynamic<string>; orientation?: 'horizontal' | 'vertical'; stepsPath?: string; steps?: TimelineStep[]; data?: Record<string, unknown>; className?: string }
export interface GeoMarker { lat: number; lng: number; label: string; value?: number }
export interface GeoMapProps { id?: string; markersPath?: string; markers?: GeoMarker[]; centerLat?: Dynamic<number>; centerLng?: Dynamic<number>; zoom?: number; data?: Record<string, unknown>; className?: string; onMarkerClick?: (marker: GeoMarker) => void }
