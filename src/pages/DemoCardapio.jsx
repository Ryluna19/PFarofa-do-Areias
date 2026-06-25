import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../lib/dataService";
import { useCarrinho } from "../context/CarrinhoContext";
import CustomizationModal from "../components/catalog/CustomizationModal";

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
      return;
    }

    adicionarItem(produto, {});
    setAdicionadoId(produto.id);

    setTimeout(() => setAdicionadoId(null), 1000);
  };

  const filtrados = produtos.filter(
    (produto) => produto.category === categoriaAtiva,
  );

  return (
    <div className="pb-4 lg:pb-8">
      {" "}
      <div className="bg-gradient-to-br from-orange-700 to-red-800">
        {" "}
        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {" "}
          <p className="text-orange-100 text-sm mb-1">
            🕐 Entrega: 30–45 min · Taxa: R$ 5,00{" "}
          </p>
          <p className="text-white text-base font-semibold">
            Peça agora e receba em casa!
          </p>
        </div>
      </div>
      <div className="flex gap-2 px-4 py-3 overflow-x-auto sm:px-6 lg:px-8">
        {categorias.map((categoria) => (
          <button
            key={categoria}
            onClick={() => setCategoriaAtiva(categoria)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              categoriaAtiva === categoria
                ? "bg-orange-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {categoria}
          </button>
        ))}
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((produto) => (
              <div
                key={produto.id}
                className="h-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex gap-3 items-start"
              >
                <span className="text-4xl shrink-0">{produto.emoji}</span>

                <div className="flex-1">
                  <p className="text-zinc-100 font-bold text-base">
                    {produto.name}
                  </p>

                  <p className="text-zinc-300 text-sm mt-1 leading-relaxed">
                    {produto.description}
                  </p>

                  <p className="text-orange-400 font-black text-lg mt-3">
                    R$ {produto.price.toFixed(2).replace(".", ",")}
                  </p>
                </div>

                <button
                  onClick={() => handleAdicionar(produto)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 transition-colors mt-1 ${
                    adicionadoId === produto.id
                      ? "bg-green-600"
                      : "bg-orange-600 hover:bg-orange-500"
                  }`}
                  aria-label={`Adicionar ${produto.name} ao carrinho`}
                >
                  {adicionadoId === produto.id ? (
                    "✓"
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtrados.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-200 text-sm font-bold">
              Nenhum item disponível nesta categoria.
            </p>
          </div>
        )}
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
