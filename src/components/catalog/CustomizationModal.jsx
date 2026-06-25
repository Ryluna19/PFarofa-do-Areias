import { useState } from "react";
import { X, Check } from "lucide-react";
import { useCarrinho } from "../../context/CarrinhoContext";


const tiposFarinha = ["Mandioca Torrada", "Mandioca Crua", "Milho", "Integral"];

const ingredientes = [
  { id: "bacon", label: "Bacon", emoji: "🥓" },
  { id: "ovo", label: "Ovo Mexido", emoji: "🍳" },
  { id: "cebolinha", label: "Cebolinha", emoji: "🌿" },
  { id: "azeitona", label: "Azeitona", emoji: "🟢" },
  { id: "calabresa", label: "Calabresa", emoji: "🥩" },
  { id: "pimentao", label: "Pimentão", emoji: "🌶️" },
  { id: "couve", label: "Couve", emoji: "🥬" },
  { id: "tomate", label: "Tomate Seco", emoji: "🍅" },
];

export default function CustomizationModal({ produto, onClose }) {
  const [farinhaSelecionada, setFarinhaSelecionada] =
    useState("Mandioca Torrada");
  const [ingredientesSelecionados, setIngredientesSelecionados] = useState([
    "bacon",
    "ovo",
    "cebolinha",
  ]);
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const { adicionarItem } = useCarrinho();

  const toggleIngrediente = (id) => {
    setIngredientesSelecionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleAdicionar = () => {
    for (let i = 0; i < quantidade; i++) {
      adicionarItem(produto, {
        farinha: farinhaSelecionada,
        ingredientes: ingredientesSelecionados,
      });
    }
    setAdicionado(true);
    setTimeout(onClose, 800);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-black text-lg">
              {produto.name || produto.nome}
            </p>
            <p className="text-orange-400 font-bold">
              R$ {(produto.price || produto.preco).toFixed(2).replace(".", ",")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-5">
          <p className="text-zinc-300 text-sm font-bold mb-2">
            Tipo de Farinha <span className="text-orange-500">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {tiposFarinha.map((f) => (
              <button
                key={f}
                onClick={() => setFarinhaSelecionada(f)}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${farinhaSelecionada === f ? "border-orange-500 bg-orange-600/20 text-orange-300" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-zinc-300 text-sm font-bold mb-2">
            Ingredientes (personalize à vontade)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ingredientes.map((ing) => {
              const selecionado = ingredientesSelecionados.includes(ing.id);
              return (
                <button
                  key={ing.id}
                  onClick={() => toggleIngrediente(ing.id)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-xl border text-sm transition-all ${selecionado ? "border-orange-500 bg-orange-600/20 text-orange-300" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}
                >
                  <span>{ing.emoji}</span>
                  <span className="flex-1 text-left">{ing.label}</span>
                  {selecionado && <Check className="w-3 h-3 text-orange-400" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-zinc-300 text-sm font-bold">Quantidade</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold hover:bg-zinc-700"
            >
              −
            </button>
            <span className="text-white font-bold w-4 text-center">
              {quantidade}
            </span>
            <button
              onClick={() => setQuantidade((q) => q + 1)}
              className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-500"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAdicionar}
          className={`w-full py-4 rounded-2xl font-black text-base transition-all ${adicionado ? "bg-green-600 text-white" : "bg-orange-600 hover:bg-orange-500 text-white"}`}
        >
          {adicionado
            ? "✓ Adicionado ao carrinho!"
            : `Adicionar · R$ ${((produto.price || produto.preco) * quantidade).toFixed(2).replace(".", ",")}`}
        </button>
      </div>
    </div>
  );
}
