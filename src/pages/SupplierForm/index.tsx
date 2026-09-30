import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supplierAddressOptions } from "@/data/suppliers";
import type {
  SupplierFormPageState,
  SupplierFormState,
} from "@/types/supplier.types";
import styles from "./style.module.css";

const initialForm: SupplierFormState = {
  addressId: "",
  tradeName: "",
  cnpj: "",
  email: "",
  phone: "",
  active: true,
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

function formatCnpj(value: string) {
  const digits = digitsOnly(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function SupplierForm() {
  const [state, setState] = useState<SupplierFormPageState>({
    form: initialForm,
    feedback: "",
    feedbackIsError: false,
  });

  const updateForm = <K extends keyof SupplierFormState>(
    field: K,
    value: SupplierFormState[K],
  ) => {
    setState((currentState) => ({
      ...currentState,
      form: { ...currentState.form, [field]: value },
      feedback: "",
      feedbackIsError: false,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cnpjDigits = digitsOnly(state.form.cnpj);

    if (!state.form.tradeName.trim() || !state.form.addressId || cnpjDigits.length !== 14) {
      setState((currentState) => ({
        ...currentState,
        feedback: "Informe nome fantasia, endereço e um CNPJ com 14 dígitos.",
        feedbackIsError: true,
      }));
      return;
    }

    setState({
      form: initialForm,
      feedback: "Fornecedor cadastrado com sucesso.",
      feedbackIsError: false,
    });
  };

  return (
    <section className={styles.page} aria-labelledby="supplier-form-title">
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <div>
            <p className={styles.eyebrow}>Cadastro</p>
            <h1 id="supplier-form-title">Novo fornecedor</h1>
          </div>
          <span className={styles.requiredHint}>* Campos obrigatórios</span>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="supplier-trade-name">Apelido *</label>
            <input
              id="supplier-trade-name"
              value={state.form.tradeName}
              onChange={(event) => updateForm("tradeName", event.target.value)}
              placeholder="Digite o nome do fornecedor"
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="supplier-cnpj">CNPJ *</label>
            <input
              id="supplier-cnpj"
              inputMode="numeric"
              maxLength={18}
              value={state.form.cnpj}
              onChange={(event) => updateForm("cnpj", formatCnpj(event.target.value))}
              placeholder="00.000.000/0000-00"
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="supplier-email">E-mail</label>
            <input
              id="supplier-email"
              type="email"
              value={state.form.email}
              onChange={(event) => updateForm("email", event.target.value)}
              placeholder="contato@empresa.com"
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="supplier-phone">Telefone</label>
            <input
              id="supplier-phone"
              type="tel"
              value={state.form.phone}
              onChange={(event) => updateForm("phone", event.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="supplier-address">Endereço vinculado *</label>
            <select
              id="supplier-address"
              value={state.form.addressId}
              onChange={(event) => updateForm("addressId", event.target.value)}
              required
            >
              <option value="">Selecione um endereço</option>
              {supplierAddressOptions.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.label}
                </option>
              ))}
            </select>
          </div>

          <label className={styles.checkboxField} htmlFor="supplier-active">
            <input
              id="supplier-active"
              type="checkbox"
              checked={state.form.active}
              onChange={(event) => updateForm("active", event.target.checked)}
            />
            Fornecedor ativo
          </label>
        </div>

        {state.feedback && (
          <p
            className={`${styles.feedback} ${state.feedbackIsError ? styles.feedbackError : ""}`}
            role={state.feedbackIsError ? "alert" : "status"}
            aria-live="polite"
          >
            {state.feedback}
          </p>
        )}

        <div className={styles.actions}>
          <Link className={styles.cancelButton} to="/stock/suppliers">
            Cancelar cadastro
          </Link>
          <button className={styles.submitButton} type="submit">
            Cadastrar fornecedor
          </button>
        </div>
      </form>
    </section>
  );
}

export default SupplierForm;

