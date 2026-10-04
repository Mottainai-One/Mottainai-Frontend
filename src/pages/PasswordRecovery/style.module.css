import { useId, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';
import styles from '@/components/AuthLayout/style.module.css';
import lontraPensando from '@/assets/imgs/lontra-pensando.png';

import type {
  PasswordRecoveryState,
  RecoveryLocationState,
} from '@/types/password-recovery.types';

import {
  sendRecoveryCode,
  verifyRecoveryCode,
} from '@/services/passwordRecoveryService';

import {
  validateRecoveryCode,
  validateRecoveryEmail,
} from '@/utils/passwordRecoveryValidation';

function PasswordRecovery() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFieldId = useId();
  const codeFieldId = useId();
  const feedbackId = useId();
  const locationState = location.state as RecoveryLocationState | null;

  const [state, setState] = useState<PasswordRecoveryState>({
    step: 'email',
    email: locationState?.userEmail ?? '',
    code: '',
    isLoading: false,
    feedback: null,
    feedbackType: null,
  });

  function updateState(changes: Partial<PasswordRecoveryState>) {
    setState((previous) => ({ ...previous, ...changes }));
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    updateState({ email: event.target.value, feedback: null, feedbackType: null });
  }

  function handleCodeChange(event: ChangeEvent<HTMLInputElement>) {
    const code = event.target.value.replace(/\D/g, '').slice(0, 6);
    updateState({ code, feedback: null, feedbackType: null });
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateRecoveryEmail(state.email);
    if (validationError) {
      updateState({ feedback: validationError, feedbackType: 'error' });
      return;
    }

    updateState({ isLoading: true, feedback: null, feedbackType: null });
    try {
      const response = await sendRecoveryCode(state.email.trim());
      updateState({
        step: 'code',
        isLoading: false,
        feedback: response.message,
        feedbackType: 'success',
      });
    } catch (error) {
      updateState({
        isLoading: false,
        feedback: error instanceof Error ? error.message : 'Não foi possível enviar o código.',
        feedbackType: 'error',
      });
    }
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateRecoveryCode(state.code);
    if (validationError) {
      updateState({ feedback: validationError, feedbackType: 'error' });
      return;
    }

    updateState({ isLoading: true, feedback: null, feedbackType: null });
    try {
      const response = await verifyRecoveryCode(state.email.trim(), state.code);
      navigate(`/newPassword?token=${encodeURIComponent(response.resetToken)}`, {
        replace: true,
        state: { userEmail: state.email.trim() },
      });
    } catch (error) {
      updateState({
        isLoading: false,
        feedback: error instanceof Error ? error.message : 'Não foi possível verificar o código.',
        feedbackType: 'error',
      });
    }
  }

  function handleBackToEmail() {
    updateState({ step: 'email', code: '', feedback: null, feedbackType: null });
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

  if (state.step === 'email') {
    return (
      <AuthLayout
        title="Recupere sua senha"
        description="Informe seu e-mail e enviaremos um código para você criar uma nova senha."
        mascotSrc={lontraPensando}
        mascotAlt="Lontra mascote pensando durante a recuperação da senha"
      >
        <form
          className={styles.form}
          onSubmit={handleEmailSubmit}
          noValidate
          aria-describedby={state.feedback ? feedbackId : undefined}
        >
          {feedback}
          {state.isLoading && (
            <p className={styles.codeHint} role="status" aria-live="polite">Enviando código...</p>
          )}
          <label htmlFor={emailFieldId} className={styles.visuallyHidden}>E-mail</label>
          <input
            id={emailFieldId}
            name="email"
            type="email"
            className={styles.input}
            placeholder="Digite seu e-mail"
            autoComplete="email"
            required
            value={state.email}
            onChange={handleEmailChange}
            aria-invalid={state.feedbackType === 'error' ? 'true' : undefined}
          />
          <button type="submit" className={styles.submitButton} disabled={state.isLoading}>
            {state.isLoading ? 'Enviando código...' : 'Enviar código'}
          </button>
          <button type="button" className={styles.backButton} onClick={handleBackToLogin}>
            Voltar para o login
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verifique seu e-mail"
      description="Digite o código que enviamos para confirmar sua identidade."
      mascotSrc={lontraPensando}
      mascotAlt="Lontra mascote pensando durante a recuperação da senha"
    >
      <form
        className={styles.form}
        onSubmit={handleCodeSubmit}
        noValidate
        aria-describedby={state.feedback ? feedbackId : undefined}
      >
        {feedback}
        {state.isLoading && (
          <p className={styles.codeHint} role="status" aria-live="polite">Verificando código...</p>
        )}
        <label htmlFor={codeFieldId} className={styles.visuallyHidden}>Código de recuperação</label>
        <input
          id={codeFieldId}
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          className={styles.input}
          placeholder="Código de 6 dígitos"
          maxLength={6}
          required
          value={state.code}
          onChange={handleCodeChange}
          aria-invalid={state.feedbackType === 'error' ? 'true' : undefined}
        />
        <p className={styles.codeHint}>Para testar o fluxo, use o código 123456.</p>
        <button type="submit" className={styles.submitButton} disabled={state.isLoading}>
          {state.isLoading ? 'Verificando...' : 'Verificar código'}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={handleBackToEmail}>
          Usar outro e-mail
        </button>
      </form>
    </AuthLayout>
  );
}

export default PasswordRecovery
