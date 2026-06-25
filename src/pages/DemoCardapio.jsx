import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../lib/dataService";
import CustomizationModal from "../components/catalog/CustomizationModal";

import { useCarrinho } from "../context/CarrinhoContext";

const categorias = ["Farofas", "Acompanhamentos", "Bebidas"];

export default function DemoCardapio() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Farofas");
  const [produtoPersonalizando, setProdutoPersonalizando] = useState(null);
  const [adicionadoId, setAdicionadoId] = useState(null);
  const { adicionarItem } = useCarrinho();

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const handleAdicionar = (produto) => {
    if (produto.has_customization) {
      setProdutoPersonalizando(produto);
    } else {
      adicionarItem(produto, {});
      setAdicionadoId(produto.id);
      setTimeout(() => setAdicionadoId(null), 1000);
    }
  };

  const filtrados = produtos.filter((p) => p.category === categoriaAtiva);

  return (
    <div className="pb-4">
      <div className="bg-gradient-to-br from-orange-700 to-red-800 px-4 py-5">
        <p className="text-orange-200 text-xs mb-1">
          🕐 Entrega: 30–45 min · Taxa: R$ 5,00
        </p>
        <p className="text-white text-sm font-semibold">
          Peça agora e receba em casa!
        </p>
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${categoriaAtiva === cat ? "bg-orange-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
          </div>
        )}
        {filtrados.map((produto) => (
          <div
            key={produto.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-3 items-start"
          >
            <span className="text-4xl shrink-0">{produto.emoji}</span>
            <div className="flex-1">
              <p className="text-zinc-100 font-bold text-sm">{produto.name}</p>
              <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                {produto.description}
              </p>
              <p className="text-orange-400 font-black text-base mt-2">
                R$ {produto.price.toFixed(2).replace(".", ",")}
              </p>
            </div>
            <button
              onClick={() => handleAdicionar(produto)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-colors mt-1 ${adicionadoId === produto.id ? "bg-green-600" : "bg-orange-600 hover:bg-orange-500"}`}
            >
              {adicionadoId === produto.id ? "✓" : <Plus className="w-5 h-5" />}
            </button>
          </div>
        ))}
      </div>

      {produtoPersonalizando && (
        <CustomizationModal
          produto={produtoPersonalizando}
          onClose={() => setProdutoPersonalizando(null)}
        />
      )}
    </div>
  );
}
