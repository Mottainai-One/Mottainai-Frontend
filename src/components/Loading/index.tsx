import mottainaiLogo from '@/assets/icons/Logo.png';
import thinkingOtter from '@/assets/imgs/lontra-pensando.png';
import styles from './style.module.css';

function Loading() {
    return (
        <main className={styles.screen}>
            <section className={styles.card} role="status" aria-live="polite" aria-busy="true">
                <img className={styles.logo} src={mottainaiLogo} alt="Mottainai" />
                <div className={styles.illustration} aria-hidden="true">
                    <span className={styles.orbit} />
                    <img src={thinkingOtter} alt="" />
                </div>
                <p className={styles.eyebrow}>Seu espaço de trabalho</p>
                <h1>Estamos preparando seu acesso</h1>
                <p className={styles.description}>Só um instante enquanto entramos na sua conta.</p>
                <span className={styles.progress} aria-hidden="true"><span /></span>
                <span className={styles.srOnly}>Entrando na sua conta</span>
            </section>
        </main>
    );
}

export default Loading
