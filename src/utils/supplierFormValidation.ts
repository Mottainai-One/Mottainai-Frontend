import type { SupplierFormState } from '@/types/supplier.types';
import { isValidEmailAddress } from './emailValidation.ts';

export type SupplierFormErrors = Partial<Record<keyof SupplierFormState, string>>;

export function validateSupplierForm(form: SupplierFormState): SupplierFormErrors {
  const errors: SupplierFormErrors = {};
  const cnpjDigits = form.cnpj.replace(/\D/g, '');
  const email = form.email.trim();
  const phoneDigits = form.phone.replace(/\D/g, '');

  if (!form.tradeName.trim()) errors.tradeName = 'Informe o nome do fornecedor.';
  else if (form.tradeName.trim().length > 100) errors.tradeName = 'Use até 100 caracteres.';

  if (!form.addressId) errors.addressId = 'Selecione o endereço vinculado.';
  if (cnpjDigits.length !== 14) errors.cnpj = 'Informe um CNPJ com 14 dígitos.';
  if (email && !isValidEmailAddress(email)) errors.email = 'Informe um e-mail válido.';
  else if (email.length > 254) errors.email = 'Use até 254 caracteres.';
  if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 13)) {
    errors.phone = 'Informe um telefone com DDD e até 13 dígitos.';
  }

  return errors;
}

export function sanitizeSupplierForm(form: SupplierFormState): SupplierFormState {
  return {
    addressId: form.addressId,
    tradeName: form.tradeName.trim().slice(0, 100),
    cnpj: form.cnpj.replace(/\D/g, '').slice(0, 14),
    email: form.email.trim().slice(0, 254),
    phone: form.phone.trim().slice(0, 20),
    active: form.active,
  };
}
