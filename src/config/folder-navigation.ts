import type { FolderNavigationItem } from "@/types/folder-navigation.types";

export const FOLDER_NAVIGATION_ITEMS = [
    { label: 'Visão Geral', to: '/overview' },
    { label: 'Alertas de Vencimento', to: '/expiringProducts' },
    { label: 'Hábitos de Consumo', to: '/usageHistory' },
] as const satisfies readonly FolderNavigationItem[];

export const STOCK_FOLDER_NAVIGATION_ITEMS = [
    { label: 'Inventário/contagem', to: '/stock', end: true },
    { label: 'Avarias e consumo interno', to: '/stock/damages' },
    { label: 'Transferência de lojas', to: '/stock/transfers', end: false },
    { label: 'Fornecedores', to: '/stock/suppliers', end: false },
] as const satisfies readonly FolderNavigationItem[];

export const ACCOUNTING_FOLDER_NAVIGATION_ITEMS = [
    { label: 'Relatórios/exportação', to: '/managementReports', end: true },
    { label: 'Contabilidade/SPED', to: '/accounting/sped', end: true },
] as const satisfies readonly FolderNavigationItem[];

export const FOLDER_NAVIGATION_PATHS: string[] = FOLDER_NAVIGATION_ITEMS.map((item) => item.to);
