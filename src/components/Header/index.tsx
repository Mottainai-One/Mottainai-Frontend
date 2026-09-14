import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '@/hooks/useAuth';
import type { HeaderProps } from '@/types/header.types';
import { NavLink } from 'react-router-dom';
import styles from './style.module.css';

function Header({ storeCnpj = 'Não informado' }: HeaderProps) {
    const { user } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles['session-info']}>
                <span>
                    Você está logado como: <strong>{user?.name ?? 'Usuário'}</strong>
                </span>
                <span className={styles['session-divider']} aria-hidden="true">|</span>
                <span>
                    CNPJ da Loja: <strong>{storeCnpj}</strong>
                </span>
                <span
                    className={styles['account-icon']}
                    role="img"
                    aria-label="Conta do usuário"
                    tabIndex={0}
                >
                    <FontAwesomeIcon icon={faUser} aria-hidden="true" />
                    <NavLink className={styles.tooltip} role="tooltip" to='/account'>
                        Ver conta
                    </NavLink>
                </span>
            </div>
        </header>
    );
}

export default Header;
