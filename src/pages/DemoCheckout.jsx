import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useCarrinho } from "../context/CarrinhoContext";

export default function DemoCheckout() {
  const navigate = useNavigate();
  const { subtotal } = useCarrinho();
  const taxaEntrega = 5.00;
  const [endereco, setEndereco] = useState({ rua: "", numero: "", complemento: "", bairro: "", cidade: "Rio de Janeiro", cep: "" });
  const [usarGps, setUsarGps] = useState(false);
  const handleGps = () => { setUsarGps(true); setTimeout(() => { setEndereco({ rua: "Rua Farofa das Areias", numero: "247", complemento: "Bloco B, Ap 12", bairro: "Jardim das Areias", cidade: "Rio de Janeiro", cep: "22999-001" }); }, 1200); };
  const ok = endereco.rua && endereco.numero && endereco.bairro;

  return (
    <div className="px-4 py-5 space-y-5">
      <div><p className="text-zinc-100 font-black text-lg mb-1">Endereço de Entrega</p><p className="text-zinc-500 text-xs">Informe onde deseja receber seu pedido</p></div>
      <button onClick={handleGps} className="w-full flex items-center gap-3 py-3 px-4 bg-zinc-900 border border-zinc-700 hover:border-orange-500 rounded-2xl transition-colors text-sm text-zinc-300 font-semibold"><MapPin className="w-5 h-5 text-orange-500" />{usarGps ? "📍 Localização capturada!" : "Usar localização atual (GPS)"}</button>
      <div className="space-y-3">
        {[{ label: "CEP", key: "cep", ph: "00000-000" }, { label: "Rua", key: "rua", ph: "Av. Atlântica" }, { label: "Número", key: "numero", ph: "1702" }, { label: "Complemento", key: "complemento", ph: "Apto (opcional)" }, { label: "Bairro", key: "bairro", ph: "Copacabana" }, { label: "Cidade", key: "cidade", ph: "Cidade" }].map(({ label, key, placeholder: ph }) => (<div key={key}><label className="text-zinc-400 text-xs font-semibold mb-1 block">{label}</label><input value={endereco[key]} onChange={e => setEndereco(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} className="w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-600" /></div>))}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm space-y-1"><div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>R$ {subtotal.toFixed(2).replace(".", ",")}</span></div><div className="flex justify-between text-zinc-400"><span>Entrega</span><span>R$ 5,00</span></div><div className="flex justify-between text-white font-black text-base pt-2 border-t border-zinc-800"><span>Total</span><span className="text-orange-400">R$ {(subtotal + taxaEntrega).toFixed(2).replace(".", ",")}</span></div></div>
      <button disabled={!ok} onClick={() => navigate("/pagamento")} className={`w-full py-4 rounded-2xl font-black text-base transition-all ${ok ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}>Ir para Pagamento {'→'}</button>
    </div>
  );
}