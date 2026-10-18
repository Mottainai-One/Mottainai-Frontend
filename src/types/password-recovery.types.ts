export type RecoveryStep = 'email' | 'code';
export type RecoveryFeedbackType = 'success' | 'error';

export interface PasswordRecoveryState {
  step: RecoveryStep;
  email: string;
  code: string;
  isLoading: boolean;
  feedback: string | null;
  feedbackType: RecoveryFeedbackType | null;
  fieldErrors: PasswordRecoveryFieldErrors;
}

export type PasswordRecoveryFieldErrors = Partial<Record<'email' | 'code', string>>;

export interface SendRecoveryCodeResponse {
  message: string;
}

export interface VerifyRecoveryCodeResponse {
  resetToken: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface RecoveryLocationState {
  userEmail?: string;
}

export interface NewPasswordFormState {
  password: string;
  passwordConfirmation: string;
}

export interface PasswordVisibilityState {
  password: boolean;
  confirmation: boolean;
}

export type NewPasswordValidationErrors = Partial<Record<'password' | 'passwordConfirmation', string>>;

export interface NewPasswordState {
  form: NewPasswordFormState;
  visibility: PasswordVisibilityState;
  isLoading: boolean;
  feedback: string | null;
  feedbackType: RecoveryFeedbackType | null;
  validationErrors: NewPasswordValidationErrors;
}
