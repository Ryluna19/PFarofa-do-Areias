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
    <div className="grid grid-cols-3 py-2.5 border-t border-zinc-800 bg-zinc-900 shrink-0">
      <button
        onClick={onGoHome}
        className={`flex flex-col items-center gap-1 ${
          isHome ? "text-orange-400" : "text-zinc-400"
        }`}
      >
        {" "}
        <Home className="w-5 h-5" />{" "}
        <span className="text-xs font-medium">Início</span>{" "}
      </button>
      <button
        onClick={onGoMenu}
        className={`flex flex-col items-center gap-1 ${
          isCardapio ? "text-orange-400" : "text-zinc-400"
        }`}
      >
        <Menu className="w-5 h-5" />
        <span className="text-xs font-medium">Cardápio</span>
      </button>

      <button
        onClick={onGoProfile}
        className={`flex flex-col items-center gap-1 ${
          isPerfil ? "text-orange-400" : "text-zinc-400"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-xs font-medium">Meus dados</span>
      </button>
    </div>
  );
}
