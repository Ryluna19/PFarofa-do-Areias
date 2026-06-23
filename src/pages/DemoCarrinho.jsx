import { useCarrinho } from "../context/CarrinhoContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";

export default function DemoCarrinho() {
  const { itens, alterarQuantidade, removerItem, subtotal } = useCarrinho();
  const navigate = useNavigate();
  const taxaEntrega = 5.00;
  const total = subtotal + taxaEntrega;

  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 px-8 text-center">
        <ShoppingBag className="w-12 h-12 text-zinc-700" />
        <p className="text-zinc-400 font-semibold">Seu carrinho está vazio</p>
        <Link to="/" className="bg-orange-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-orange-500 transition-colors">Ver cardápio</Link>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 space-y-3">
        {itens.map(item => (
          <div key={item.key} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-zinc-100 font-bold text-sm">{item.name || item.nome}</p>
                {item.personalizacao?.farinha && <p className="text-zinc-500 text-xs mt-0.5">Farinha: {item.personalizacao.farinha}</p>}
                {item.personalizacao?.ingredientes?.length > 0 && <p className="text-zinc-600 text-xs">{item.personalizacao.ingredientes.join(", ")}</p>}
                <p className="text-orange-400 font-black text-sm mt-1">R$ {((item.price || item.preco) * item.quantidade).toFixed(2).replace(".", ",")}</p>
              </div>
              <button onClick={() => removerItem(item.key)} className="text-zinc-600 hover:text-red-400 transition-colors mt-1"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center justify-end gap-3 mt-3">
              <button onClick={() => alterarQuantidade(item.key, -1)} className="w-7 h-7 rounded-full bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700">{'−'}</button>
              <span className="text-white font-bold text-sm w-4 text-center">{item.quantidade}</span>
              <button onClick={() => alterarQuantidade(item.key, 1)} className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-sm hover:bg-orange-500">+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mx-4 mt-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2 text-sm">
        <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>R$ {subtotal.toFixed(2).replace(".", ",")}</span></div>
        <div className="flex justify-between text-zinc-400"><span>Taxa de entrega</span><span>R$ {taxaEntrega.toFixed(2).replace(".", ",")}</span></div>
        <div className="flex justify-between text-white font-black text-base pt-2 border-t border-zinc-800"><span>Total</span><span className="text-orange-400">R$ {total.toFixed(2).replace(".", ",")}</span></div>
      </div>
      <div className="px-4 mt-4">
        <button onClick={() => navigate("/checkout")} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl transition-colors">Ir para o Checkout {'→'}</button>
      </div>
    </div>
  );
}