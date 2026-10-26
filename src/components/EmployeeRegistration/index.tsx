import DropdownSelect from '@/components/DropdownSelect';
import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { faCheckCircle, faFileArrowUp, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { EmployeeFormErrors, EmployeeRegistrationDraft, EmployeeRegistrationProps, EmployeeRole } from "@/types/employee.types";
import { formatEmployeePhone, sanitizeEmployeeRegistrationDraft, validateEmployeeForm } from "@/utils/employeeFormValidation";
import styles from "./style.module.css";

const roles: EmployeeRole[] = ["Gerente", "Estoquista", "Caixa"];
const acceptedExtensions = [".txt", ".csv", ".tsv", ".prn"];
const emptyForm: EmployeeRegistrationDraft = { name: "", cpf: "", role: "", store: "", phone: "", email: "", status: "Ativo" };

interface EmployeeRegistrationState {
  form: EmployeeRegistrationDraft;
  selectedFile: File | null;
  errors: EmployeeFormErrors;
  fileNotice: string;
  fileNoticeIsError: boolean;
}

const initialState: EmployeeRegistrationState = {
  form: emptyForm,
  selectedFile: null,
  errors: {},
  fileNotice: "",
  fileNoticeIsError: false,
};

function EmployeeRegistration({ onSubmit, onCancel }: EmployeeRegistrationProps) {
  const [state, setState] = useState<EmployeeRegistrationState>(initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof EmployeeRegistrationDraft>(field: K, value: EmployeeRegistrationDraft[K]) => {
    setState((current) => {
      const errors = { ...current.errors };
      delete errors[field];
      return {
        ...current,
        form: { ...current.form, [field]: value },
        errors,
      };
    });
  };

  const acceptFile = (file?: File) => {
    if (!file) return;
    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!acceptedExtensions.includes(extension)) {
      setState((current) => ({
        ...current,
        selectedFile: null,
        fileNotice: "Formato não aceito. Escolha um arquivo .txt, .csv, .tsv ou .prn.",
        fileNoticeIsError: true,
      }));
      return;
    }
    setState((current) => ({
      ...current,
      selectedFile: file,
      fileNotice: `${file.name} selecionado. A importação em lote ainda não está conectada.`,
      fileNoticeIsError: false,
    }));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    acceptFile(event.dataTransfer.files[0]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateEmployeeForm(state.form, { requireContactDetails: true });
    if (Object.keys(errors).length > 0) {
      setState((current) => ({ ...current, errors }));
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }
    const sanitizedForm = sanitizeEmployeeRegistrationDraft(state.form);
    if (sanitizedForm) onSubmit(sanitizedForm);
  };

  const errorFor = (field: keyof EmployeeFormErrors) => state.errors[field];

  return (
    <section className={styles.page} aria-labelledby="registration-title">
      <header className={styles.header}>
        <FontAwesomeIcon className={styles.headerIcon} icon={faUserPlus} aria-hidden="true" />
        <h2 id="registration-title">Cadastrar Funcionário</h2>
      </header>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          <label htmlFor="new-employee-name">Nome<input id="new-employee-name" maxLength={100} autoComplete="name" placeholder="Digite o nome do funcionário" value={state.form.name} onChange={(event) => updateField("name", event.target.value)} aria-invalid={Boolean(errorFor("name"))} aria-describedby={errorFor("name") ? "new-employee-name-error" : undefined} />{errorFor("name") && <span className={styles.fieldError} id="new-employee-name-error" role="alert">{errorFor("name")}</span>}</label>
          <label htmlFor="new-employee-cpf">CPF<input id="new-employee-cpf" maxLength={18} autoComplete="off" inputMode="numeric" placeholder="Digite o CPF do funcionário" value={state.form.cpf} onChange={(event) => updateField("cpf", event.target.value)} aria-invalid={Boolean(errorFor("cpf"))} aria-describedby={errorFor("cpf") ? "new-employee-cpf-error" : undefined} />{errorFor("cpf") && <span className={styles.fieldError} id="new-employee-cpf-error" role="alert">{errorFor("cpf")}</span>}</label>
          <label htmlFor="new-employee-role">Cargo<DropdownSelect id="new-employee-role" value={state.form.role} onChange={(event) => updateField("role", event.target.value as EmployeeRole | "")} ariaInvalid={Boolean(errorFor("role"))} ariaDescribedBy={errorFor("role") ? "new-employee-role-error" : undefined}><option value="">Selecione um cargo</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</DropdownSelect>{errorFor("role") && <span className={styles.fieldError} id="new-employee-role-error" role="alert">{errorFor("role")}</span>}</label>
          <label htmlFor="new-employee-store">Loja<input id="new-employee-store" maxLength={100} autoComplete="organization" placeholder="Digite a loja do funcionário" value={state.form.store} onChange={(event) => updateField("store", event.target.value)} aria-invalid={Boolean(errorFor("store"))} aria-describedby={errorFor("store") ? "new-employee-store-error" : undefined} />{errorFor("store") && <span className={styles.fieldError} id="new-employee-store-error" role="alert">{errorFor("store")}</span>}</label>
          <label htmlFor="new-employee-phone">Telefone<input id="new-employee-phone" maxLength={15} type="tel" inputMode="numeric" autoComplete="tel" placeholder="(11) 91234-5678" value={formatEmployeePhone(state.form.phone)} onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 11))} aria-invalid={Boolean(errorFor("phone"))} aria-describedby={errorFor("phone") ? "new-employee-phone-error" : undefined} />{errorFor("phone") && <span className={styles.fieldError} id="new-employee-phone-error" role="alert">{errorFor("phone")}</span>}</label>
          <label htmlFor="new-employee-email">E-mail<input id="new-employee-email" maxLength={254} type="email" autoComplete="email" placeholder="Digite o e-mail do funcionário" value={state.form.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(errorFor("email"))} aria-describedby={errorFor("email") ? "new-employee-email-error" : undefined} />{errorFor("email") && <span className={styles.fieldError} id="new-employee-email-error" role="alert">{errorFor("email")}</span>}</label>
        </div>

        <div className={styles.uploadColumn}>
          <div className={styles.dropZone} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
            <FontAwesomeIcon className={styles.fileIcon} icon={faFileArrowUp} aria-hidden="true" />
            <p>{state.selectedFile ? state.selectedFile.name : "Arraste o arquivo aqui ou selecione para escolher"}</p>
            <span>Formatos aceitos: .txt, .csv, .tsv, .prn</span>
            <label className={styles.visuallyHidden} htmlFor="employee-import-file">Arquivo de dados dos funcionários</label>
            <input ref={fileInputRef} className={styles.hiddenInput} id="employee-import-file" type="file" accept={acceptedExtensions.join(",")} onChange={(event) => acceptFile(event.target.files?.[0])} aria-describedby="employee-import-notice" />
          </div>
          <button className={styles.fileButton} type="button" onClick={() => fileInputRef.current?.click()}>Selecionar arquivo</button>
          <p className={styles.fileNotice} id="employee-import-notice" role={state.fileNoticeIsError ? "alert" : "status"} aria-live={state.fileNoticeIsError ? "assertive" : "polite"}>{state.fileNotice}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.submitButton} type="submit"><FontAwesomeIcon icon={faCheckCircle} aria-hidden="true" /> Cadastrar funcionário</button>
          <button className={styles.cancelButton} type="button" onClick={onCancel}>Cancelar cadastro</button>
        </div>
      </form>
    </section>
  );
}

export default EmployeeRegistration;
