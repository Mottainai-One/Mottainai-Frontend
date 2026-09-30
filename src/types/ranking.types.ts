import type { RankingItem } from '@/types/ranking-item.types';

export type RankingValueFormat = 'currency' | 'decimal';

export interface RankingProps {
    data: readonly RankingItem[];
    title?: string;
    itemLabel?: string;
    valueLabel?: string;
    valueFormat?: RankingValueFormat;
    valueSuffix?: string;
    maxItems?: number;
}
