import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FolderNavigation from "@/components/FolderNavigation";
import { FOLDER_NAVIGATION_PATHS } from "@/config/folder-navigation";
import styles from "./style.module.css";

const PAGE_TITLES: Record<string, string> = {
  "/home": "Início",
  "/overview": "Visão Geral",
  "/users": "Usuários",
  "/passwordRecovery": "Recuperação de Senha",
  "/productTransfer": "Transferência de Produtos",
  "/products": "Produtos",
  "/settings": "Configurações",
  "/usageHistory": "Histórico de Uso",
  "/expiringProducts": "Produtos a Vencer",
  "/productsRegistration": "Cadastro de Produtos",
};

function MainLayout() {
  const { pathname } = useLocation();
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const pageTitle = normalizedPathname.startsWith("/products/")
    ? "Detalhes do Produto"
    : (PAGE_TITLES[normalizedPathname] ?? "Mottainai");
  const showFolderNavigation =
    FOLDER_NAVIGATION_PATHS.includes(normalizedPathname);

  return (
    <div className={styles.layout}>
      <a className={styles["skip-link"]} href="#main-content">
        Pular para o conteúdo principal
      </a>
      <Sidebar />
      <div className={styles["content-shell"]}>
        <Header pageTitle={pageTitle} />
        {showFolderNavigation && <FolderNavigation />}
        <main
          className={`${styles.content} ${showFolderNavigation ? styles["content-with-folders"] : ""}`}
          id="main-content"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
