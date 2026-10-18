import type {
  EmployeeFormErrors,
  EmployeeFormState,
  EmployeeRegistrationDraft,
} from "@/types/employee.types";
import { isValidEmailAddress } from "./emailValidation.ts";

export interface EmployeeValidationOptions {
  requireContactDetails?: boolean;
}

export function formatEmployeePhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  const prefixLength = number.startsWith("9") ? 5 : 4;
  if (number.length <= prefixLength) return `(${areaCode}) ${number}`;

  return `(${areaCode}) ${number.slice(0, prefixLength)}-${number.slice(prefixLength)}`;
}

export function validateEmployeeForm(
  form: EmployeeFormState | EmployeeRegistrationDraft,
  options: EmployeeValidationOptions = {},
): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {};
  const cpfDigits = form.cpf.replace(/\D/g, "");
  const email = form.email.trim();
  const requireContactDetails = options.requireContactDetails ?? false;

  if (!form.name.trim()) errors.name = "Informe o nome do funcionário.";
  else if (form.name.trim().length > 100) errors.name = "Use até 100 caracteres.";

  if (cpfDigits.length !== 11) errors.cpf = "Informe um CPF com 11 dígitos.";
  if (!form.role) errors.role = "Selecione um cargo.";
  if (!form.store.trim()) errors.store = "Informe a loja.";
  else if (form.store.trim().length > 100) errors.store = "Use até 100 caracteres.";

  if (requireContactDetails && !form.phone.trim()) {
    errors.phone = "Informe o telefone.";
  } else if (form.phone.trim().length > 20) {
    errors.phone = "Use até 20 caracteres.";
  }

  if (requireContactDetails && !email) {
    errors.email = "Informe o e-mail.";
  } else if (email && !isValidEmailAddress(email)) {
    errors.email = "Informe um e-mail válido.";
  } else if (email.length > 254) {
    errors.email = "Use até 254 caracteres.";
  }

  return errors;
}

export function sanitizeEmployeeForm(
  form: EmployeeFormState,
): EmployeeFormState {
  return {
    ...form,
    name: form.name.trim().slice(0, 100),
    cpf: form.cpf.replace(/\D/g, "").slice(0, 11),
    store: form.store.trim().slice(0, 100),
    phone: form.phone.replace(/\D/g, "").slice(0, 11),
    email: form.email.trim().slice(0, 254),
  };
}

export function sanitizeEmployeeRegistrationDraft(
  form: EmployeeRegistrationDraft,
): EmployeeFormState | null {
  if (!form.role) return null;
  return sanitizeEmployeeForm({ ...form, role: form.role });
}
