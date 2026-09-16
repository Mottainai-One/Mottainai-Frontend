import type { InfoCardProps } from '@/types/info-card.types';
import styles from './style.module.css';

function InfoCard({ title, value, footer, tone = 'neutral' }: InfoCardProps) {

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h2>
          {title}
        </h2>
      </header>

      <div className={`${styles.body} ${styles[tone]}`}>
        {value}
      </div>

      {footer && (
        <footer className={styles.footer}>
          {footer}
        </footer>
      )}
    </article>
  );
}

export default InfoCard;
