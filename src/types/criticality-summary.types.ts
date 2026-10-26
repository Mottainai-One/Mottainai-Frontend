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

export type ProductCriticalitySource = Pick<Product, 'trafficLight'>;
