import styles from './style.module.css';

function ManagementReports() {
    return (
        <section className={styles.page} aria-labelledby="management-reports-title">
            <h1 id="management-reports-title">Relatórios gerenciais</h1>
            <p>Esta área será destinada aos relatórios de Contabilidade e SPED.</p>
        </section>
    );
}

export default ManagementReports;
