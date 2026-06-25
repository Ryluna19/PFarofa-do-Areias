import { ChevronLeft, ExternalLink, ShoppingCart } from "lucide-react";

export default function AppHeader({
  isAdmin,
  isHome,
  totalItens,
  onBack,
  onGoHome,
  onOpenCart,
}) {
  return (
    <>
      {" "}
      <div className="bg-zinc-900 px-4 py-1 flex justify-between items-center">
        {" "}
        <span className="text-zinc-500 text-xs">9:41</span>{" "}
        <span className="text-zinc-500 text-xs">●●●●○</span>{" "}
      </div>
      <nav className="bg-gradient-to-r from-orange-600 to-red-700 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {!isHome && !isAdmin && (
            <button
              onClick={onBack}
              className="shrink-0 text-white"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onGoHome}
            className="flex items-center gap-2 min-w-0 text-white"
            aria-label="Ir para o início"
          >
            <span className="text-xl shrink-0">🥘</span>

            <span className="font-black text-sm truncate">
              Farofa do Areias
            </span>
          </button>
        </div>

        {isAdmin ? (
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white text-xs font-bold border border-white/30 hover:bg-white/10 rounded-lg px-3 py-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver loja
          </a>
        ) : (
          <button
            onClick={onOpenCart}
            className="relative shrink-0 text-white"
            aria-label="Abrir carrinho"
          >
            <ShoppingCart className="w-5 h-5" />

            {totalItens > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-orange-600 text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItens}
              </span>
            )}
          </button>
        )}
      </nav>
    </>
  );
}
