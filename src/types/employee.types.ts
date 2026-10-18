export type EmployeeRole = "Gerente" | "Estoquista" | "Caixa";
export type EmployeeStatus = "Ativo" | "Inativo";

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  role: EmployeeRole;
  store: string;
  phone: string;
  email: string;
  status: EmployeeStatus;
  lastAccess: string;
}

export interface EmployeeFormState {
  name: string;
  cpf: string;
  role: EmployeeRole;
  store: string;
  phone: string;
  email: string;
  status: EmployeeStatus;
}

export type EmployeeRegistrationDraft = Omit<EmployeeFormState, "role"> & {
  role: EmployeeRole | "";
};

export type EmployeeFormErrors = Partial<Record<keyof EmployeeFormState, string>>;

export interface EmployeeRegistrationProps {
  onSubmit: (employee: EmployeeFormState) => void;
  onCancel: () => void;
}

export interface AuditEvent {
  id: string;
  dateTime: string;
  user: string;
  action: string;
  module: string;
  ip: string;
}
