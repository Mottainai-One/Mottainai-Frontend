import type { ProductTrafficLight } from '@/types/product.types';
import type {
    CriticalitySummaryItem,
    ProductCriticalitySource,
} from '@/types/criticality-summary.types';

const criticalityOrder: readonly ProductTrafficLight[] = ['regular', 'attention', 'critical'];

const criticalityDetails: Record<
    ProductTrafficLight,
    Omit<CriticalitySummaryItem, 'id' | 'quantity'>
> = {
    regular: {
        status: 'Moderado',
        guidance: 'Sem ação necessária',
    },
    attention: {
        status: 'Alto',
        guidance: 'Monitorar/Próxima ação',
    },
    critical: {
        status: 'Crítico',
        guidance: 'Ação imediata',
    },
};

export function summarizeProductCriticality(
    products: readonly ProductCriticalitySource[],
): CriticalitySummaryItem[] {
    return criticalityOrder.map((trafficLight) => ({
        id: trafficLight,
        quantity: products.filter((product) => product.trafficLight === trafficLight).length,
        ...criticalityDetails[trafficLight],
    }));
}
