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
import { sanitizeLoginCredentials, validateLoginCredentials } from '@/utils/loginValidation';

export function Login() {
    const userEmailFieldId = useId();
    const passwordFieldId = useId();
    const errorMessageId = useId();

    const [formData, setFormData] = useState<LoginFormState>({
        userEmail: '',
        password: '',
        isPasswordVisible: false,
        errors: {},
    });

    const { login, isLoggingIn, error, isAuthenticated } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home', { state: { from: location }, replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    function handleUserEmailChange(event: ChangeEvent<HTMLInputElement>) {
        setFormData((previous) => ({ ...previous, userEmail: event.target.value, errors: { ...previous.errors, userEmail: undefined } }));
    }

    function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
        setFormData((previous) => ({ ...previous, password: event.target.value, errors: { ...previous.errors, password: undefined } }));
    }

    function handleTogglePasswordVisibility() {
        setFormData((previous) => ({ ...previous, isPasswordVisible: !previous.isPasswordVisible }));
    }

    function handleForgotPassword() {
        navigate('/passwordRecovery', { state: { from: location, userEmail: formData.userEmail } });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const credentials = { email: formData.userEmail, password: formData.password };
        const validationErrors = validateLoginCredentials(credentials);
        if (Object.keys(validationErrors).length > 0) {
            setFormData((previous) => ({ ...previous, errors: { userEmail: validationErrors.email, password: validationErrors.password } }));
            window.requestAnimationFrame(() => {
                document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
            });
            return;
        }
        await login(sanitizeLoginCredentials(credentials));
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
            autoComplete="email"
            required
            maxLength={254}
            value={formData.userEmail}
            onChange={handleUserEmailChange}
            aria-invalid={Boolean(formData.errors.userEmail)}
            aria-describedby={formData.errors.userEmail ? `${userEmailFieldId}-error` : undefined}
            />
            {formData.errors.userEmail && <p id={`${userEmailFieldId}-error`} className={styles.errorMessage} role="alert">{formData.errors.userEmail}</p>}

            <label htmlFor={passwordFieldId} className={styles.visuallyHidden}>
            Senha
            </label>
            <div className={styles.passwordField}>
            <input
                id={passwordFieldId}
                name="password"
                type={formData.isPasswordVisible ? 'text' : 'password'}
                className={styles.input}
                placeholder="Senha"
                autoComplete="current-password"
                required
                maxLength={128}
                value={formData.password}
                onChange={handlePasswordChange}
                aria-invalid={Boolean(formData.errors.password)}
                aria-describedby={formData.errors.password ? `${passwordFieldId}-error` : undefined}
            />
            <button
                type="button"
                className={styles.togglePasswordButton}
                onClick={handleTogglePasswordVisibility}
                aria-pressed={formData.isPasswordVisible}
                aria-label={formData.isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            >
                <FontAwesomeIcon icon={formData.isPasswordVisible ? faEyeSlash : faEye} aria-hidden="true"/>
            </button>
            </div>
            {formData.errors.password && <p id={`${passwordFieldId}-error`} className={styles.errorMessage} role="alert">{formData.errors.password}</p>}

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
