import { useEffect, useId, useRef } from 'react';
import type { EngineActionModalProps } from '@/types/engine-action-modal.types';
import styles from './style.module.css';

function EngineActionModal({ decision, onClose }: EngineActionModalProps) {
    const titleId = useId();
    const descriptionId = useId();
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
            <section
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>Decisão do Motor Mottainai</p>
                        <h2 id={titleId}>Ação recomendada</h2>
                    </div>
                    <button
                        ref={closeButtonRef}
                        className={styles.closeButton}
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar detalhes da ação"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <p className={styles.description} id={descriptionId}>
                    Veja a recomendação registrada pelo motor para o produto selecionado.
                </p>

                <dl className={styles.details}>
                    <div>
                        <dt>SKU</dt>
                        <dd>{decision.sku}</dd>
                    </div>
                    <div>
                        <dt>Sugestão do motor</dt>
                        <dd>{decision.tactic}</dd>
                    </div>
                    <div>
                        <dt>Horário da decisão</dt>
                        <dd>{decision.time}</dd>
                    </div>
                    <div>
                        <dt>Status</dt>
                        <dd>{decision.status}</dd>
                    </div>
                </dl>

                <button className={styles.dismissButton} type="button" onClick={onClose}>
                    Fechar
                </button>
            </section>
        </div>
    );
}

export default EngineActionModal;
