import type {
    EngineActionLevel,
    Product,
    ProductTrafficLight,
} from '@/types/product.types';

export type CriticalitySummaryStatus = EngineActionLevel;

export interface CriticalitySummaryItem {
    id: ProductTrafficLight;
    status: CriticalitySummaryStatus;
    quantity: number;
    guidance: string;
}

export interface CriticalitySummaryProps {
    data: readonly CriticalitySummaryItem[];
}

export type ProductCriticalitySource = Pick<Product, 'trafficLight'>;
