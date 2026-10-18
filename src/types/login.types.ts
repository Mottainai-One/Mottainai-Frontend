export interface LoginFormState {
    userEmail: string;
    password: string;
  isPasswordVisible: boolean;
  errors: LoginFieldErrors;
}

export interface LoginFieldErrors {
    userEmail?: string;
    password?: string;
}
