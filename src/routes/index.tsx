import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ErrorPage from "@/pages/ErrorPage";
import PrivateRoute from "@/pages/PrivateRoute";
import Overview from "@/pages/Overview";
import Users from "@/pages/Users";
import ExpiringProducts from "@/pages/ExpiringProducts";
import PasswordRecovery from "@/pages/PasswordRecovery";
import ProductTransfer from "@/pages/ProductTransfer";
import UsageHistory from "@/pages/UsageHistory";
import ProductsRegistration from "@/pages/ProductsRegistration";
import Settings from "@/pages/Settings";
import MainLayout from "@/components/MainLayout";
import NewPassword from "@/pages/NewPassword";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import ManagementReports from "@/pages/ManagementReports";
import Stock from "@/pages/Stock";
import StockSectionPlaceholder from "@/pages/StockSectionPlaceholder";
import CashClosingReport from "@/pages/CashClosingReport";
import StockTransfers from "@/pages/StockTransfers";
import NewTransfer from "@/pages/NewTransfer";
import Suppliers from "@/pages/Suppliers";
import SupplierForm from "@/pages/SupplierForm";
import StockAdjustments from "@/pages/StockAdjustments";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas de Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Fluxo público de recuperação de senha */}
        <Route path="/passwordRecovery" element={<PasswordRecovery />} />
        <Route path="/newPassword" element={<NewPassword />} />

        {/* Rotas Privadas */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/home" element={<Home />} />
            <Route path="/users" element={<Users />} />
            <Route path="/productTransfer" element={<ProductTransfer />} />
            <Route path="/usageHistory" element={<UsageHistory />} />
            <Route path="/expiringProducts" element={<ExpiringProducts />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<ProductDetails />} />
            <Route path="/stock" element={<Stock />} />
            <Route
              path="/stock/cash-closing/:discrepancyId"
              element={<CashClosingReport />}
            />
            <Route
              path="/stock/counts/new"
              element={
                <StockSectionPlaceholder
                  title="Nova contagem"
                  description="Este é o ponto de entrada para registrar uma nova contagem de estoque."
                />
              }
            />
            <Route
              path="/stock/damages"
              element={<StockAdjustments />}
            />
            <Route
              path="/stock/transfers"
              element={<StockTransfers />}
            />
            <Route path="/stock/transfers/new" element={<NewTransfer />} />
            <Route
              path="/stock/suppliers"
              element={<Suppliers />}
            />
            <Route path="/stock/suppliers/new" element={<SupplierForm />} />
            <Route path="/managementReports" element={<ManagementReports />} />
            <Route
              path="/productsRegistration"
              element={<ProductsRegistration />}
            />
            <Route path="/account" element={<Settings />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Um 'else' para erros */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
