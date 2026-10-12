import { NavLink, useLocation } from 'react-router-dom';
import { FOLDER_NAVIGATION_ITEMS } from '@/config/folder-navigation';
import type { FolderNavigationProps } from '@/types/folder-navigation.types';
import styles from './style.module.css';

function FolderNavigation({
    items = FOLDER_NAVIGATION_ITEMS,
    ariaLabel = 'Seções de análise',
}: Partial<FolderNavigationProps>) {
    const { pathname } = useLocation();

    return (
        <nav className={styles.navigation} aria-label={ariaLabel}>
            <ul className={styles.list}>
                {items.map((folder) => (
                    <li className={styles.item} key={folder.to}>
                        {folder.disabled ? (
                            <button className={`${styles.link} ${styles.disabled}`} type="button" disabled>
                                {folder.label}
                            </button>
                        ) : (
                            <NavLink
                                className={({ isActive }) => `${styles.link} ${isActive || folder.activePaths?.includes(pathname) ? styles.active : ''}`}
                                aria-current={folder.activePaths?.includes(pathname) ? 'page' : undefined}
                                end={folder.end ?? true}
                                to={folder.to}
                            >
                                {folder.label}
                            </NavLink>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default FolderNavigation;
