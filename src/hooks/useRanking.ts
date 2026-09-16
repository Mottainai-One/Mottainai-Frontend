import { useEffect, useState } from 'react';
import { getRanking } from '@/services/rankingService';
import type { RankingItem } from '@/types/ranking-item.types';

interface RankingState {
    data: RankingItem[];
    isLoading: boolean;
    error: string | null;
}

export function useRanking(): RankingState {
    const [state, setState] = useState<RankingState>({ data: [], isLoading: true, error: null });

    useEffect(() => {
        // abortController
        const controller = new AbortController();

        // carregar o pegar a funcao de service
        const loadRanking = async () => {
            try {
                const data = await getRanking(controller.signal);
                setState({ data, isLoading: false, error: null });
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }
                // se der erro
                const message = error instanceof Error ? error.message : 'Erro ao carregar o ranking.';
                setState({ data: [], isLoading: false, error: message });
            }
        };

        void loadRanking();
        return () => controller.abort();
    }, []);

    return state;
}
