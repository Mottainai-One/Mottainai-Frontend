import type { EngineDecision } from '@/types/engine-decision.types';

export interface EngineActionModalProps {
    decision: EngineDecision;
    onClose: () => void;
}

export interface EngineActionDialogState {
    decision: EngineDecision;
    trigger: HTMLButtonElement;
}
