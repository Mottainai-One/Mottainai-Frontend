import { useEffect } from 'react';
import type { AuthLayoutProps } from '@/types/auth-layout.types';
import styles from './style.module.css';
import mottainaiLogo from '@/assets/icons/Logo-Orange.png';

export function AuthLayout({ title, description, mascotSrc, mascotAlt, children }: AuthLayoutProps) {
  useEffect(() => {
    document.title = `${title} | Mottainai`;
  }, [title]);

  return (
    <>
      <a className="a11y-skip-link" href="#auth-main">Pular para o conteúdo principal</a>
      <main className={styles.container} id="auth-main" tabIndex={-1}>
      <section className={styles.authSection} aria-labelledby="auth-page-title">
        <img src={mottainaiLogo} alt="Logotipo do Mottainai" className={styles.logo} />
        <h1 id="auth-page-title" className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{description}</p>
        {children}
      </section>

      <aside className={styles.mascotSection} aria-label="Ilustração da lontra do Mottainai">
        <img src={mascotSrc} alt={mascotAlt} className={styles.mascotImage} />
      </aside>
      </main>
    </>
  );
}

export default AuthLayout;
