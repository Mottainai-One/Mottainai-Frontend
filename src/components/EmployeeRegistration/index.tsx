import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { faCheckCircle, faFileArrowUp, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { EmployeeFormState, EmployeeRegistrationProps, EmployeeRole } from "@/types/employee.types";
import styles from "./style.module.css";

const roles: EmployeeRole[] = ["Gerente", "Estoquista", "Caixa"];
const acceptedExtensions = [".txt", ".csv", ".tsv", ".prn"];
type RegistrationFormState = Omit<EmployeeFormState, "role"> & { role: EmployeeRole | "" };
const emptyForm: RegistrationFormState = { name: "", cpf: "", role: "", store: "", phone: "", email: "", status: "Ativo" };

function EmployeeRegistration({ onSubmit, onCancel }: EmployeeRegistrationProps) {
  const [form, setForm] = useState<RegistrationFormState>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [fileNotice, setFileNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (file?: File) => {
    if (!file) return;
    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!acceptedExtensions.includes(extension)) {
      setSelectedFile(null);
      setFileNotice("Formato não aceito. Escolha um arquivo .txt, .csv, .tsv ou .prn.");
      return;
    }
    setSelectedFile(file);
    setFileNotice(`${file.name} selecionado. A importação em lote ainda não está conectada.`);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    acceptFile(event.dataTransfer.files[0]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.cpf.trim() || !form.role || !form.store.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Preencha nome, CPF, cargo, loja, telefone e e-mail para continuar.");
      return;
    }
    if (form.cpf.replace(/\D/g, "").length !== 11) {
      setError("Informe um CPF com 11 dígitos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    onSubmit({ ...form, role: form.role, name: form.name.trim(), cpf: form.cpf.trim(), email: form.email.trim(), phone: form.phone.trim() });
  };

  return (
    <section className={styles.page} aria-labelledby="registration-title">
      <header className={styles.header}>
        <FontAwesomeIcon className={styles.headerIcon} icon={faUserPlus} aria-hidden="true" />
        <h1 id="registration-title">Cadastrar Funcionário</h1>
      </header>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          <label htmlFor="new-employee-name">Nome<input id="new-employee-name" autoComplete="name" placeholder="Digite o nome do funcionário" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label htmlFor="new-employee-cpf">CPF<input id="new-employee-cpf" autoComplete="off" inputMode="numeric" placeholder="Digite o CPF do funcionário" value={form.cpf} onChange={(event) => setForm((current) => ({ ...current, cpf: event.target.value }))} /></label>
          <label htmlFor="new-employee-role">Cargo<select id="new-employee-role" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as EmployeeRole | "" }))}><option value="">Selecione um cargo</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
          <label htmlFor="new-employee-store">Loja<input id="new-employee-store" autoComplete="organization" placeholder="Digite a loja do funcionário" value={form.store} onChange={(event) => setForm((current) => ({ ...current, store: event.target.value }))} /></label>
          <label htmlFor="new-employee-phone">Telefone<input id="new-employee-phone" type="tel" autoComplete="tel" placeholder="Digite o telefone do funcionário" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
          <label htmlFor="new-employee-email">E-mail<input id="new-employee-email" type="email" autoComplete="email" placeholder="Digite o e-mail do funcionário" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
        </div>

        <div className={styles.uploadColumn}>
          <div className={styles.dropZone} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
            <FontAwesomeIcon className={styles.fileIcon} icon={faFileArrowUp} aria-hidden="true" />
            <p>{selectedFile ? selectedFile.name : "Arraste o arquivo aqui ou selecione para escolher"}</p>
            <span>Formatos aceitos: .txt, .csv, .tsv, .prn</span>
            <input ref={fileInputRef} className={styles.hiddenInput} id="employee-import-file" type="file" accept={acceptedExtensions.join(",")} onChange={(event) => acceptFile(event.target.files?.[0])} />
          </div>
          <button className={styles.fileButton} type="button" onClick={() => fileInputRef.current?.click()}>Selecionar arquivo</button>
          <p className={styles.fileNotice} role="status" aria-live="polite">{fileNotice}</p>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          <button className={styles.submitButton} type="submit"><FontAwesomeIcon icon={faCheckCircle} aria-hidden="true" /> Cadastrar funcionário</button>
          <button className={styles.cancelButton} type="button" onClick={onCancel}>Cancelar cadastro</button>
        </div>
      </form>
    </section>
  );
}

export default EmployeeRegistration;
