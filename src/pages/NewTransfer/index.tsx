import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  transferEmployeeOptions,
  transferSuggestedActionOptions,
  transferStoreOptions,
} from "@/data/stock-transfers";
import type {
  NewTransferPageState,
  TransferFormState,
  TransferFormStatus,
} from "@/types/stock-transfer.types";
import styles from "./style.module.css";

const transferStatusOptions: readonly { value: TransferFormStatus; label: string }[] = [
  { value: "REQUESTED", label: "Solicitada" },
  { value: "APPROVED", label: "Aprovada" },
  { value: "IN_TRANSIT", label: "Em trânsito" },
  { value: "COMPLETED", label: "Concluída" },
  { value: "CANCELLED", label: "Cancelada" },
];

const initialForm: TransferFormState = {
  suggestedActionId: "",
  sourceStoreId: "",
  destinationStoreId: "",
  employeeId: "",
  requestDate: "2026-09-28T09:00",
  completionDate: "",
  status: "REQUESTED",
  observation: "",
};

function NewTransfer() {
  const [state, setState] = useState<NewTransferPageState>({
    form: initialForm,
    feedback: "",
    feedbackIsError: false,
  });

  const updateForm = <K extends keyof TransferFormState>(
    field: K,
    value: TransferFormState[K],
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
    const { form } = state;

    if (!form.sourceStoreId || !form.destinationStoreId || !form.employeeId) {
      setState((currentState) => ({
        ...currentState,
        feedback: "Selecione loja de origem, loja de destino e responsável.",
        feedbackIsError: true,
      }));
      return;
    }

    if (form.sourceStoreId === form.destinationStoreId) {
      setState((currentState) => ({
        ...currentState,
        feedback: "A loja de origem deve ser diferente da loja de destino.",
        feedbackIsError: true,
      }));
      return;
    }

    if (form.completionDate && form.completionDate < form.requestDate) {
      setState((currentState) => ({
        ...currentState,
        feedback: "A data de conclusão deve ser posterior à data de solicitação.",
        feedbackIsError: true,
      }));
      return;
    }

    setState({
      form: initialForm,
      feedback: "Transferência registrada com sucesso.",
      feedbackIsError: false,
    });
  };

  return (
    <section className={styles.page} aria-labelledby="new-transfer-title">
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <div>
            <p className={styles.eyebrow}>Transferência de estoque</p>
            <h1 id="new-transfer-title">Nova transferência</h1>
          </div>
          <span className={styles.requiredHint}>* Campos obrigatórios</span>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="transfer-suggested-action">Ação sugerida</label>
            <select
              id="transfer-suggested-action"
              value={state.form.suggestedActionId}
              onChange={(event) => updateForm("suggestedActionId", event.target.value)}
            >
              <option value="">Nenhuma ação vinculada</option>
              {transferSuggestedActionOptions.map((action) => (
                <option key={action.id} value={action.id}>{action.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="transfer-employee">Responsável *</label>
            <select
              id="transfer-employee"
              value={state.form.employeeId}
              onChange={(event) => updateForm("employeeId", event.target.value)}
              required
            >
              <option value="">Selecione um responsável</option>
              {transferEmployeeOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="transfer-source-store">Loja de origem *</label>
            <select
              id="transfer-source-store"
              value={state.form.sourceStoreId}
              onChange={(event) => updateForm("sourceStoreId", event.target.value)}
              required
            >
              <option value="">Selecione a loja de origem</option>
              {transferStoreOptions.map((store) => (
                <option key={store.id} value={store.id}>{store.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="transfer-destination-store">Loja de destino *</label>
            <select
              id="transfer-destination-store"
              value={state.form.destinationStoreId}
              onChange={(event) => updateForm("destinationStoreId", event.target.value)}
              required
            >
              <option value="">Selecione a loja de destino</option>
              {transferStoreOptions.map((store) => (
                <option key={store.id} value={store.id}>{store.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="transfer-request-date">Data da solicitação *</label>
            <input
              id="transfer-request-date"
              type="datetime-local"
              value={state.form.requestDate}
              onChange={(event) => updateForm("requestDate", event.target.value)}
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="transfer-completion-date">Data de conclusão</label>
            <input
              id="transfer-completion-date"
              type="datetime-local"
              value={state.form.completionDate}
              onChange={(event) => updateForm("completionDate", event.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="transfer-status">Status *</label>
            <select
              id="transfer-status"
              value={state.form.status}
              onChange={(event) => updateForm("status", event.target.value as TransferFormStatus)}
              required
            >
              {transferStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className={`${styles.formField} ${styles.fullWidth}`}>
            <label htmlFor="transfer-observation">Observação</label>
            <textarea
              id="transfer-observation"
              value={state.form.observation}
              onChange={(event) => updateForm("observation", event.target.value)}
              placeholder="Descreva o motivo ou as orientações da transferência"
              rows={4}
            />
          </div>
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
          <Link className={styles.cancelButton} to="/stock/transfers">
            Cancelar transferência
          </Link>
          <button className={styles.submitButton} type="submit">
            Salvar transferência
          </button>
        </div>
      </form>
    </section>
  );
}

export default NewTransfer;

