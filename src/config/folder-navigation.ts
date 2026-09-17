export const FOLDER_NAVIGATION_ITEMS = [
    { label: 'Visão Geral', to: '/overview' },
    { label: 'Alertas de Vencimento', to: '/expiringProducts' },
    { label: 'Hábitos de Consumo', to: '/usageHistory' },
] as const;

export const FOLDER_NAVIGATION_PATHS: string[] = FOLDER_NAVIGATION_ITEMS.map((item) => item.to);
