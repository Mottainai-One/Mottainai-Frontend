import { useId, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AuthLayout from '@/components/AuthLayout';
import styles from '@/components/AuthLayout/style.module.css';
import type {
  NewPasswordFormState,
  NewPasswordState,
} from '@/types/password-recovery.types';
import { resetPassword } from '@/services/passwordRecoveryService';
import { validateNewPassword } from '@/utils/passwordRecoveryValidation';

function NewPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const passwordFieldId = useId();
  const confirmationFieldId = useId();
  const feedbackId = useId();
  const resetToken = searchParams.get('token');

  const [formData, setFormData] = useState<NewPasswordFormState>({
    password: '',
    passwordConfirmation: '',
  });
  const [state, setState] = useState<NewPasswordState>({
    isLoading: false,
    feedback: null,
    feedbackType: null,
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setFormData((previous) => ({ ...previous, password: event.target.value }));
    setState((previous) => ({ ...previous, feedback: null, feedbackType: null }));
  }

  function handleConfirmationChange(event: ChangeEvent<HTMLInputElement>) {
    setFormData((previous) => ({ ...previous, passwordConfirmation: event.target.value }));
    setState((previous) => ({ ...previous, feedback: null, feedbackType: null }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetToken) {
      setState({
        isLoading: false,
        feedback: 'Sua sessão de recuperação expirou. Solicite um novo código.',
        feedbackType: 'error',
      });
      return;
    }

    const validationError = validateNewPassword(formData.password, formData.passwordConfirmation);
    if (validationError) {
      setState({ isLoading: false, feedback: validationError, feedbackType: 'error' });
      return;
    }

    setState({ isLoading: true, feedback: null, feedbackType: null });
    try {
      const response = await resetPassword(resetToken, formData.password);
      setState({ isLoading: false, feedback: response.message, feedbackType: 'success' });
    } catch (error) {
      setState({
        isLoading: false,
        feedback: error instanceof Error ? error.message : 'Não foi possível alterar a senha.',
        feedbackType: 'error',
      });
    }
  }

  function handleBackToLogin() {
    navigate('/login');
  }

  const feedback = state.feedback ? (
    <p
      id={feedbackId}
      className={`${styles.feedbackMessage} ${state.feedbackType === 'error' ? styles.errorMessage : styles.successMessage}`}
      role={state.feedbackType === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {state.feedback}
    </p>
  ) : null;

  if (!resetToken || state.feedbackType === 'success') {
    return (
      <AuthLayout
        title={state.feedbackType === 'success' ? 'Tudo certo!' : 'Link inválido'}
        description={state.feedbackType === 'success' ? 'Sua senha foi atualizada.' : 'Solicite um novo código para continuar.'}
      >
        <div className={styles.form} aria-describedby={state.feedback ? feedbackId : undefined}>
          {feedback}
          <button type="button" className={styles.submitButton} onClick={handleBackToLogin}>
            Ir para o login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crie uma nova senha"
      description="Escolha uma senha segura para voltar a acessar sua conta."
    >
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
        aria-describedby={state.feedback ? feedbackId : undefined}
      >
        {feedback}
        {state.isLoading && (
          <p className={styles.codeHint} role="status" aria-live="polite">Salvando sua nova senha...</p>
        )}
        <label htmlFor={passwordFieldId} className={styles.visuallyHidden}>Nova senha</label>
        <div className={styles.passwordField}>
          <input
            id={passwordFieldId}
            name="password"
            type={isPasswordVisible ? 'text' : 'password'}
            className={styles.input}
            placeholder="Nova senha"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handlePasswordChange}
            aria-invalid={state.feedbackType === 'error' ? 'true' : undefined}
          />
          <button
            type="button"
            className={styles.togglePasswordButton}
            onClick={() => setIsPasswordVisible((previous) => !previous)}
            aria-pressed={isPasswordVisible}
            aria-label={isPasswordVisible ? 'Ocultar nova senha' : 'Mostrar nova senha'}
          >
            <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} aria-hidden="true" />
          </button>
        </div>
        <p className={styles.passwordRequirements}>Use pelo menos 8 caracteres.</p>
        <label htmlFor={confirmationFieldId} className={styles.visuallyHidden}>Confirme sua nova senha</label>
        <div className={styles.passwordField}>
          <input
            id={confirmationFieldId}
            name="passwordConfirmation"
            type={isConfirmationVisible ? 'text' : 'password'}
            className={styles.input}
            placeholder="Confirme sua nova senha"
            autoComplete="new-password"
            required
            value={formData.passwordConfirmation}
            onChange={handleConfirmationChange}
            aria-invalid={state.feedbackType === 'error' ? 'true' : undefined}
          />
          <button
            type="button"
            className={styles.togglePasswordButton}
            onClick={() => setIsConfirmationVisible((previous) => !previous)}
            aria-pressed={isConfirmationVisible}
            aria-label={isConfirmationVisible ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
          >
            <FontAwesomeIcon icon={isConfirmationVisible ? faEyeSlash : faEye} aria-hidden="true" />
          </button>
        </div>
        <button type="submit" className={styles.submitButton} disabled={state.isLoading}>
          {state.isLoading ? 'Salvando...' : 'Alterar senha'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default NewPassword
