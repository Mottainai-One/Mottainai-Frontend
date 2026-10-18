import type { ManagementReportFilterErrors, ManagementReportFilters } from "@/types/management-report.types";

export function validateManagementReportFilters(
  filters: ManagementReportFilters,
  requireSelections = true,
): ManagementReportFilterErrors {
  const errors: ManagementReportFilterErrors = {};
  if (requireSelections && !filters.date) errors.date = "Selecione o período.";
  if (requireSelections && !filters.store) errors.store = "Selecione a loja.";
  if (requireSelections && !filters.category) errors.category = "Selecione a categoria.";
  if (filters.date.length > 20) errors.date = "O período informado é inválido.";
  if (filters.store.length > 100) errors.store = "A loja informada é inválida.";
  if (filters.category.length > 80) errors.category = "A categoria informada é inválida.";
  return errors;
}

export function sanitizeManagementReportFilters(filters: ManagementReportFilters): ManagementReportFilters {
  return {
    date: filters.date.trim().slice(0, 20),
    store: filters.store.trim().slice(0, 100),
    category: filters.category.trim().slice(0, 80),
  };
}
