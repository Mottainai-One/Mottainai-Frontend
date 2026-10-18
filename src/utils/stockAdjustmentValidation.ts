import type { StockAdjustmentFormState } from "@/types/stock-adjustment.types";

export type StockAdjustmentErrors = Partial<Record<keyof StockAdjustmentFormState, string>>;

export function validateStockAdjustmentForm(form: StockAdjustmentFormState): StockAdjustmentErrors {
  const errors: StockAdjustmentErrors = {};
  const quantity = Number(form.quantity);

  if (!form.product.trim()) errors.product = "Informe o produto.";
  else if (form.product.trim().length > 120) errors.product = "Use até 120 caracteres.";
  if (!form.quantity.trim() || !Number.isFinite(quantity) || quantity < 1) {
    errors.quantity = "Informe uma quantidade numérica maior que zero.";
  }
  if (!form.responsible.trim()) errors.responsible = "Informe a pessoa responsável.";
  else if (form.responsible.trim().length > 100) errors.responsible = "Use até 100 caracteres.";
  if (form.observation.length > 500) errors.observation = "Use até 500 caracteres.";

  return errors;
}

export function sanitizeStockAdjustmentForm(form: StockAdjustmentFormState): StockAdjustmentFormState {
  return {
    ...form,
    product: form.product.trim().slice(0, 120),
    quantity: form.quantity.trim(),
    responsible: form.responsible.trim().slice(0, 100),
    observation: form.observation.trim().slice(0, 500),
  };
}
