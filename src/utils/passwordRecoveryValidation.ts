import type { NewPasswordValidationErrors } from '@/types/password-recovery.types';
import { isValidEmailAddress } from './emailValidation.ts';

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

export function validateRecoveryEmail(email: string): string | null {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) {
    return 'Informe seu e-mail.';
  }

  if (!isValidEmailAddress(normalizedEmail)) {
    return 'Digite um e-mail válido.';
  }
  if (normalizedEmail.length > MAX_EMAIL_LENGTH) {
    return `Use até ${MAX_EMAIL_LENGTH} caracteres no e-mail.`;
  }

  return null;
}

export function sanitizeRecoveryEmail(email: string): string {
  return email.trim().slice(0, MAX_EMAIL_LENGTH);
}

export function validateRecoveryCode(code: string): string | null {
  if (!/^\d{6}$/.test(code)) {
    return 'Digite o código de 6 dígitos recebido por e-mail.';
  }

  return null;
}

export function sanitizeRecoveryCode(code: string): string {
  return code.replace(/\D/g, '').slice(0, 6);
}

export function validateNewPassword(password: string, confirmation: string): NewPasswordValidationErrors {
  const errors: NewPasswordValidationErrors = {};
  if (!password) errors.password = 'Informe uma senha.';
  else if (password.length < 8) errors.password = 'A senha precisa ter pelo menos 8 caracteres.';
  else if (password.length > MAX_PASSWORD_LENGTH) errors.password = `Use até ${MAX_PASSWORD_LENGTH} caracteres.`;

  if (!confirmation) errors.passwordConfirmation = 'Confirme sua nova senha.';
  else if (password !== confirmation) errors.passwordConfirmation = 'As senhas não coincidem.';
  else if (confirmation.length > MAX_PASSWORD_LENGTH) errors.passwordConfirmation = `Use até ${MAX_PASSWORD_LENGTH} caracteres.`;

  return errors;
}

export function sanitizeNewPassword(password: string): string {
  return password.slice(0, MAX_PASSWORD_LENGTH);
}
