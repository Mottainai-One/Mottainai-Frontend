import type { MouseEvent, ReactNode } from 'react';

export type TableCellTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface ReusableTableColumn<T extends object> {
    id: string;
    header: string;
    renderCell: (row: T) => ReactNode;
    display?: 'text' | 'badge' | 'action';
    tone?: (row: T) => TableCellTone;
    align?: 'start' | 'center' | 'end';
    onAction?: (row: T, event: MouseEvent<HTMLButtonElement>) => void;
    actionLabel?: (row: T) => string;
    actionText?: (row: T) => string;
    actionHasPopup?: boolean;
}

export interface ReusableTableProps<T extends object> {
    title: string;
    columns: ReusableTableColumn<T>[];
    data: T[];
    rowKey: (row: T) => string | number;
    emptyMessage?: string;
    variant?: 'default' | 'plain';
}
