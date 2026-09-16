import type { ReactNode } from 'react';

export type InfoCardTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface InfoCardProps {
    title: ReactNode;
    value: ReactNode;
    footer?: ReactNode;
    tone?: InfoCardTone;
}
