import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { SidebarProps } from "@/types/sidebar.types";
import styles from "./style.module.css";
import mottainaiLogoWhite from "@/assets/icons/Logo-White.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faChartPie,
  faBox,
  faWarehouse,
  faMoneyBill,
  faGear,
  faUser,
  faArrowRightFromBracket,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

function Sidebar({ overviewPaths }: SidebarProps) {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const isOverviewFlowActive = overviewPaths.includes(normalizedPathname);
  const isProductsFlowActive =
    ["/products", "/productsRegistration"].includes(normalizedPathname) ||
    normalizedPathname.startsWith("/products/");
  const isStockFlowActive =
    normalizedPathname === "/stock" || normalizedPathname.startsWith("/stock/");
  const isAccountingFlowActive =
    normalizedPathname === "/managementReports" || normalizedPathname === "/accounting/sped";

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button
        ref={menuButtonRef}
        type="button"
        className={`${styles["menu-toggle"]} ${isOpen ? styles["menu-toggle-open"] : ""}`}
        aria-label={
          isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"
        }
        aria-expanded={isOpen}
        aria-controls="sidebar"
        onClick={() => setIsOpen((open) => !open)}
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faBars} aria-hidden="true" />
      </button>

      {isOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Fechar menu de navegação"
          onClick={closeSidebar}
        />
      )}

      <nav
        id="sidebar"
        className={`${styles.sidebar} ${isOpen ? styles["sidebar-open"] : ""}`}
        aria-label="Navegação principal"
      >
        <div className={styles["sidebar-logo"]}>
          <span className={styles.icon} aria-hidden="true">
            <img src={mottainaiLogoWhite} alt="Logo do Mottainai" />
          </span>

          <span className={styles.text}>Mottainai</span>
        </div>

        <div className={styles["sidebar-nav"]}>
          <h2 id="group-pages" className={styles["sidebar-group-title"]}>
            Páginas
          </h2>
          <ul className={styles["sidebar-group"]} aria-labelledby="group-pages">
            <li>
              <NavLink
                to="/home"
                className={styles["sidebar-item"]}
                onClick={closeSidebar}
              >
                <span className={styles.icon} aria-hidden="true">
                  <FontAwesomeIcon icon={faHouse} />
                </span>
                <span className={styles.text}>Início</span>
              </NavLink>
            </li>
            <li>
              <Link
                to="/overview"
                className={styles["sidebar-item"]}
                aria-current={isOverviewFlowActive ? "location" : undefined}
                onClick={closeSidebar}
              >
                <span className={styles.icon} aria-hidden="true">
                  <FontAwesomeIcon icon={faChartPie} />
                </span>
                <span className={styles.text}>Visão Geral</span>
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className={styles["sidebar-item"]}
                aria-current={isProductsFlowActive ? "location" : undefined}
                onClick={closeSidebar}
              >
                <span className={styles.icon} aria-hidden="true">
                  <FontAwesomeIcon icon={faBox} />
                </span>
                <span className={styles.text}>Produtos</span>
              </Link>
            </li>
            <li>
              <Link
                to="/stock"
                className={styles["sidebar-item"]}
                aria-current={isStockFlowActive ? "location" : undefined}
                onClick={closeSidebar}
              >
                <span className={styles.icon} aria-hidden="true">
                  <FontAwesomeIcon icon={faWarehouse} />
                </span>
                <span className={styles.text}>Estoque</span>
              </Link>
            </li>
            <li>
              <Link
                to="/managementReports"
                className={styles["sidebar-item"]}
                aria-current={isAccountingFlowActive ? "location" : undefined}
                onClick={closeSidebar}
              >
                <span className={styles.icon} aria-hidden="true">
                  <FontAwesomeIcon icon={faMoneyBill} />
                </span>
                <span className={styles.text}>Contabilidade/SPED</span>
              </Link>
            </li>
            <li>
              <NavLink
                to="/users"
                className={styles["sidebar-item"]}
                onClick={closeSidebar}
              >
                <span className={styles.icon} aria-hidden="true">
                  <FontAwesomeIcon icon={faGear} />
                </span>
                <span className={styles.text}>Configurações</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <footer className={styles["sidebar-footer"]}>
          <div className={styles["footer-buttons"]}>
            <NavLink
              to="/account"
              id="sidebar-account"
              className={styles["sidebar-account"]}
              onClick={closeSidebar}
            >
              <span className={styles.icon} aria-hidden="true">
                <FontAwesomeIcon icon={faUser} />
              </span>

              <span className={styles.text}>Conta</span>
            </NavLink>

            <button
              type="button"
              className={styles["sidebar-logout"]}
              aria-label="Sair da conta"
              onClick={logout}
            >
              <span className={styles.icon} aria-hidden="true">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </span>

              <span className={styles.text}>Sair da conta?</span>
            </button>
          </div>
        </footer>
      </nav>
    </>
  );
}

export default Sidebar;
