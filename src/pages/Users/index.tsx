import { useEffect, useRef, useState, type FormEvent } from "react";
import { faPlus, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import ReusableTable from "@/components/ReusableTable";
import EmployeeRegistration from "@/components/EmployeeRegistration";
import type { ReusableTableColumn, TableCellTone } from "@/types/reusable-table.types";
import type {
  AuditEvent,
  Employee,
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
  formError: string;
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
    formError: "",
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
      formError: "",
    }));
  };

  const closeDialog = () => setState((current) => ({ ...current, dialog: null, form: blankForm, formError: "" }));

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
      if (event.key === "Escape") setState((current) => ({ ...current, dialog: null, form: blankForm, formError: "" }));
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
    dialog?.addEventListener("keydown", handleKeyDown);
    return () => dialog?.removeEventListener("keydown", handleKeyDown);
  }, [state.dialog]);

  const saveEmployee = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = state.form;
    if (!form.name.trim() || !form.cpf.trim() || !form.store.trim()) {
      setState((current) => ({ ...current, formError: "Preencha nome, CPF e loja para continuar." }));
      return;
    }
    if (form.cpf.replace(/\D/g, "").length !== 11) {
      setState((current) => ({ ...current, formError: "Informe um CPF com 11 dígitos." }));
      return;
    }
    const editingId = state.dialog?.type === "employee" ? state.dialog.editingId : null;
    const existingEmployee = editingId ? state.employees.find((employee) => employee.id === editingId) : undefined;
    const employee: Employee = {
      ...form,
      name: form.name.trim(),
      cpf: form.cpf.trim(),
      store: form.store.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
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
      formError: "",
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
          <label className={styles.searchBox}>
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
            <span className={styles.visuallyHidden}>Buscar por nome ou CPF</span>
            <input value={state.search} onChange={(event) => setState((current) => ({ ...current, search: event.target.value }))} placeholder="Buscar por nome ou CPF..." />
          </label>
          <label className={styles.filterLabel}><span className={styles.visuallyHidden}>Filtrar por cargo</span><select value={state.roleFilter} onChange={(event) => setState((current) => ({ ...current, roleFilter: event.target.value }))}><option value="">Todos os cargos</option>{employeeRoles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
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
            <label htmlFor="employee-name">Nome completo<input id="employee-name" ref={nameInputRef} value={state.form.name} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, name: event.target.value } }))} autoComplete="name" /></label>
            <label htmlFor="employee-cpf">CPF<input id="employee-cpf" value={state.form.cpf} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, cpf: event.target.value } }))} inputMode="numeric" autoComplete="off" /></label>
            <label htmlFor="employee-phone">Telefone<input id="employee-phone" type="tel" value={state.form.phone} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, phone: event.target.value } }))} autoComplete="tel" /></label>
            <label htmlFor="employee-email">E-mail<input id="employee-email" type="email" value={state.form.email} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, email: event.target.value } }))} autoComplete="email" /></label>
            <div className={styles.formRow}>
              <label htmlFor="employee-role">Cargo<select id="employee-role" value={state.form.role} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, role: event.target.value as EmployeeRole } }))}>{employeeRoles.map((role) => <option key={role}>{role}</option>)}</select></label>
              <label htmlFor="employee-status">Status<select id="employee-status" value={state.form.status} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, status: event.target.value as "Ativo" | "Inativo" } }))}><option>Ativo</option><option>Inativo</option></select></label>
            </div>
            <label htmlFor="employee-store">Loja<input id="employee-store" value={state.form.store} onChange={(event) => setState((current) => ({ ...current, form: { ...current.form, store: event.target.value } }))} /></label>
            {state.formError && <p className={styles.formError} role="alert">{state.formError}</p>}
            <div className={styles.formActions}><button type="button" className={styles.cancelButton} onClick={closeDialog}>Cancelar</button><button type="submit" className={styles.addButton}>Salvar funcionário</button></div>
          </form> : null}
        </section>
      </div>}
    </section>
  );
}

export default Users;
