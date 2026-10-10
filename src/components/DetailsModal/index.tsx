import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { DetailsModalProps } from '@/types/details-modal.types';
import styles from './style.module.css';

const CLOSE_ANIMATION_DURATION_MS = 180;

function DetailsModal({
  title,
  description,
  fields,
  triggerElement,
  onClose,
  children,
}: DetailsModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleRequestClose = useCallback(() => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose();
      return;
    }

    setIsClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      closeTimeoutRef.current = null;
      onClose();
    }, CLOSE_ANIMATION_DURATION_MS);
  }, [onClose]);

  useEffect(() => () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const inertElements: Array<{
      element: HTMLElement;
      wasInert: boolean;
      previousAriaHidden: string | null;
    }> = [];

    let currentElement = dialogRef.current;
    while (currentElement?.parentElement) {
      const parent = currentElement.parentElement;
      Array.from(parent.children).forEach((sibling) => {
        if (!(sibling instanceof HTMLElement) || sibling === currentElement) return;

        inertElements.push({
          element: sibling,
          wasInert: sibling.inert,
          previousAriaHidden: sibling.getAttribute('aria-hidden'),
        });
        sibling.inert = true;
        sibling.setAttribute('aria-hidden', 'true');
      });
      if (parent === document.body) break;
      currentElement = parent;
    }

    const getFocusableElements = () => {
      if (!dialogRef.current) return [];

      return Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleRequestClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (firstElement ?? closeButtonRef.current)?.focus();
        return;
      }

      if (!firstElement || !lastElement) {
        event.preventDefault();
        closeButtonRef.current?.focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!dialogRef.current?.contains(event.target as Node)) {
        (getFocusableElements()[0] ?? closeButtonRef.current)?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      inertElements.reverse().forEach(({ element, wasInert, previousAriaHidden }) => {
        element.inert = wasInert;
        if (previousAriaHidden === null) {
          element.removeAttribute('aria-hidden');
        } else {
          element.setAttribute('aria-hidden', previousAriaHidden);
        }
      });
      window.requestAnimationFrame(() => {
        if (triggerElement?.isConnected) triggerElement.focus();
      });
    };
  }, [handleRequestClose, triggerElement]);

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) handleRequestClose();
  };

  return (
    <div
      className={`${styles.backdrop} ${isClosing ? styles.backdropClosing : ''}`}
      onMouseDown={handleBackdropClick}
    >
      <section
        ref={dialogRef}
        className={`${styles.dialog} ${isClosing ? styles.dialogClosing : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Detalhes do Mottainai</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            type="button"
            onClick={handleRequestClose}
            aria-label={`Fechar ${title.toLocaleLowerCase('pt-BR')}`}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        {description && <p className={styles.description} id={descriptionId}>{description}</p>}

        {fields.length > 0 && (
          <dl className={styles.details}>
            {fields.map((field) => (
              <div className={styles.detailRow} key={field.id}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {children && <div className={styles.extraContent}>{children}</div>}
      </section>
    </div>
  );
}

export default DetailsModal;
