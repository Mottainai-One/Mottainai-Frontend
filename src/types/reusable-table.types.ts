import type { ReactNode } from 'react';

export type TableCellTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface ReusableTableColumn<T extends object> {
    id: string;
    header: string;
    renderCell: (row: T) => ReactNode;
    display?: 'text' | 'badge';
    tone?: (row: T) => TableCellTone;
    align?: 'start' | 'center' | 'end';
}

export interface ReusableTableProps<T extends object> {
    title: string;
    columns: ReusableTableColumn<T>[];
    data: T[];
    rowKey: (row: T) => string | number;
    emptyMessage?: string;
}
