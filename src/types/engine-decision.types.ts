export type EngineDecisionStatus = 'Sem ação' | 'Aprovado' | 'Em aguardo' | 'Crítico' | 'Editado';

export interface EngineDecision {
    id: string;
    time: string;
    sku: string;
    tactic: string;
    status: EngineDecisionStatus;
}
