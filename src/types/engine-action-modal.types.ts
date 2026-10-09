import type { EngineDecision } from '@/types/engine-decision.types';
import type { DetailsModalField } from '@/types/details-modal.types';

export interface EngineActionModalProps {
    decision: EngineDecision;
    contextFields?: readonly DetailsModalField[];
    triggerElement: HTMLButtonElement;
    onClose: () => void;
}

export interface EngineActionDialogState {
    decision: EngineDecision;
    trigger: HTMLButtonElement;
    contextFields?: readonly DetailsModalField[];
}
