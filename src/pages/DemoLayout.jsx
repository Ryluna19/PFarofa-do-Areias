import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, User, ChevronLeft, ClipboardList } from "lucide-react";
import { useCarrinho } from "../context/CarrinhoContext";
import DemoCardapio from "./DemoCardapio";
import DemoCarrinho from "./DemoCarrinho";
import DemoCheckout from "./DemoCheckout";
import DemoPagamento from "./DemoPagamento";
import DemoRastreio from "./DemoRastreio";
import DemoPerfil from "./DemoPerfil";
import DemoAdmin from "./DemoAdmin";
import DemoAdminLogin from "./DemoAdminLogin";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function DemoLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItens } = useCarrinho();
  const { isAuthenticated } = useAdminAuth();

  const isHome = location.pathname === "/";
  const isPerfil = location.pathname === "/perfil";
  const isAdmin = location.pathname === "/admin";
  const hideNav = location.pathname === "/rastreio";

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <div className="bg-zinc-900 px-4 py-1 flex justify-between items-center">
        <span className="text-zinc-500 text-xs">9:41</span>
        <span className="text-zinc-500 text-xs">●●●●○</span>
      </div>

      <nav className="bg-gradient-to-r from-orange-600 to-red-700 px-4 py-2 flex items-center justify-between shrink-0">
        {isHome ? (
          <div className="flex items-center gap-2">
            <span className="text-xl">🥘</span>
            <span className="text-white font-black text-sm">
              Farofa do Areias
            </span>
          </div>
        ) : (
          <button onClick={() => navigate(-1)} className="text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => navigate("/carrinho")}
          className="relative text-white"
        >
          <ShoppingCart className="w-5 h-5" />

          {totalItens > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-orange-600 text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItens}
            </span>
          )}
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DemoCardapio />} />
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
        <div className="grid grid-cols-3 py-2 border-t border-zinc-800 bg-zinc-900 shrink-0">
          <button
            onClick={() => navigate("/")}
            className={`flex flex-col items-center gap-0.5 ${isHome ? "text-orange-400" : "text-zinc-500"
              }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">Cardápio</span>
          </button>

          <button
            onClick={() => navigate("/perfil")}
            className={`flex flex-col items-center gap-0.5 ${isPerfil ? "text-orange-400" : "text-zinc-500"
              }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Perfil</span>
          </button>

          <button
            onClick={() => navigate("/admin")}
            className={`flex flex-col items-center gap-0.5 ${isAdmin ? "text-orange-400" : "text-zinc-500"
              }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px]">Admin</span>
          </button>
        </div>
      )}
    </div>
  );
}