import type { DonutChartSegment } from '@/types/donut-chart.types';

// Demonstração: o cadastro atual ainda não registra descarte por categoria.
export const wastedItemsByCategory: DonutChartSegment[] = [
  { id: 'butcher', label: 'Açougue', value: 4, color: '#c64c49' },
  { id: 'dairy', label: 'Laticínios', value: 3, color: '#d78b25' },
  { id: 'produce', label: 'Horti-Fruti', value: 2, color: '#2d5778' },
];
