import type { HistoricalMetric } from '@/types/historical-metric.types';

const MOCK_DELAY_MS = 450;

function createMockHistory(): HistoricalMetric[] {
    const values = [64, 61, 59, 60, 58, 62, 65, 63, 66, 68, 67, 70, 72, 71, 74, 76, 75, 78, 80, 83, 81, 85, 87, 86, 89, 92, 90, 94, 96, 98, 97];
    const today = new Date();

    return values.map((value, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (values.length - 1 - index));
        return {
            date: date.toISOString().slice(0, 10),
            value,
        };
    });
}

export async function getHistoricalMetrics(signal?: AbortSignal): Promise<HistoricalMetric[]> {
    try {
        await new Promise<void>((resolve, reject) => {
            const timeoutId = window.setTimeout(resolve, MOCK_DELAY_MS);
            signal?.addEventListener('abort', () => {
                window.clearTimeout(timeoutId);
                reject(new DOMException('A consulta foi cancelada.', 'AbortError'));
            }, { once: true });
        });

        if (signal?.aborted) {
            throw new DOMException('A consulta foi cancelada.', 'AbortError');
        }

        return createMockHistory();
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        throw Object.assign(new Error('Não foi possível carregar o histórico de métricas.'), { cause: error });
    }
}
