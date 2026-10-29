import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "@/pages/PrivateRoute";
import Spinner from "@/components/Spinner";
import FloatingButton from "@/components/FloatingButton";

const MainLayout = lazy(() => import("@/components/MainLayout"));
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const ErrorPage = lazy(() => import("@/pages/ErrorPage"));
const Overview = lazy(() => import("@/pages/Overview"));
const Users = lazy(() => import("@/pages/Users"));
const ExpiringProducts = lazy(() => import("@/pages/ExpiringProducts"));
const PasswordRecovery = lazy(() => import("@/pages/PasswordRecovery"));
const UsageHistory = lazy(() => import("@/pages/UsageHistory"));
const ProductsRegistration = lazy(() => import("@/pages/ProductsRegistration"));
const NewPassword = lazy(() => import("@/pages/NewPassword"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const ManagementReports = lazy(() => import("@/pages/ManagementReports"));
const AccountingSped = lazy(() => import("@/pages/AccountingSped"));
const Stock = lazy(() => import("@/pages/Stock"));
const CashClosingReport = lazy(() => import("@/pages/CashClosingReport"));
const NewStockCount = lazy(() => import("@/pages/NewStockCount"));
const StockTransfers = lazy(() => import("@/pages/StockTransfers"));
const NewTransfer = lazy(() => import("@/pages/NewTransfer"));
const Suppliers = lazy(() => import("@/pages/Suppliers"));
const SupplierForm = lazy(() => import("@/pages/SupplierForm"));
const StockAdjustments = lazy(() => import("@/pages/StockAdjustments"));
const Account = lazy(() => import("@/pages/Account"));

function page(element: ReactNode) {
  // Cada rota usa o spinner discreto enquanto seu módulo é carregado.
  return <Suspense fallback={<Spinner label="Carregando página" />}>{element}</Suspense>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <>
      <FloatingButton />
      <Routes>
        {/* Rotas de Login */}
        <Route path="/" element={page(<Login />)} />
        <Route path="/login" element={page(<Login />)} />

        {/* Fluxo público de recuperação de senha */}
        <Route path="/passwordRecovery" element={page(<PasswordRecovery />)} />
        <Route path="/newPassword" element={page(<NewPassword />)} />

        {/* Rotas Privadas */}
        <Route element={<PrivateRoute />}>
          <Route element={page(<MainLayout />)}>
            <Route path="/overview" element={page(<Overview />)} />
            <Route path="/home" element={page(<Home />)} />
            <Route path="/users/*" element={page(<Users />)} />
            <Route path="/usageHistory" element={page(<UsageHistory />)} />
            <Route path="/expiringProducts" element={page(<ExpiringProducts />)} />
            <Route path="/products" element={page(<Products />)} />
            <Route path="/products/:productId" element={page(<ProductDetails />)} />
            <Route path="/stock" element={page(<Stock />)} />
            <Route
              path="/stock/cash-closing/:discrepancyId"
              element={page(<CashClosingReport />)}
            />
            <Route
              path="/stock/counts/new"
              element={page(<NewStockCount />)}
            />
            <Route
              path="/stock/damages"
              element={page(<StockAdjustments />)}
            />
            <Route
              path="/stock/transfers"
              element={page(<StockTransfers />)}
            />
            <Route path="/stock/transfers/new" element={page(<NewTransfer />)} />
            <Route
              path="/stock/suppliers"
              element={page(<Suppliers />)}
            />
            <Route path="/stock/suppliers/new" element={page(<SupplierForm />)} />
            <Route path="/managementReports" element={page(<ManagementReports />)} />
            <Route path="/accounting/sped" element={page(<AccountingSped />)} />
            <Route
              path="/productsRegistration"
              element={page(<ProductsRegistration />)}
            />
            <Route path="/account" element={page(<Account />)} />
          </Route>
        </Route>

        {/* Um 'else' para erros */}
        <Route path="*" element={page(<ErrorPage />)} />
      </Routes>
      </>
    </BrowserRouter>
  );
}
