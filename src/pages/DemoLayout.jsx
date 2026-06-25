import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useCarrinho } from "../context/CarrinhoContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import AppHeader from "../components/layout/AppHeader";
import BottomNavigation from "../components/layout/BottomNavigation";
import DemoHome from "./DemoHome";
import DemoCardapio from "./DemoCardapio";
import DemoCarrinho from "./DemoCarrinho";
import DemoCheckout from "./DemoCheckout";
import DemoPagamento from "./DemoPagamento";
import DemoRastreio from "./DemoRastreio";
import DemoPerfil from "./DemoPerfil";
import DemoAdmin from "./DemoAdmin";
import DemoAdminLogin from "./DemoAdminLogin";

export default function DemoLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItens } = useCarrinho();
  const { isAuthenticated } = useAdminAuth();

  const isHome = location.pathname === "/";
  const isCardapio = location.pathname === "/cardapio";
  const isPerfil = location.pathname === "/perfil";
  const isAdmin = location.pathname === "/admin";

  const hideNav = location.pathname === "/rastreio" || isAdmin;

  return (
    <div className="min-h-screen bg-zinc-950 sm:p-4">
      {" "}
      <div className="flex flex-col h-screen bg-zinc-950 sm:h-[calc(100vh-2rem)] sm:max-w-3xl lg:max-w-5xl sm:mx-auto sm:rounded-3xl sm:border sm:border-zinc-800 sm:overflow-hidden sm:shadow-2xl">
        <AppHeader
          isAdmin={isAdmin}
          isHome={isHome}
          totalItens={totalItens}
          onBack={() => navigate(-1)}
          onGoHome={() => navigate("/")}
          onOpenCart={() => navigate("/carrinho")}
        />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DemoHome />} />
            <Route path="/cardapio" element={<DemoCardapio />} />
            <Route path="/carrinho" element={<DemoCarrinho />} />
            <Route path="/checkout" element={<DemoCheckout />} />
            <Route path="/pagamento" element={<DemoPagamento />} />
            <Route path="/rastreio" element={<DemoRastreio />} />
            <Route path="/perfil" element={<DemoPerfil />} />
            <Route
              path="/admin"
              element={isAuthenticated ? <DemoAdmin /> : <DemoAdminLogin />}
            />
          </Routes>
        </div>

        {!hideNav && (
          <BottomNavigation
            isHome={isHome}
            isCardapio={isCardapio}
            isPerfil={isPerfil}
            onGoHome={() => navigate("/")}
            onGoMenu={() => navigate("/cardapio")}
            onGoProfile={() => navigate("/perfil")}
          />
        )}
      </div>
    </div>
  );
}
