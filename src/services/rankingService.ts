import type { RankingItem } from '@/types/ranking-item.types';

const MOCK_DELAY_MS = 350;

// mock
const MOCK_RANKING: RankingItem[] = [
    { id: 'joao', name: 'João Cabello JS', value: 7.3 },
    { id: 'ricardo', name: 'Ricardo Cilindro Jesus', value: 1000 },
    { id: 'tutu', name: 'Tutu (FR) actually', value: 1001 },
    { id: 'peres', name: 'Peres pereraldo', value: 9 },
    { id: 'samuel', name: 'Ex Segundo I Samuca', value: 9.9 },
    { id: 'boberto', name: 'Arthur Roberto', value: 0 },
    { id: 'Babiii', name: 'Gaburiela', value: 0.1 },
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
