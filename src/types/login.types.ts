export interface LoginFormState {
    userEmail: string;
    password: string;
    apiPassword: string;
    hasSeparatePassword: boolean;
  isPasswordVisible: boolean;
  isApiPasswordVisible: boolean;
  errors: LoginFieldErrors;
}

export interface LoginFieldErrors {
    userEmail?: string;
    password?: string;
    apiPassword?: string;
}
