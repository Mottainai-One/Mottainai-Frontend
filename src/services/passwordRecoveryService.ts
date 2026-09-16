import type {
  ResetPasswordResponse,
  SendRecoveryCodeResponse,
  VerifyRecoveryCodeResponse,
} from '@/types/password-recovery.types';

const MOCK_CODE = '123456';
const MOCK_DELAY_MS = 700;
let activeResetToken: string | null = null;

function waitForMockApi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, MOCK_DELAY_MS);
  });
}

export async function sendRecoveryCode(email: string): Promise<SendRecoveryCodeResponse> {
  try {
    await waitForMockApi();
    return { message: `Enviamos um código de 6 dígitos para ${email}.` };
  } catch {
    throw new Error('Não foi possível enviar o código. Tente novamente.');
  }
}

export async function verifyRecoveryCode(
  _email: string,
  code: string,
): Promise<VerifyRecoveryCodeResponse> {
  try {
    await waitForMockApi();

    if (code !== MOCK_CODE) {
      throw new Error('O código informado está incorreto ou expirou.');
    }

    activeResetToken = btoa(crypto.randomUUID());
    return { resetToken: activeResetToken };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw error;
  }
}

export async function resetPassword(
  resetToken: string,
  password: string,
): Promise<ResetPasswordResponse> {
  try {
    await waitForMockApi();

    if (!activeResetToken || resetToken !== activeResetToken) {
      throw new Error('Sua sessão de recuperação expirou. Solicite um novo código.');
    }

    if (!password) {
      throw new Error('A nova senha não foi informada.');
    }

    activeResetToken = null;
    return { message: 'Senha alterada com sucesso. Você já pode acessar sua conta.' };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw error;
  }
}
