import { useEffect, useState } from 'react';
import { getHistoricalMetrics } from '@/services/historicalMetricService';
import type { HistoricalMetric } from '@/types/historical-metric.types';

interface HistoricalMetricsState {
    data: HistoricalMetric[];
    isLoading: boolean;
    error: string | null;
}

export function useHistoricalMetrics(): HistoricalMetricsState {
    const [state, setState] = useState<HistoricalMetricsState>({
        data: [],
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        const controller = new AbortController();

        const loadMetrics = async () => {
            try {
                const data = await getHistoricalMetrics(controller.signal);
                setState({ data, isLoading: false, error: null });
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }
                const message = error instanceof Error ? error.message : 'Erro ao carregar o histórico.';
                setState({ data: [], isLoading: false, error: message });
            }
        };

        void loadMetrics();
        return () => controller.abort();
    }, []);

    return state;
}
