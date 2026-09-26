import { useEffect, useId, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { LoginFormState } from '@/types/login.types';
import { useLocation, useNavigate } from 'react-router';
import AuthLayout from '@/components/AuthLayout';
import styles from '@/components/AuthLayout/style.module.css';
import lontraExplicando from '@/assets/imgs/lontra-explicando.png';
import { useAuth } from '@/hooks/useAuth'
import  Loading  from '@/components/Loading'
import {
    faEye,
    faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function Login() {
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
    <AuthLayout
        title="Bem-vindo de volta!"
        description="Simplificando seu estoque, tudo em um mesmo lugar."
        mascotSrc={lontraExplicando}
        mascotAlt="Lontra mascote explicando o sistema"
    >
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
    </AuthLayout>
    );
}

export default Login
