import { NavLink } from 'react-router-dom';
import { FOLDER_NAVIGATION_ITEMS } from '@/config/folder-navigation';
import styles from './style.module.css';

function FolderNavigation() {
    return (
        <nav className={styles.navigation} aria-label="Seções de análise">
            <ul className={styles.list}>
                {FOLDER_NAVIGATION_ITEMS.map((folder) => (
                    <li className={styles.item} key={folder.to}>
                        <NavLink
                            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                            end
                            to={folder.to}
                        >
                            {folder.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default FolderNavigation;
