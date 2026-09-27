import { useEffect, useId, useRef } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useImmer } from "use-immer";
import {
  faCheck,
  faCloudArrowUp,
  faFileLines,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReusableTable from "@/components/ReusableTable";
import Spinner from "@/components/Spinner";
import {
  processProductImport,
  registerImportedProducts,
  registerSingleProduct,
} from "@/services/productImportService";
import type {
  ProductDraft,
  ProductDraftState,
  ProductImportFormat,
  ProductImportPreviewItem,
  ProductImportState,
  ProductRegistrationMode,
  ProductRegistrationSuccessState,
  RecentProduct,
} from "@/types/product-import.types";
import type { ReusableTableColumn } from "@/types/reusable-table.types";
import {
  validateProductDraft,
  validateProductImportFile,
} from "@/utils/productImportValidation";
import styles from "./style.module.css";

const initialState: ProductImportState = {
  mode: "bulk",
  format: "xml",
  file: null,
  isDragging: false,
  status: "idle",
  message: "",
  previewItems: [],
};

const initialProductDraft: ProductDraftState = {
  values: {
    sku: "",
    barcode: "",
    name: "",
    category: "",
    brand: "",
    measurementUnit: "",
    supplier: "",
  },
  status: "idle",
  message: "",
};

const initialSuccessModal: ProductRegistrationSuccessState = {
  isOpen: false,
  title: "",
  message: "",
};

const categories = ["Açougue", "Congelados", "Horti-Fruti", "Laticínios"];

const measurementUnits = ["Unidade", "Quilograma", "Litro", "Caixa"];

const suppliers = [
  "Serjão da massa",
  "Distribuidora Central",
  "Fornecedor local",
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const initialRecentProducts: RecentProduct[] = [
  {
    id: "recent-01",
    itemName: "Pizza de frango com calabresa",
    barcode: "123456789123456",
    category: "Congelados",
    quantity: 24,
    source: "XML",
    addedAt: "Hoje, 14:32",
  },
  {
    id: "recent-02",
    itemName: "Iogurte natural integral",
    barcode: "7891234567890",
    category: "Laticínios",
    quantity: 36,
    source: "CSV",
    addedAt: "Hoje, 13:18",
  },
];

const recentColumns: ReusableTableColumn<RecentProduct>[] = [
  { id: "item", header: "Produto", renderCell: (item) => item.itemName },
  {
    id: "barcode",
    header: "Código de barras",
    renderCell: (item) => item.barcode,
  },
  { id: "category", header: "Categoria", renderCell: (item) => item.category },
  { id: "quantity", header: "Quantidade", renderCell: (item) => item.quantity },
  { id: "source", header: "Origem", renderCell: (item) => item.source },
  {
    id: "addedAt",
    header: "Adicionado em",
    renderCell: (item) => item.addedAt,
  },
];

const previewColumns: ReusableTableColumn<ProductImportPreviewItem>[] = [
  { id: "item", header: "Item", renderCell: (item) => item.itemName },
  {
    id: "barcode",
    header: "Código de barras",
    renderCell: (item) => item.barcode,
  },
  { id: "quantity", header: "Qtd.", renderCell: (item) => item.quantity },
  {
    id: "value",
    header: "Val. unit.",
    renderCell: (item) => currencyFormatter.format(item.unitPriceInCents / 100),
  },
  {
    id: "expiration",
    header: "Validade",
    renderCell: (item) => item.expirationDate,
  },
  {
    id: "cost",
    header: "Novo custo",
    renderCell: (item) => currencyFormatter.format(item.newCostInCents / 100),
  },
  {
    id: "suggestion",
    header: "Preço sugerido",
    renderCell: (item) =>
      currencyFormatter.format(item.suggestedPriceInCents / 100),
    display: "badge",
    tone: () => "success",
  },
];

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return megabytes >= 1
    ? `${megabytes.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
    : `${Math.max(1, bytes / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB`;
}

function draftFromImport(item: ProductImportPreviewItem): ProductDraft {
  return {
    sku: item.sku,
    barcode: item.barcode,
    name: item.itemName,
    category: item.category,
    brand: item.brand,
    measurementUnit: item.measurementUnit,
    supplier: item.supplier,
  };
}

function ProductsRegistration() {
  const [state, updateState] = useImmer<ProductImportState>(initialState);
  const [productDraft, updateProductDraft] =
    useImmer<ProductDraftState>(initialProductDraft);
  const [recentProducts, updateRecentProducts] =
    useImmer<RecentProduct[]>(initialRecentProducts);
  const [successModal, updateSuccessModal] =
    useImmer<ProductRegistrationSuccessState>(initialSuccessModal);

  const fileInputId = useId();
  const formatSelectId = useId();
  const navigate = useNavigate();
  const modalPrimaryRef = useRef<HTMLButtonElement>(null);

  const previewOpen = state.previewItems.length > 0;
  const modalOpen = previewOpen || successModal.isOpen;
  const busy = state.status === "processing" || state.status === "registering";

  useEffect(() => {
    if (!modalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state.status !== "registering") {
        updateState((draft) => {
          draft.previewItems = [];
          draft.status = "idle";
        });

        updateSuccessModal(initialSuccessModal);
      }
      if (event.key !== "Tab") return;
      const dialog = modalPrimaryRef.current?.closest('[role="dialog"]');
      const elements = dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'button:not(:disabled), [href], [tabindex="0"]',
            ),
          )
        : [];
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.body.style.overflow = "hidden";
    modalPrimaryRef.current?.focus();
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen, state.status, updateState, updateSuccessModal]);

  function updateMode(mode: ProductRegistrationMode) {
    updateState((draft) => {
      Object.assign(draft, initialState, { mode });
    });
  }

  function selectFile(file?: File) {
    if (!file) return;

    const error = validateProductImportFile(file, state.format);

    updateState((draft) => {
      draft.file = error ? null : file;
      draft.status = error ? "error" : "idle";
      draft.message = error ?? `Arquivo ${file.name} selecionado.`;
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();

    updateState((draft) => {
      draft.isDragging = false;
    });

    selectFile(event.dataTransfer.files[0]);
  }

  async function handleProcessFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!state.file) {
      updateState((draft) => {
        draft.status = "error";
        draft.message = `Selecione um arquivo .${draft.format}.`;
      });

      return;
    }

    updateState((draft) => {
      draft.status = "processing";
      draft.message = "Processando arquivo...";
    });

    try {
      const items = await processProductImport(state.file, state.format);
      updateProductDraft((draft) => {
        draft.values = draftFromImport(items[0]);
        draft.status = "idle";
        draft.message =
          "Campos preenchidos automaticamente. Você pode editá-los.";
      });

      updateState((draft) => {
        draft.status = "idle";
        draft.message = "Arquivo processado.";
        draft.previewItems = items;
      });
    } catch (error) {
      updateState((draft) => {
        draft.status = "error";
        draft.message =
          error instanceof Error ? error.message : "Falha no processamento.";
      });
    }
  }

  async function handleRegisterProducts() {
    updateState((draft) => {
      draft.status = "registering";
      draft.message = "Cadastrando produtos...";
    });

    try {
      await registerImportedProducts(state.previewItems);

      const count = state.previewItems.length;
      const source = state.format.toUpperCase() as RecentProduct["source"];

      const importedProducts = state.previewItems.map((item) => ({
        id: `recent-${item.id}`,
        itemName: item.itemName,
        barcode: item.barcode,
        category: item.category,
        quantity: item.quantity,
        source,
        addedAt: "Agora",
      }));

      updateRecentProducts((draft) => {
        draft.unshift(...importedProducts);
      });

      updateState((draft) => {
        draft.status = "success";
        draft.previewItems = [];
        draft.file = null;
        draft.message = "Produtos cadastrados.";
      });

      updateSuccessModal((draft) => {
        draft.isOpen = true;
        draft.title = "Produtos cadastrados com sucesso";
        draft.message = `${count} produtos foram inseridos no banco de dados.`;
      });
    } catch (error) {
      updateState((draft) => {
        draft.status = "error";
        draft.message =
          error instanceof Error ? error.message : "Falha no cadastro.";
      });
    }
  }

  async function handleSingleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = validateProductDraft(productDraft.values);

    if (error) {
      updateProductDraft((draft) => {
        draft.status = "error";
        draft.message = error;
      });

      return;
    }

    updateProductDraft((draft) => {
      draft.status = "registering";
      draft.message = "Cadastrando produto...";
    });

    try {
      const name = productDraft.values.name;
      await registerSingleProduct(productDraft.values);

      updateRecentProducts((draft) => {
        draft.unshift({
          id: `manual-${Date.now()}`,
          itemName: name,
          barcode: productDraft.values.barcode,
          category: productDraft.values.category,
          quantity: 1,
          source: "Cadastro manual",
          addedAt: "Agora",
        });
      });

      updateProductDraft((draft) => {
        Object.assign(draft, initialProductDraft, {
          status: "success",
          message: "Produto cadastrado.",
        });
      });

      updateSuccessModal((draft) => {
        draft.isOpen = true;
        draft.title = "Produto cadastrado com sucesso";
        draft.message = `${name} foi inserido no banco de dados.`;
      });
    } catch (caught) {
      updateProductDraft((draft) => {
        draft.status = "error";
        draft.message =
          caught instanceof Error ? caught.message : "Falha no cadastro.";
      });
    }
  }

  function updateDraft(field: keyof ProductDraft, value: string) {
    updateProductDraft((draft) => {
      draft.values[field] = value;
      draft.status = "idle";
      draft.message = "";
    });
  }

  function reviewFirstProduct() {
    const first = state.previewItems[0];
    if (first) {
      updateProductDraft((draft) => {
        draft.values = draftFromImport(first);
        draft.status = "idle";
        draft.message =
          "Dados importados. Revise e edite antes de cadastrar.";
      });
    }

    updateState((draft) => {
      draft.mode = "single";
      draft.previewItems = [];
      draft.status = "idle";
    });
  }

  return (
    <section className={styles.page} aria-labelledby="registration-title">
      <section className={styles.card}>
        <h1 id="registration-title">Novo Produto</h1>

        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Tipo de cadastro"
        >
          <button
            type="button"
            role="tab"
            aria-selected={state.mode === "bulk"}
            className={state.mode === "bulk" ? styles.active : ""}
            onClick={() => updateMode("bulk")}
          >
            Importação em massa
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={state.mode === "single"}
            className={state.mode === "single" ? styles.active : ""}
            onClick={() => updateMode("single")}
          >
            Nova SKU
          </button>
        </div>

        {state.mode === "bulk" ? (
          <form onSubmit={handleProcessFile}>
            <input
              className={styles["file-input"]}
              id={fileInputId}
              type="file"
              accept={`.${state.format}`}
              onChange={handleFileChange}
            />
            <label
              className={`${styles.dropzone} ${state.isDragging ? styles.dragging : ""} ${state.file ? styles["has-file"] : ""}`}
              htmlFor={fileInputId}
              onDragEnter={(event) => {
                event.preventDefault();

                updateState((draft) => {
                  draft.isDragging = true;
                });
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() =>
                updateState((draft) => {
                  draft.isDragging = false;
                })
              }
              onDrop={handleDrop}
            >
              {state.file ? (
                <>
                  <span className={styles["ready-label"]}>
                    <FontAwesomeIcon icon={faCheck} /> Arquivo pronto para
                    inserir
                  </span>
                  <span className={styles["selected-file"]} role="status">
                    <FontAwesomeIcon icon={faFileLines} />
                    <span>
                      <strong>{state.file.name}</strong>
                      <small>
                        {state.format.toUpperCase()} ·{" "}
                        {formatFileSize(state.file.size)}
                      </small>
                    </span>
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                  <span>Clique ou arraste outro arquivo para substituir</span>
                </>
              ) : (
                <>
                  <span className={styles["upload-icon"]}>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                  </span>
                  <strong>
                    Arraste o arquivo {state.format.toUpperCase()} aqui ou
                    clique para selecionar
                  </strong>
                  <span>Formato aceito: .{state.format} · máximo de 10 MB</span>
                </>
              )}
            </label>
            <div className={styles.actions}>
              <button className={styles.primary} type="submit" disabled={busy}>
                {state.status === "processing" ? (
                  <Spinner label="Processando" />
                ) : (
                  "Inserir"
                )}
              </button>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => navigate("/products")}
                disabled={busy}
              >
                Cancelar
              </button>
              <label className={styles.format} htmlFor={formatSelectId}>
                Formato{" "}
                <select
                  id={formatSelectId}
                  value={state.format}
                  disabled={busy}
                  onChange={(event) => {
                    const format = event.target.value as ProductImportFormat;

                    updateState((draft) => {
                      Object.assign(draft, initialState, {
                        mode: "bulk",
                        format,
                      });
                    });
                  }}
                >
                  <option value="xml">XML</option>
                  <option value="csv">CSV</option>
                </select>
              </label>
            </div>
            {state.message && (
              <p
                className={
                  state.status === "error" ? styles.error : styles.message
                }
                role={state.status === "error" ? "alert" : "status"}
              >
                {state.message}
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={handleSingleSubmit} className={styles["single-form"]}>
            <div className={styles["form-grid"]}>
              <label>
                SKU
                <input
                  id="product-sku"
                  value={productDraft.values.sku}
                  onChange={(e) => updateDraft("sku", e.target.value)}
                />
              </label>
              <label>
                Código de barras
                <input
                  value={productDraft.values.barcode}
                  onChange={(e) => updateDraft("barcode", e.target.value)}
                />
              </label>
              <label className={styles.wide}>
                Nome do produto
                <input
                  value={productDraft.values.name}
                  onChange={(e) => updateDraft("name", e.target.value)}
                />
              </label>
              <label>
                Categoria
                <select
                  value={productDraft.values.category}
                  onChange={(e) => updateDraft("category", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Marca
                <input
                  value={productDraft.values.brand}
                  onChange={(e) => updateDraft("brand", e.target.value)}
                />
              </label>
              <label>
                Unidade de medida
                <select
                  value={productDraft.values.measurementUnit}
                  onChange={(e) =>
                    updateDraft("measurementUnit", e.target.value)
                  }
                >
                  <option value="">Selecione</option>
                  {measurementUnits.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                Fornecedor
                <select
                  value={productDraft.values.supplier}
                  onChange={(e) => updateDraft("supplier", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {suppliers.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.primary}
                type="submit"
                disabled={productDraft.status === "registering"}
              >
                {productDraft.status === "registering" ? (
                  <Spinner label="Cadastrando" />
                ) : (
                  "Cadastrar produto"
                )}
              </button>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => navigate("/products")}
              >
                Cancelar cadastro
              </button>
            </div>
            {productDraft.message && (
              <p
                className={
                  productDraft.status === "error"
                    ? styles.error
                    : styles.message
                }
                role={productDraft.status === "error" ? "alert" : "status"}
              >
                {productDraft.message}
              </p>
            )}
          </form>
        )}
      </section>
      <ReusableTable
        title="Últimos produtos adicionados"
        columns={recentColumns}
        data={recentProducts}
        rowKey={(item) => item.id}
      />
      {previewOpen && (
        <div className={styles.backdrop}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
          >
            <header>
              <h2 id="preview-title">Prévia do processamento</h2>
              <button
                type="button"
                aria-label="Fechar prévia"
                onClick={() =>
                  updateState((draft) => {
                    draft.previewItems = [];
                  })
                }
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </header>
            <ReusableTable
              title="Produtos encontrados"
              columns={previewColumns}
              data={state.previewItems}
              rowKey={(item) => item.id}
            />
            <div className={styles.actions}>
              <button
                ref={modalPrimaryRef}
                className={styles.primary}
                type="button"
                onClick={handleRegisterProducts}
                disabled={state.status === "registering"}
              >
                {state.status === "registering" ? (
                  <Spinner label="Cadastrando" />
                ) : (
                  "Cadastrar no banco"
                )}
              </button>
              <button
                className={styles.secondary}
                type="button"
                onClick={reviewFirstProduct}
              >
                Revisar e editar primeiro produto
              </button>
            </div>
          </section>
        </div>
      )}
      {successModal.isOpen && (
        <div className={styles.backdrop}>
          <section
            className={`${styles.modal} ${styles.success}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            <span className={styles["success-icon"]}>
              <FontAwesomeIcon icon={faCheck} />
            </span>
            <h2 id="success-title">{successModal.title}</h2>
            <p>{successModal.message}</p>
            <div className={styles.actions}>
              <button
                ref={modalPrimaryRef}
                className={styles.primary}
                type="button"
                onClick={() => updateSuccessModal(initialSuccessModal)}
              >
                Continuar cadastrando
              </button>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => navigate("/products")}
              >
                Voltar para produtos
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default ProductsRegistration;
