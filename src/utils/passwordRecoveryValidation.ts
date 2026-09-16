export function validateRecoveryEmail(email: string): string | null {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) {
    return 'Informe seu e-mail.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return 'Digite um e-mail válido.';
  }

  return null;
}

export function validateRecoveryCode(code: string): string | null {
  if (!/^\d{6}$/.test(code)) {
    return 'Digite o código de 6 dígitos recebido por e-mail.';
  }

  return null;
}

export function validateNewPassword(password: string, confirmation: string): string | null {
  if (password.length < 8) {
    return 'A senha precisa ter pelo menos 8 caracteres.';
  }

  if (password !== confirmation) {
    return 'As senhas não coincidem.';
  }

  return null;
}
