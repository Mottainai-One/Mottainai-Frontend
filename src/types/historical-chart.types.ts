import type { HistoricalMetric } from "@/types/historical-metric.types";

export interface HistoricalChartProps {
  data: HistoricalMetric[];
  title?: string;
  description?: string;
  period?: string;
  datasetLabel?: string;
  ariaLabel?: string;
  compact?: boolean;
}
