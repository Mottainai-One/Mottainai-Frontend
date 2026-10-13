import type { TransferFormState } from '@/types/stock-transfer.types';

export type TransferFormErrors = Partial<Record<keyof TransferFormState, string>>;

export function validateTransferForm(form: TransferFormState): TransferFormErrors {
  const errors: TransferFormErrors = {};
  if (!form.employeeId) errors.employeeId = 'Selecione o responsável.';
  if (!form.sourceStoreId) errors.sourceStoreId = 'Selecione a loja de origem.';
  if (!form.destinationStoreId) errors.destinationStoreId = 'Selecione a loja de destino.';
  else if (form.sourceStoreId === form.destinationStoreId) {
    errors.destinationStoreId = 'Escolha uma loja diferente da origem.';
  }
  if (!form.requestDate) errors.requestDate = 'Informe a data da solicitação.';
  if (form.completionDate && form.requestDate && form.completionDate < form.requestDate) {
    errors.completionDate = 'A conclusão não pode ocorrer antes da solicitação.';
  }
  if (form.observation.trim().length > 500) errors.observation = 'Use até 500 caracteres.';
  return errors;
}

export function sanitizeTransferForm(form: TransferFormState): TransferFormState {
  return {
    ...form,
    suggestedActionId: form.suggestedActionId.trim(),
    observation: form.observation.trim().slice(0, 500),
  };
}
