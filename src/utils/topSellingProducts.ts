import type { RankingItem } from '@/types/ranking-item.types';
import type { CashClosingDiscrepancy } from '@/types/stock.types';

export function getTopSellingProducts(
    records: readonly CashClosingDiscrepancy[],
): RankingItem[] {
    const quantityByProduct = records.reduce<Map<string, number>>((totals, record) => {
        const currentQuantity = totals.get(record.item) ?? 0;
        totals.set(record.item, currentQuantity + record.soldQuantity);
        return totals;
    }, new Map<string, number>());

    return Array.from(quantityByProduct, ([name, value]) => ({
        id: `top-selling-${name}`,
        name,
        value,
    })).sort((first, second) => second.value - first.value);
}
