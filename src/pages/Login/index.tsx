import { useEffect, useId, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import mottainaiLogo from '@/assets/icons/Logo.png';
import lontraMascot from '@/assets/imgs/lontra-mascot.png';
import styles from './style.module.css';
import { useAuth } from '@/hooks/useAuth'
import  Loading  from '@/components/Loading'
import {
    faEye,
    faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface LoginFormState {
  userEmail: string;
  password: string;
}

export function LoginPage() {
    const userEmailFieldId = useId();
    const passwordFieldId = useId();
    const errorMessageId = useId();

    const [formData, setFormData] = useState<LoginFormState>({
        userEmail: '',
        password: '',
    });

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const { login, isLoggingIn, error, isAuthenticated } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home', { state: { from: location }, replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    function handleUserEmailChange(event: ChangeEvent<HTMLInputElement>) {
        setFormData((previous) => ({ ...previous, userEmail: event.target.value }));
    }

    function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
        setFormData((previous) => ({ ...previous, password: event.target.value }));
    }

    function handleTogglePasswordVisibility() {
        setIsPasswordVisible((previous) => !previous);
    }

    function handleForgotPassword() {
        navigate('/passwordRecovery', { state: { from: location, userEmail: formData.userEmail } });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await login({ email: formData.userEmail, password: formData.password });
    }

    if (isLoggingIn) {
        return (<Loading></Loading>)
    }

    return (
        
    <main className={styles.container}>
        <article className={styles.loginSection}>
        <img src={mottainaiLogo} alt="Logotipo do Mottainai" className={styles.logo} />

        <h1 className={styles.title}>Bem-vindo de volta!</h1>
        <p className={styles.subtitle}>
            Simplificando seu estoque, tudo em um mesmo lugar.
        </p>

        <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
            aria-describedby={error ? errorMessageId : undefined}
        >
            {error && (
            <p id={errorMessageId} role="alert" className={styles.errorMessage}>
                {error}
            </p>
            )}

            <label htmlFor={userEmailFieldId} className={styles.visuallyHidden}>
            Email de Usuário
            </label>
            <input
            id={userEmailFieldId}
            name="email"
            type="email"
            className={styles.input}
            placeholder="Email do Usuário"
            autoComplete="userEmail"
            required
            value={formData.userEmail}
            onChange={handleUserEmailChange}
            />

            <label htmlFor={passwordFieldId} className={styles.visuallyHidden}>
            Senha
            </label>
            <div className={styles.passwordField}>
            <input
                id={passwordFieldId}
                name="password"
                type={isPasswordVisible ? 'text' : 'password'}
                className={styles.input}
                placeholder="Senha"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handlePasswordChange}
            />
            <button
                type="button"
                className={styles.togglePasswordButton}
                onClick={handleTogglePasswordVisibility}
                aria-pressed={isPasswordVisible}
                aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            >
                <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} aria-hidden="true"/>
            </button>
            </div>

            <button
            type="button"
            className={styles.forgotPasswordButton}
            onClick={handleForgotPassword}
            >
            Esqueceu a Senha?
            </button>

            <button type="submit" className={styles.submitButton} disabled={isLoggingIn}>
            {isLoggingIn ? 'Entrando...' : 'Acessar Conta'}
            </button>
        </form>
        </article>

        <article className={styles.mascotSection} aria-hidden="true">
        <img src={lontraMascot} alt="" className={styles.mascotImage} />
        </article>
    </main>
    );
}

export default LoginPage