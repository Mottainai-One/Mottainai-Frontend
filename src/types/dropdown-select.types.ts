import type { ChangeEvent, ReactNode } from 'react';

export interface DropdownSelectProps {
    id?: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    children: ReactNode;
    className?: string;
    labelledBy?: string;
    ariaInvalid?: boolean;
    ariaDescribedBy?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
}
