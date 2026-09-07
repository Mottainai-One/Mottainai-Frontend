import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ErrorPage from "@/pages/ErrorPage";
import PrivateRoute from "@/pages/PrivateRoute";
import Overview from "@/pages/Overview";
import Users from "@/pages/Users";
import ExpiringProducts from "@/pages/ExpiringProducts"
import PasswordRecovery from "@/pages/PasswordRecovery";
import ProductTransfer from "@/pages/ProductTransfer";
import UsageHistory from "@/pages/UsageHistory";
import ProductsRegistration from "@/pages/ProductsRegistration";
import Settings from "@/pages/Settings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas de Login */}
        <Route path="/" element={<Login/>} />
        <Route path="/login" element={<Login/>} />

        {/* Rotas Privadas */}
        <Route element={<PrivateRoute/>}>
          <Route path="/overview" element={<Overview/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/users" element={<Users/>}/>
          <Route path="/passwordRecovery" element={<PasswordRecovery/>}/>
          <Route path="/productTransfer" element={<ProductTransfer/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/usageHistory" element={<UsageHistory/>}/>
          <Route path="/expiringProducts" element={<ExpiringProducts/>}/>
          <Route path="/productsRegistration" element={<ProductsRegistration/>}/>
        </Route>

        {/* Um 'else' para erros */}
        <Route path="*" element={<ErrorPage/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}