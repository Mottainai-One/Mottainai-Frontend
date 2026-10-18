import type { LoginCredentials } from "@/types/auth.types";
import { isValidEmailAddress } from "./emailValidation.ts";

export type LoginValidationErrors = Partial<Record<"email" | "password", string>>;

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

export function validateLoginCredentials(credentials: LoginCredentials): LoginValidationErrors {
  const errors: LoginValidationErrors = {};
  const email = credentials.email.trim();

  if (!email) errors.email = "Informe seu e-mail.";
  else if (email.length > MAX_EMAIL_LENGTH) errors.email = `Use até ${MAX_EMAIL_LENGTH} caracteres no e-mail.`;
  else if (!isValidEmailAddress(email)) errors.email = "Informe um e-mail válido.";

  if (!credentials.password) errors.password = "Informe sua senha.";
  else if (credentials.password.length > MAX_PASSWORD_LENGTH) errors.password = `Use até ${MAX_PASSWORD_LENGTH} caracteres na senha.`;
  return errors;
}

export function sanitizeLoginCredentials(credentials: LoginCredentials): LoginCredentials {
  return { email: credentials.email.trim().slice(0, MAX_EMAIL_LENGTH), password: credentials.password };
}
