export type RecoveryStep = 'email' | 'code';
export type RecoveryFeedbackType = 'success' | 'error';

export interface PasswordRecoveryState {
  step: RecoveryStep;
  email: string;
  code: string;
  isLoading: boolean;
  feedback: string | null;
  feedbackType: RecoveryFeedbackType | null;
}

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

export interface NewPasswordState {
  isLoading: boolean;
  feedback: string | null;
  feedbackType: RecoveryFeedbackType | null;
}
