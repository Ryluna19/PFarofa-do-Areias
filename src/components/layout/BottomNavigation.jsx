import { Home, Menu, User } from "lucide-react";

export default function BottomNavigation({
  isHome,
  isCardapio,
  isPerfil,
  onGoHome,
  onGoMenu,
  onGoProfile,
}) {
  return (
    <div className="grid grid-cols-3 py-2 border-t border-zinc-800 bg-zinc-900 shrink-0">
      <button
        onClick={onGoHome}
        className={`flex flex-col items-center gap-0.5 ${
          isHome ? "text-orange-400" : "text-zinc-500"
        }`}
      >
        {" "}
        <Home className="w-5 h-5" />{" "}
        <span className="text-[10px]">Início</span>{" "}
      </button>

      <button
        onClick={onGoMenu}
        className={`flex flex-col items-center gap-0.5 ${
          isCardapio ? "text-orange-400" : "text-zinc-500"
        }`}
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px]">Cardápio</span>
      </button>

      <button
        onClick={onGoProfile}
        className={`flex flex-col items-center gap-0.5 ${
          isPerfil ? "text-orange-400" : "text-zinc-500"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px]">Perfil</span>
      </button>
    </div>
  );
}
