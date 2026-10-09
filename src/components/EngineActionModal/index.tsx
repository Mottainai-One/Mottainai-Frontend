import DetailsModal from '@/components/DetailsModal';
import type { DetailsModalField } from '@/types/details-modal.types';
import type { EngineActionModalProps } from '@/types/engine-action-modal.types';

function EngineActionModal({ decision, contextFields = [], triggerElement, onClose }: EngineActionModalProps) {
    const fields: DetailsModalField[] = [
        { id: 'sku', label: 'SKU', value: decision.sku },
        { id: 'tactic', label: 'Sugestão do motor', value: decision.tactic },
        { id: 'time', label: 'Horário da decisão', value: decision.time },
        { id: 'status', label: 'Status', value: decision.status },
        ...contextFields,
    ];

    return (
        <DetailsModal
            title="Ação do Motor Mottainai"
            description="Detalhes da recomendação registrada para este produto."
            fields={fields}
            triggerElement={triggerElement}
            onClose={onClose}
        />
    );
}

export default EngineActionModal;
