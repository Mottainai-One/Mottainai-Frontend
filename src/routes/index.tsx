import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ErrorPage from "@/pages/ErrorPage";
import PrivateRoute from "@/pages/PrivateRoute";
import Overview from "@/pages/Overview";
import Users from "@/pages/Users";
import PasswordRecovery from "@/pages/PasswordRecovery";
import ProductTransfer from "@/pages/ProductTransfer";
import UsageHistory from "@/pages/UsageHistory";
import Settings from "@/pages/Settings";
import App from "@/App"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas de Login */}
        <Route path="/" element={<App/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/app" element={<App/>}/>

        {/* Rotas Privadas */}
        <Route element={<PrivateRoute/>}>
          <Route path="/overview" element={<Overview/>}/>
          <Route path="/users" element={<Users/>}/>
          <Route path="/passwordRecovery" element={<PasswordRecovery/>}/>
          <Route path="/productTransfer" element={<ProductTransfer/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/usageHistory" element={<UsageHistory/>}/>
        </Route>

        {/* Um 'else' para erros */}
        <Route path="*" element={<ErrorPage/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}