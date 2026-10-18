import DropdownSelect from '@/components/DropdownSelect';
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { faPlus, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import ReusableTable from "@/components/ReusableTable";
import EmployeeRegistration from "@/components/EmployeeRegistration";
import type { ReusableTableColumn, TableCellTone } from "@/types/reusable-table.types";
import { sanitizeEmployeeForm, validateEmployeeForm } from "@/utils/employeeFormValidation";
import type {
  AuditEvent,
  Employee,
  EmployeeFormErrors,
  EmployeeFormState,
  EmployeeRole,
} from "@/types/employee.types";
import styles from "./style.module.css";

type DialogState =
  | { type: "employee"; editingId: string | null }
  | null;
type State = {
  employees: Employee[];
  auditEvents: AuditEvent[];
  search: string;
  roleFilter: string;
  dialog: DialogState;
  form: EmployeeFormState;
  formErrors: EmployeeFormErrors;
  notice: string;
};

const blankForm: EmployeeFormState = { name: "", cpf: "", role: "Estoquista", store: "", phone: "", email: "", status: "Ativo" };
const employeeRoles: EmployeeRole[] = ["Gerente", "Estoquista", "Caixa"];
const roleTones: Record<EmployeeRole, TableCellTone> = { Gerente: "info", Estoquista: "success", Caixa: "danger" };
const statusTones: Record<Employee["status"], TableCellTone> = { Ativo: "success", Inativo: "warning" };

function createAuditEvent(action: string, module: string): AuditEvent {
  return {
    id: crypto.randomUUID(),
    dateTime: new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date()),
    user: "Sessão atual",
    action,
    module,
    ip: "Não coletado",
  };
}

