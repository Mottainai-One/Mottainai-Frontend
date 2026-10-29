import { useCallback, useEffect, useId, useRef, useState } from "react";
import type {
  ChangeEvent,
  DragEvent,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useImmer } from "use-immer";
import type {
  ProductDraft,
  ProductDraftState,
  ProductImportFormat,
  ProductImportState,
  ProductRegistrationMode,
  ProductRegistrationSuccessState,
  RecentProduct,
} from "@/types/product-import.types";
import type { ProductRegistrationController, RegistrationModalKind } from "@/types/product-registration-ui.types";
import {
  processProductImport,
  registerImportedProducts,
  registerSingleProduct,
} from "@/services/productImportService";
import {
  sanitizeProductDraft,
  sanitizeProductImportPreview,
  validateProductDraft,
  validateProductImportFile,
  validateProductImportPreview,
} from "@/utils/productImportValidation";

const MODAL_CLOSE_ANIMATION_DURATION_MS = 180;

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
  errors: {},
  status: "idle",
  message: "",
};

const initialSuccessModal: ProductRegistrationSuccessState = {
  isOpen: false,
  title: "",
  message: "",
};

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

function draftFromImport(item: ProductImportState["previewItems"][number]): ProductDraft {
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

export function useProductRegistration(): ProductRegistrationController {
  const [state, updateState] = useImmer<ProductImportState>(initialState);
  const [productDraft, updateProductDraft] = useImmer<ProductDraftState>(initialProductDraft);
  const [recentProducts, updateRecentProducts] = useImmer<RecentProduct[]>(initialRecentProducts);
  const [successModal, updateSuccessModal] = useImmer<ProductRegistrationSuccessState>(initialSuccessModal);

  const fileInputId = useId();
  const formatSelectId = useId();
  const navigate = useNavigate();
  const modalPrimaryRef = useRef<HTMLButtonElement>(null);
  const modalCloseTimeoutRef = useRef<number | null>(null);
  const closingModalRef = useRef<RegistrationModalKind | null>(null);
  const modalWasOpenRef = useRef(false);
  const modalReturnFocusRef = useRef<HTMLElement | null>(null);
  const activeModalRef = useRef<RegistrationModalKind | null>(null);
  const [closingModal, setClosingModal] = useState<RegistrationModalKind | null>(null);

  const previewOpen = state.previewItems.length > 0;
  const modalOpen = previewOpen || successModal.isOpen;
  const busy = state.status === "processing" || state.status === "registering";

  const requestModalClose = useCallback((
    modal: RegistrationModalKind,
    afterClose?: () => void,
  ) => {
    if (closingModalRef.current !== null) return;

    closingModalRef.current = modal;
    const finishClose = () => {
      modalCloseTimeoutRef.current = null;
      closingModalRef.current = null;
      setClosingModal(null);

      if (afterClose) {
        afterClose();
      } else if (modal === "preview") {
        updateState((draft) => {
          draft.previewItems = [];
          draft.status = "idle";
        });
      } else {
        updateSuccessModal(initialSuccessModal);
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishClose();
      return;
    }

    setClosingModal(modal);
    modalCloseTimeoutRef.current = window.setTimeout(
      finishClose,
      MODAL_CLOSE_ANIMATION_DURATION_MS,
    );
  }, [updateState, updateSuccessModal]);

  useEffect(() => () => {
    if (modalCloseTimeoutRef.current !== null) {
      window.clearTimeout(modalCloseTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      if (modalWasOpenRef.current) {
        modalWasOpenRef.current = false;
        activeModalRef.current = null;
        const returnTarget = modalReturnFocusRef.current;
        modalReturnFocusRef.current = null;
        window.requestAnimationFrame(() => {
          if (returnTarget?.isConnected) returnTarget.focus();
          else document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
        });
      }
      return;
    }

    const modalKind: RegistrationModalKind = successModal.isOpen ? "success" : "preview";
    if (!modalWasOpenRef.current) {
      modalReturnFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      modalWasOpenRef.current = true;
    }
    const shouldMoveFocus = activeModalRef.current !== modalKind;
    activeModalRef.current = modalKind;
    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state.status !== "registering") {
        if (successModal.isOpen) {
          requestModalClose("success");
        } else if (previewOpen) {
          requestModalClose("preview");
        }
      }
      if (event.key !== "Tab") return;
      const dialog = modalPrimaryRef.current?.closest('[role="dialog"]');
      const elements = dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true")
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

    const handleFocusIn = (event: FocusEvent) => {
      const dialog = modalPrimaryRef.current?.closest('[role="dialog"]');
      if (dialog && !dialog.contains(event.target as Node)) {
        const firstFocusable = dialog.querySelector<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        );
        (firstFocusable ?? modalPrimaryRef.current)?.focus();
      }
    };

    document.body.style.overflow = "hidden";
    if (shouldMoveFocus) window.requestAnimationFrame(() => modalPrimaryRef.current?.focus());
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [modalOpen, previewOpen, requestModalClose, state.status, successModal.isOpen]);

  function updateMode(mode: ProductRegistrationMode) {
    updateState((draft) => {
      Object.assign(draft, initialState, { mode });
    });
  }

  function handleRegistrationTabKeyDown(
    currentMode: ProductRegistrationMode,
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextMode: ProductRegistrationMode = currentMode === "bulk"
      ? event.key === "Home" ? "bulk" : "single"
      : event.key === "End" ? "single" : "bulk";
    updateMode(nextMode);
    document.getElementById(`${nextMode}-registration-tab`)?.focus();
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

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    updateState((draft) => {
      draft.isDragging = true;
    });
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
  }

  function handleDragLeave() {
    updateState((draft) => {
      draft.isDragging = false;
    });
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    updateState((draft) => {
      draft.isDragging = false;
    });
    selectFile(event.dataTransfer.files[0]);
  }

  function handleFormatChange(event: ChangeEvent<HTMLSelectElement>) {
    const format = event.target.value as ProductImportFormat;
    updateState((draft) => {
      Object.assign(draft, initialState, { mode: "bulk", format });
    });
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
      const previewError = validateProductImportPreview(items);
      if (previewError) {
        updateState((draft) => {
          draft.status = "error";
          draft.message = previewError;
        });
        return;
      }
      const sanitizedItems = sanitizeProductImportPreview(items);
      updateProductDraft((draft) => {
        draft.values = sanitizeProductDraft(draftFromImport(sanitizedItems[0]));
        draft.errors = {};
        draft.status = "idle";
        draft.message = "Campos preenchidos automaticamente. Você pode editá-los.";
      });
      updateState((draft) => {
        draft.status = "idle";
        draft.message = "Arquivo processado.";
        draft.previewItems = sanitizedItems;
      });
    } catch (error) {
      updateState((draft) => {
        draft.status = "error";
        draft.message = error instanceof Error ? error.message : "Falha no processamento.";
      });
    }
  }

  async function handleRegisterProducts() {
    const previewError = validateProductImportPreview(state.previewItems);
    if (previewError) {
      updateState((draft) => {
        draft.status = "error";
        draft.message = previewError;
      });
      return;
    }
    const sanitizedItems = sanitizeProductImportPreview(state.previewItems);
    updateState((draft) => {
      draft.status = "registering";
      draft.message = "Cadastrando produtos...";
    });

    try {
      await registerImportedProducts(sanitizedItems);
      const count = sanitizedItems.length;
      const source = state.format.toUpperCase() as RecentProduct["source"];
      const importedProducts: RecentProduct[] = sanitizedItems.map((item) => ({
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
        draft.file = null;
        draft.message = "Produtos cadastrados.";
      });

      requestModalClose("preview", () => {
        updateState((draft) => {
          draft.previewItems = [];
        });
        updateSuccessModal((draft) => {
          draft.isOpen = true;
          draft.title = "Produtos cadastrados com sucesso";
          draft.message = `${count} produtos foram inseridos no banco de dados.`;
        });
      });
    } catch (error) {
      updateState((draft) => {
        draft.status = "error";
        draft.message = error instanceof Error ? error.message : "Falha no cadastro.";
      });
    }
  }

  async function handleSingleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateProductDraft(productDraft.values);

    if (Object.keys(errors).length > 0) {
      updateProductDraft((draft) => {
        draft.status = "error";
        draft.errors = errors;
        draft.message = Object.values(errors)[0] ?? "Revise os campos do produto.";
      });
      return;
    }

    const sanitizedDraft = sanitizeProductDraft(productDraft.values);
    updateProductDraft((draft) => {
      draft.status = "registering";
      draft.message = "Cadastrando produto...";
      draft.errors = {};
    });

    try {
      const name = sanitizedDraft.name;
      await registerSingleProduct(sanitizedDraft);
      updateRecentProducts((draft) => {
        draft.unshift({
          id: `manual-${Date.now()}`,
          itemName: name,
          barcode: sanitizedDraft.barcode,
          category: sanitizedDraft.category,
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
        draft.message = caught instanceof Error ? caught.message : "Falha no cadastro.";
      });
    }
  }

  function updateDraft(field: keyof ProductDraft, value: string) {
    updateProductDraft((draft) => {
      draft.values[field] = value;
      delete draft.errors[field];
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
        draft.message = "Dados importados. Revise e edite antes de cadastrar.";
      });
    }
    updateState((draft) => {
      draft.mode = "single";
      draft.previewItems = [];
      draft.status = "idle";
    });
  }

  return {
    state,
    productDraft,
    recentProducts,
    successModal,
    closingModal,
    fileInputId,
    formatSelectId,
    modalPrimaryRef,
    previewOpen,
    busy,
    updateMode,
    handleRegistrationTabKeyDown,
    handleFileChange,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFormatChange,
    handleProcessFile,
    handleSingleSubmit,
    updateDraft,
    handleRegisterProducts,
    requestPreviewClose: () => requestModalClose("preview"),
    reviewFirstProduct: () => requestModalClose("preview", reviewFirstProduct),
    requestSuccessClose: () => requestModalClose("success"),
    navigateToProducts: () => navigate("/products"),
    closeSuccessAndNavigate: () => requestModalClose("success", () => navigate("/products")),
  };
}
