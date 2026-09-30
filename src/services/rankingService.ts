import type { RankingItem } from '@/types/ranking-item.types';

const MOCK_DELAY_MS = 350;

// mock
const MOCK_RANKING: RankingItem[] = [
    { id: '1', name: 'Lanche de Frango', value: 800 },
    { id: '2', name: 'Pizza mussarela', value: 7806 },
    { id: '3', name: 'Strogonoff de Frango', value: 9754 },
    { id: '4', name: 'Feijoada', value: 1452 },
    { id: '5', name: 'Okonomiyaki', value: 3223 },
    { id: '6', name: 'Macarrão com Carne', value: 1322 },
    { id: '7', name: 'Alfajor', value: 190 },
];

export async function getRanking(signal?: AbortSignal): Promise<RankingItem[]> {
    try {
        await new Promise<void>((resolve, reject) => {
            // pra esperrar
            const timeoutId = window.setTimeout(resolve, MOCK_DELAY_MS);
            signal?.addEventListener('abort', () => {
                window.clearTimeout(timeoutId);
                // abortController
                reject(new DOMException('A consulta foi cancelada.', 'AbortError'));
            }, { once: true });
        });

        if (signal?.aborted) {
            // abortControlle
            throw new DOMException('A consulta foi cancelada.', 'AbortError');
        }

        return MOCK_RANKING;
    } catch (error) {
        // abortController
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        // se der erro
        throw Object.assign(new Error('Não foi possível carregar o ranking.'), { cause: error });
    }
}
