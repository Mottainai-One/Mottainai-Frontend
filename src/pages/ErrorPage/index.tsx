import { useNavigate } from 'react-router-dom';
import styles from './style.module.css'

function ErrorPage(){
    const navigate = useNavigate();

    return(
        <main className={styles.errorPage}>
            <h1>Página não encontrada</h1>
            <p>O endereço acessado não corresponde a uma página disponível.</p>
            <button type="button" onClick={() => navigate('/home')}>Voltar para o início</button>
        </main>
    )
}

export default ErrorPage