function Users() {
  const employeeSearchId = useId();
  const employeeRoleFilterId = useId();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const validUserPaths = ["/users", "/users/new", "/users/audit"];
  const section = pathname.endsWith("/new") ? "new" : pathname.endsWith("/audit") ? "audit" : "employees";
  const [state, setState] = useState<State>({
    employees: [],
    auditEvents: [],
    search: "",
    roleFilter: "",
    dialog: null,
    form: blankForm,
    formErrors: {},
    notice: "",
  });
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const wasDialogOpenRef = useRef(false);

  const filteredEmployees = state.employees.filter((employee) => {
    const query = state.search.trim().toLocaleLowerCase("pt-BR");
    return (!query || employee.name.toLocaleLowerCase("pt-BR").includes(query) || employee.cpf.includes(query)) &&
      (!state.roleFilter || employee.role === state.roleFilter);
  });

  const openEmployeeDialog = (employee?: Employee) => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setState((current) => ({
      ...current,
      dialog: { type: "employee", editingId: employee?.id ?? null },
      form: employee
        ? { name: employee.name, cpf: employee.cpf, role: employee.role, store: employee.store, phone: employee.phone, email: employee.email, status: employee.status }
        : blankForm,
      formErrors: {},
    }));
  };

  const closeDialog = () => setState((current) => ({ ...current, dialog: null, form: blankForm, formErrors: {} }));

  useEffect(() => {
    if (!state.dialog) {
      if (wasDialogOpenRef.current) returnFocusRef.current?.focus();
      wasDialogOpenRef.current = false;
      return;
    }
    wasDialogOpenRef.current = true;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled])');
    nameInputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
      }
      if (event.key === "Tab" && focusable?.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (!dialog?.contains(event.target as Node)) {
        (focusable?.[0] ?? nameInputRef.current)?.focus();
      }
    };
    dialog?.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      dialog?.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [state.dialog]);

  const saveEmployee = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateEmployeeForm(state.form);
    if (Object.keys(errors).length > 0) {
      setState((current) => ({ ...current, formErrors: errors }));
      window.requestAnimationFrame(() => {
        dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }
    const form = sanitizeEmployeeForm(state.form);
    const editingId = state.dialog?.type === "employee" ? state.dialog.editingId : null;
    const existingEmployee = editingId ? state.employees.find((employee) => employee.id === editingId) : undefined;
    const employee: Employee = {
      ...form,
      id: editingId ?? crypto.randomUUID(),
      lastAccess: existingEmployee?.lastAccess ?? "Ainda não acessou",
    };
    const action = editingId ? `Atualizou o cadastro de ${employee.name}` : `Cadastrou funcionário ${employee.name}`;
    const auditEvent = createAuditEvent(action, "Usuários");
    setState((current) => ({
      ...current,
      employees: editingId
        ? current.employees.map((item) => item.id === employee.id ? employee : item)
        : [...current.employees, employee],
      auditEvents: [auditEvent, ...current.auditEvents],
      dialog: null,
      form: blankForm,
      formErrors: {},
      notice: editingId ? "Funcionário atualizado nesta sessão." : "Funcionário adicionado nesta sessão.",
    }));
  };

  const createEmployee = (form: EmployeeFormState) => {
    const employee: Employee = {
      ...form,
      id: crypto.randomUUID(),
      store: form.store.trim() || "—",
      lastAccess: "Ainda não acessou",
    };
    const auditEvent = createAuditEvent(`Cadastrou funcionário ${employee.name}`, "Usuários");
    setState((current) => ({
      ...current,
      employees: [...current.employees, employee],
      auditEvents: [auditEvent, ...current.auditEvents],
      notice: "Funcionário cadastrado nesta sessão.",
    }));
    navigate("/users");
  };

  const employeeColumns: ReusableTableColumn<Employee>[] = [
    { id: "name", header: "Nome", renderCell: (employee) => employee.name },
    { id: "cpf", header: "CPF", renderCell: (employee) => employee.cpf },
    { id: "role", header: "Cargo", renderCell: (employee) => employee.role, display: "badge", tone: (employee) => roleTones[employee.role], align: "center" },
    { id: "store", header: "Loja", renderCell: (employee) => employee.store },
    { id: "status", header: "Status", renderCell: (employee) => employee.status, display: "badge", tone: (employee) => statusTones[employee.status], align: "center" },
    { id: "access", header: "Último acesso", renderCell: (employee) => employee.lastAccess },
    { id: "edit", header: "Ações", renderCell: () => "", display: "action", actionText: () => "Editar funcionário", actionLabel: (employee) => `Editar funcionário ${employee.name}`, actionHasPopup: true, onAction: (employee) => openEmployeeDialog(employee), align: "center" },
  ];

  const auditColumns: ReusableTableColumn<AuditEvent>[] = [
    { id: "dateTime", header: "Data e hora", renderCell: (event) => event.dateTime },
    { id: "user", header: "Usuário", renderCell: (event) => event.user },
    { id: "action", header: "Ação", renderCell: (event) => event.action },
    { id: "module", header: "Módulo", renderCell: (event) => event.module },
    { id: "ip", header: "IP", renderCell: (event) => event.ip },
  ];
  if (!validUserPaths.includes(pathname)) return <Navigate to="/users" replace />;

  return (
    <section className={styles.page} aria-labelledby="users-title">
      <h1 className={styles.visuallyHidden} id="users-title">Administração de usuários</h1>

      {section === "new" && <EmployeeRegistration onSubmit={createEmployee} onCancel={() => navigate("/users")} />}

      {section === "employees" && <>
        <div className={styles.toolbar}>
          <label className={styles.searchBox} htmlFor={employeeSearchId}>
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
            <span className={styles.visuallyHidden}>Buscar por nome ou CPF</span>
            <input id={employeeSearchId} value={state.search} onChange={(event) => setState((current) => ({ ...current, search: event.target.value }))} placeholder="Buscar por nome ou CPF..." />
          </label>
          <label className={styles.filterLabel} htmlFor={employeeRoleFilterId}><span className={styles.visuallyHidden}>Filtrar por cargo</span><DropdownSelect id={employeeRoleFilterId} value={state.roleFilter} onChange={(event) => setState((current) => ({ ...current, roleFilter: event.target.value }))}><option value="">Todos os cargos</option>{employeeRoles.map((role) => <option key={role} value={role}>{role}</option>)}</DropdownSelect></label>
          <button type="button" className={styles.addButton} onClick={() => navigate("/users/new")}><FontAwesomeIcon icon={faPlus} aria-hidden="true" /> Novo Funcionário</button>
        </div>
        <p className={styles.sessionNote}>Funcionários, permissões e auditoria ficam somente nesta sessão do navegador.</p>
        <ReusableTable title="Funcionários" columns={employeeColumns} data={filteredEmployees} rowKey={(employee) => employee.id} emptyMessage={state.employees.length ? "Nenhum funcionário corresponde à busca ou ao cargo selecionado." : "Nenhum funcionário cadastrado. Use “Novo Funcionário” para adicionar o primeiro registro."} />
      </>}

      {section === "audit" && <ReusableTable
        title="Log de auditoria"
        columns={auditColumns}
        data={state.auditEvents}
        rowKey={(event) => event.id}
        emptyMessage="Nenhuma ação registrada nesta sessão. As alterações feitas nesta tela aparecerão aqui."
      />}
      <p className={styles.visuallyHidden} role="status" aria-live="polite">{state.notice}</p>

      {state.dialog && <div className={styles.modalBackdrop}>
        <section ref={dialogRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <div className={styles.modalHeading}>
            <h2 id="dialog-title">{state.dialog.type === "employee" ? (state.dialog.editingId ? "Editar funcionário" : "Novo funcionário") : "Editar permissão"}</h2>
            <button type="button" className={styles.closeButton} aria-label="Fechar formulário" onClick={closeDialog}><FontAwesomeIcon icon={faXmark} aria-hidden="true" /></button>
          </div>
          {state.dialog.type === "employee" ? <form onSubmit={saveEmployee} noValidate>
            <label htmlFor="employee-name">Nome completo<input id="employee-name" maxLength={100} ref={nameInputRef} value={state.form.name} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, name: event.target.value }, formErrors: { ...current.formErrors, name: undefined } }))} autoComplete="name" aria-invalid={Boolean(state.formErrors.name)} aria-describedby={state.formErrors.name ? "employee-name-error" : undefined} />{state.formErrors.name && <span className={styles.formError} id="employee-name-error" role="alert">{state.formErrors.name}</span>}</label>
            <label htmlFor="employee-cpf">CPF<input id="employee-cpf" maxLength={18} value={state.form.cpf} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, cpf: event.target.value }, formErrors: { ...current.formErrors, cpf: undefined } }))} inputMode="numeric" autoComplete="off" aria-invalid={Boolean(state.formErrors.cpf)} aria-describedby={state.formErrors.cpf ? "employee-cpf-error" : undefined} />{state.formErrors.cpf && <span className={styles.formError} id="employee-cpf-error" role="alert">{state.formErrors.cpf}</span>}</label>
            <label htmlFor="employee-phone">Telefone<input id="employee-phone" maxLength={20} type="tel" value={state.form.phone} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, phone: event.target.value }, formErrors: { ...current.formErrors, phone: undefined } }))} autoComplete="tel" aria-invalid={Boolean(state.formErrors.phone)} aria-describedby={state.formErrors.phone ? "employee-phone-error" : undefined} />{state.formErrors.phone && <span className={styles.formError} id="employee-phone-error" role="alert">{state.formErrors.phone}</span>}</label>
            <label htmlFor="employee-email">E-mail<input id="employee-email" maxLength={254} type="email" value={state.form.email} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, email: event.target.value }, formErrors: { ...current.formErrors, email: undefined } }))} autoComplete="email" aria-invalid={Boolean(state.formErrors.email)} aria-describedby={state.formErrors.email ? "employee-email-error" : undefined} />{state.formErrors.email && <span className={styles.formError} id="employee-email-error" role="alert">{state.formErrors.email}</span>}</label>
            <div className={styles.formRow}>
              <label htmlFor="employee-role">Cargo<DropdownSelect id="employee-role" value={state.form.role} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, role: event.target.value as EmployeeRole }, formErrors: { ...current.formErrors, role: undefined } }))} ariaInvalid={Boolean(state.formErrors.role)} ariaDescribedBy={state.formErrors.role ? "employee-role-error" : undefined}>{employeeRoles.map((role) => <option key={role}>{role}</option>)}</DropdownSelect>{state.formErrors.role && <span className={styles.formError} id="employee-role-error" role="alert">{state.formErrors.role}</span>}</label>
              <label htmlFor="employee-status">Status<DropdownSelect id="employee-status" value={state.form.status} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, status: event.target.value as "Ativo" | "Inativo" } }))}><option>Ativo</option><option>Inativo</option></DropdownSelect></label>
            </div>
            <label htmlFor="employee-store">Loja<input id="employee-store" maxLength={100} value={state.form.store} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, store: event.target.value }, formErrors: { ...current.formErrors, store: undefined } }))} aria-invalid={Boolean(state.formErrors.store)} aria-describedby={state.formErrors.store ? "employee-store-error" : undefined} />{state.formErrors.store && <span className={styles.formError} id="employee-store-error" role="alert">{state.formErrors.store}</span>}</label>
            <div className={styles.formActions}><button type="button" className={styles.cancelButton} onClick={closeDialog}>Cancelar</button><button type="submit" className={styles.addButton}>Salvar funcionário</button></div>
          </form> : null}
        </section>
      </div>}
    </section>
  );
}

export default Users;
