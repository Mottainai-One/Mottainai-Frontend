import type { EngineDecision } from '@/types/engine-decision.types';

export type ExpirationRiskLevel = 'Crítico' | 'Alto' | 'Moderado';

export interface ExpiringProductDecision extends EngineDecision {
    riskLevel: ExpirationRiskLevel;
    store: string;
    category: string;
}

export interface ExpiringProductsFilterState {
    riskLevel: ExpirationRiskLevel | '';
    store: string;
    category: string;
}

export interface ExpiringProductsFiltersProps {
    value: ExpiringProductsFilterState;
    riskLevels: readonly ExpirationRiskLevel[];
    stores: readonly string[];
    categories: readonly string[];
    onChange: (filters: ExpiringProductsFilterState) => void;
}
