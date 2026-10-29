import BulkImportPanel from "@/pages/ProductsRegistration/components/BulkImportPanel";
import ProductRegistrationDialogs from "@/pages/ProductsRegistration/components/ProductRegistrationDialogs";
import RecentProductsTable from "@/pages/ProductsRegistration/components/RecentProductsTable";
import RegistrationTabs from "@/pages/ProductsRegistration/components/RegistrationTabs";
import SingleProductForm from "@/pages/ProductsRegistration/components/SingleProductForm";
import { useProductRegistration } from "@/hooks/useProductRegistration";
import styles from "./style.module.css";

function ProductsRegistration() {
  const registration = useProductRegistration();

  return (
    <section className={styles.page} aria-labelledby="registration-title">
      <section className={styles.card}>
        <h1 id="registration-title">Novo Produto</h1>
        <RegistrationTabs
          mode={registration.state.mode}
          onModeChange={registration.updateMode}
          onKeyDown={registration.handleRegistrationTabKeyDown}
        />
        <BulkImportPanel
          state={registration.state}
          fileInputId={registration.fileInputId}
          formatSelectId={registration.formatSelectId}
          busy={registration.busy}
          onSubmit={registration.handleProcessFile}
          onFileChange={registration.handleFileChange}
          onDragEnter={registration.handleDragEnter}
          onDragOver={registration.handleDragOver}
          onDragLeave={registration.handleDragLeave}
          onDrop={registration.handleDrop}
          onFormatChange={registration.handleFormatChange}
          onCancel={registration.navigateToProducts}
        />
        <SingleProductForm
          mode={registration.state.mode}
          draft={registration.productDraft}
          onSubmit={registration.handleSingleSubmit}
          onDraftChange={registration.updateDraft}
          onCancel={registration.navigateToProducts}
        />
      </section>
      <RecentProductsTable products={registration.recentProducts} />
      <ProductRegistrationDialogs
        previewItems={registration.state.previewItems}
        status={registration.state.status}
        successModal={registration.successModal}
        closingModal={registration.closingModal}
        modalPrimaryRef={registration.modalPrimaryRef}
        onClosePreview={registration.requestPreviewClose}
        onRegisterProducts={registration.handleRegisterProducts}
        onReviewFirstProduct={registration.reviewFirstProduct}
        onCloseSuccess={registration.requestSuccessClose}
        onBackToProducts={registration.closeSuccessAndNavigate}
      />
    </section>
  );
}

export default ProductsRegistration;
