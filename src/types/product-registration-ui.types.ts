import type { RefObject } from "react";
import type {
  ChangeEventHandler,
  DragEventHandler,
  FormEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type {
  ProductDraft,
  ProductDraftState,
  ProductImportPreviewItem,
  ProductImportState,
  ProductRegistrationMode,
  ProductRegistrationSuccessState,
  RecentProduct,
} from "@/types/product-import.types";

export type RegistrationModalKind = "preview" | "success";

export interface RegistrationTabsProps {
  mode: ProductRegistrationMode;
  onModeChange: (mode: ProductRegistrationMode) => void;
  onKeyDown: (
    mode: ProductRegistrationMode,
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => void;
}

export interface BulkImportPanelProps {
  state: ProductImportState;
  fileInputId: string;
  formatSelectId: string;
  busy: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onFileChange: ChangeEventHandler<HTMLInputElement>;
  onDragEnter: DragEventHandler<HTMLLabelElement>;
  onDragOver: DragEventHandler<HTMLLabelElement>;
  onDragLeave: DragEventHandler<HTMLLabelElement>;
  onDrop: DragEventHandler<HTMLLabelElement>;
  onFormatChange: ChangeEventHandler<HTMLSelectElement>;
  onCancel: () => void;
}

export interface SingleProductFormProps {
  mode: ProductRegistrationMode;
  draft: ProductDraftState;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onDraftChange: (field: keyof ProductDraft, value: string) => void;
  onCancel: () => void;
}

export interface ProductRegistrationDialogsProps {
  previewItems: ProductImportPreviewItem[];
  status: ProductImportState["status"];
  successModal: ProductRegistrationSuccessState;
  closingModal: RegistrationModalKind | null;
  modalPrimaryRef: RefObject<HTMLButtonElement | null>;
  onClosePreview: () => void;
  onRegisterProducts: () => void;
  onReviewFirstProduct: () => void;
  onCloseSuccess: () => void;
  onBackToProducts: () => void;
}

export interface RecentProductsTableProps {
  products: RecentProduct[];
}

export interface ProductRegistrationController {
  state: ProductImportState;
  productDraft: ProductDraftState;
  recentProducts: RecentProduct[];
  successModal: ProductRegistrationSuccessState;
  closingModal: RegistrationModalKind | null;
  fileInputId: string;
  formatSelectId: string;
  modalPrimaryRef: RefObject<HTMLButtonElement | null>;
  previewOpen: boolean;
  busy: boolean;
  updateMode: (mode: ProductRegistrationMode) => void;
  handleRegistrationTabKeyDown: RegistrationTabsProps["onKeyDown"];
  handleFileChange: BulkImportPanelProps["onFileChange"];
  handleDragEnter: BulkImportPanelProps["onDragEnter"];
  handleDragOver: BulkImportPanelProps["onDragOver"];
  handleDragLeave: BulkImportPanelProps["onDragLeave"];
  handleDrop: BulkImportPanelProps["onDrop"];
  handleFormatChange: BulkImportPanelProps["onFormatChange"];
  handleProcessFile: BulkImportPanelProps["onSubmit"];
  handleSingleSubmit: SingleProductFormProps["onSubmit"];
  updateDraft: SingleProductFormProps["onDraftChange"];
  handleRegisterProducts: ProductRegistrationDialogsProps["onRegisterProducts"];
  requestPreviewClose: ProductRegistrationDialogsProps["onClosePreview"];
  reviewFirstProduct: ProductRegistrationDialogsProps["onReviewFirstProduct"];
  requestSuccessClose: ProductRegistrationDialogsProps["onCloseSuccess"];
  navigateToProducts: () => void;
  closeSuccessAndNavigate: () => void;
}
