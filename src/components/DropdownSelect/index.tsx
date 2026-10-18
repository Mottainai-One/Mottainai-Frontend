import { useId } from 'react';
import type { DropdownSelectProps } from '@/types/dropdown-select.types';
import styles from './style.module.css';

function DropdownSelect({ id, value, onChange, children, className = '', labelledBy, ariaInvalid, ariaDescribedBy, disabled = false, required = false, name }: DropdownSelectProps) {
    const generatedId = useId();
    return (
        <div className={`${styles.root} ${className}`}>
            <select
                aria-describedby={ariaDescribedBy}
                aria-invalid={ariaInvalid || undefined}
                aria-labelledby={labelledBy}
                className={styles.select}
                disabled={disabled}
                id={id ?? generatedId}
                name={name}
                onChange={onChange}
                required={required}
                value={value}
            >
                {children}
            </select>
            <span aria-hidden="true" className={styles.arrow} />
        </div>
    );
}

export default DropdownSelect;
