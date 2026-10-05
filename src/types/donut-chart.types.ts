export interface DonutChartSegment {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  title: string;
  description: string;
  segments: readonly DonutChartSegment[];
  centerLabel?: string;
  valueLabel?: string;
  note?: string;
}
