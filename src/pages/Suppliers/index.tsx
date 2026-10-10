import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReusableTable from "@/components/ReusableTable";
import { supplierRecords } from "@/data/suppliers";
import type { ReusableTableColumn, TableCellTone } from "@/types/reusable-table.types";
import type { SupplierPageState, SupplierRecord } from "@/types/supplier.types";
import styles from "./style.module.css";

const getSupplierStatusTone = (active: boolean): TableCellTone =>
  active ? "success" : "danger";

function Suppliers() {
  const [state, setState] = useState<SupplierPageState>({
    search: "",
    records: supplierRecords,
    selectedSupplierId: "",
    editDraft: null,
    feedback: "",
    feedbackIsError: false,
  });
  const editInputRef = useRef<HTMLInputElement>(null);
  const editTriggerRef = useRef<HTMLButtonElement | null>(null);
  const isEditing = Boolean(state.editDraft);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    } else if (editTriggerRef.current?.isConnected) {
      editTriggerRef.current.focus();
    }
  }, [isEditing]);

  const filteredSuppliers = useMemo(() => {
    const normalizedSearch = state.search.trim().toLocaleLowerCase("pt-BR");

    if (!normalizedSearch) {
      return state.records;
    }

    return state.records.filter((supplier) =>
      [supplier.tradeName, supplier.cnpj, supplier.email, supplier.linkedSkus]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedSearch),
    );
  }, [state.records, state.search]);

  const columns: ReusableTableColumn<SupplierRecord>[] = [
    { id: "cnpj", header: "CNPJ", renderCell: (supplier) => supplier.cnpj },
    { id: "tradeName", header: "Nome", renderCell: (supplier) => supplier.tradeName },
    { id: "email", header: "Contato", renderCell: (supplier) => supplier.email },
    { id: "phone", header: "Telefone", renderCell: (supplier) => supplier.phone },
    { id: "linkedSkus", header: "SKUs vinculados", renderCell: (supplier) => supplier.linkedSkus },
    {
      id: "status",
      header: "Status",
      renderCell: (supplier) => (supplier.active ? "Ativo" : "Inativo"),
      display: "badge",
      tone: (supplier) => getSupplierStatusTone(supplier.active),
      align: "center",
    },
    {
      id: "action",
      header: "Ação",
      renderCell: () => null,
      display: "action",
      actionText: () => "Editar",
      actionHasPopup: false,
      onAction: (supplier, event) => {
        editTriggerRef.current = event.currentTarget;
        setState((currentState) => ({
          ...currentState,
          selectedSupplierId: supplier.id,
          editDraft: {
            tradeName: supplier.tradeName,
            active: supplier.active,
          },
          feedback: "",
          feedbackIsError: false,
        }));
      },
      actionLabel: (supplier) => `Editar fornecedor ${supplier.tradeName}`,
      align: "center",
    },
  ];

  const handleEditDraftChange = <K extends "tradeName" | "active">(
    field: K,
    value: SupplierPageState["editDraft"] extends infer Draft
      ? Draft extends { tradeName: string; active: boolean }
        ? Draft[K]
        : never
      : never,
  ) => {
    setState((currentState) =>
      currentState.editDraft
        ? {
            ...currentState,
            editDraft: { ...currentState.editDraft, [field]: value },
            feedback: "",
            feedbackIsError: false,
          }
        : currentState,
    );
  };

  const saveSupplierEdit = () => {
    if (!state.selectedSupplierId || !state.editDraft?.tradeName.trim()) {
      setState((currentState) => ({
        ...currentState,
        feedback: "Informe um apelido para o fornecedor.",
        feedbackIsError: true,
      }));
      return;
    }

    setState((currentState) => ({
      ...currentState,
      records: currentState.records.map((supplier) =>
        supplier.id === currentState.selectedSupplierId && currentState.editDraft
          ? {
              ...supplier,
              tradeName: currentState.editDraft.tradeName.trim(),
              active: currentState.editDraft.active,
            }
          : supplier,
      ),
      selectedSupplierId: "",
      editDraft: null,
      feedback: "Fornecedor atualizado com sucesso.",
      feedbackIsError: false,
    }));
  };

  const cancelSupplierEdit = () => {
    setState((currentState) => ({
      ...currentState,
      selectedSupplierId: "",
      editDraft: null,
      feedback: "",
      feedbackIsError: false,
    }));
  };

  const resultLabel =
    filteredSuppliers.length === 1
      ? "1 fornecedor encontrado."
      : `${filteredSuppliers.length} fornecedores encontrados.`;

  return (
    <section className={styles.page} aria-labelledby="suppliers-title">
      <h1 className={styles["sr-only"]} id="suppliers-title">
        Fornecedores
      </h1>

      <div className={styles.toolbar}>
        <label className={styles.searchField} htmlFor="supplier-search">
          <span className={styles["sr-only"]}>Buscar fornecedor</span>
          <input
            id="supplier-search"
            type="search"
            value={state.search}
            onChange={(event) =>
              setState((currentState) => ({ ...currentState, search: event.target.value }))
            }
            placeholder="Buscar por nome ou SKU..."
          />
        </label>
        <Link className={styles.newSupplierButton} to="/stock/suppliers/new">
          <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
          Novo fornecedor
        </Link>
      </div>

      <p className={styles["sr-only"]} role="status" aria-live="polite">
        {resultLabel}
      </p>

      {state.feedback && (
        <p
          className={`${styles.feedback} ${state.feedbackIsError ? styles.feedbackError : ""}`}
          role={state.feedbackIsError ? "alert" : "status"}
          aria-live="polite"
        >
          {state.feedback}
        </p>
      )}

      {state.editDraft && (
        <section className={styles.editPanel} aria-labelledby="supplier-edit-title">
          <div className={styles.editHeader}>
            <h2 id="supplier-edit-title">Editar fornecedor</h2>
            <span>Atualize o apelido e o status do cadastro.</span>
          </div>
          <div className={styles.editFields}>
            <label className={styles.editField} htmlFor="supplier-edit-nickname">
              <span>Apelido</span>
              <input
                ref={editInputRef}
                id="supplier-edit-nickname"
                value={state.editDraft.tradeName}
                onChange={(event) => handleEditDraftChange("tradeName", event.target.value)}
              />
            </label>
            <label className={styles.editCheckbox} htmlFor="supplier-edit-active">
              <input
                id="supplier-edit-active"
                type="checkbox"
                checked={state.editDraft.active}
                onChange={(event) => handleEditDraftChange("active", event.target.checked)}
              />
              Fornecedor ativo
            </label>
          </div>
          <div className={styles.editActions}>
            <button className={styles.cancelEditButton} type="button" onClick={cancelSupplierEdit}>
              Cancelar
            </button>
            <button className={styles.saveEditButton} type="button" onClick={saveSupplierEdit}>
              Salvar alterações
            </button>
          </div>
        </section>
      )}

      <div className={styles.tableSection}>
        <ReusableTable
          title="Fornecedores cadastrados"
          columns={columns}
          data={filteredSuppliers}
          rowKey={(supplier) => supplier.id}
          emptyMessage="Nenhum fornecedor corresponde à busca."
        />
      </div>
    </section>
  );
}

export default Suppliers;
