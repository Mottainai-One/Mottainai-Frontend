import { useEffect, useState } from 'react';
import type { AuthLayoutProps } from '@/types/auth-layout.types';
import styles from './style.module.css';
import mottainaiLogo120 from '@/assets/icons/Logo-Orange-120w.png';
import mottainaiLogo240 from '@/assets/icons/Logo-Orange-240w.png';

export function AuthLayout({ title, description, mascotSrc, mascotAlt, children }: AuthLayoutProps) {
  const [isMascotVisible, setIsMascotVisible] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 769px)').matches,
  );

  useEffect(() => {
    document.title = `${title} | Mottainai`;
  }, [title]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 769px)');
    const updateVisibility = () => setIsMascotVisible(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateVisibility);
    return () => mediaQuery.removeEventListener('change', updateVisibility);
  }, []);

  return (
    <>
      <a className="a11y-skip-link" href="#auth-main">Pular para o conteúdo principal</a>
      <main className={styles.container} id="auth-main" tabIndex={-1}>
      <section className={styles.authSection} aria-labelledby="auth-page-title">
        <img
          src={mottainaiLogo120}
          srcSet={`${mottainaiLogo120} 120w, ${mottainaiLogo240} 240w`}
          sizes="(max-width: 420px) 88px, 120px"
          alt="Logotipo do Mottainai"
          className={styles.logo}
          width={120}
          height={121}
          decoding="async"
        />
        <h1 id="auth-page-title" className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{description}</p>
        {children}
      </section>

      <aside className={styles.mascotSection} aria-label="Ilustração da lontra do Mottainai">
        {isMascotVisible && (
          <img
            src={mascotSrc}
            alt={mascotAlt}
            className={styles.mascotImage}
            width={515}
            height={695}
            fetchPriority="high"
            decoding="async"
          />
        )}
      </aside>
      </main>
    </>
  );
}

export default AuthLayout;
