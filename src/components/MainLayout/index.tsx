import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import styles from './style.module.css';

const PAGE_TITLES: Record<string, string> = {
    '/home': 'Início',
    '/overview': 'Visão Geral',
    '/users': 'Usuários',
    '/passwordRecovery': 'Recuperação de Senha',
    '/productTransfer': 'Transferência de Produtos',
    '/settings': 'Configurações',
    '/usageHistory': 'Histórico de Uso',
    '/expiringProducts': 'Produtos a Vencer',
    '/productsRegistration': 'Cadastro de Produtos',
};

function MainLayout() {
    const { pathname } = useLocation();
    const pageTitle = PAGE_TITLES[pathname] ?? 'Mottainai';

    return (
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles['content-shell']}>
                <Header pageTitle={pageTitle} />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
