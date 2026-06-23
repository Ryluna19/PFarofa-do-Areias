import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useCarrinho } from "../context/CarrinhoContext";

export default function DemoCheckout() {
const navigate = useNavigate();

const {
subtotal,
enderecoEntrega,
setEnderecoEntrega,
} = useCarrinho();

const taxaEntrega = 5;
const [usarGps, setUsarGps] = useState(false);

const handleGps = () => {
setUsarGps(true);


setTimeout(() => {
  setEnderecoEntrega({
    rua: "Rua Farofa das Areias",
    numero: "247",
    complemento: "Bloco B, Ap 12",
    bairro: "Jardim das Areias",
    cidade: "Rio de Janeiro",
    cep: "22999-001",
  });
}, 1200);


};

const enderecoValido =
enderecoEntrega.rua &&
enderecoEntrega.numero &&
enderecoEntrega.bairro;

return ( <div className="px-4 py-5 space-y-5"> <div> <p className="text-zinc-100 font-black text-lg mb-1">
Endereço de Entrega </p>

```
    <p className="text-zinc-500 text-xs">
      Informe onde deseja receber seu pedido
    </p>
  </div>

  <button
    onClick={handleGps}
    className="w-full flex items-center gap-3 py-3 px-4 bg-zinc-900 border border-zinc-700 hover:border-orange-500 rounded-2xl transition-colors text-sm text-zinc-300 font-semibold"
  >
    <MapPin className="w-5 h-5 text-orange-500" />

    {usarGps
      ? "📍 Localização capturada!"
      : "Usar localização atual (GPS)"}
  </button>

  <div className="space-y-3">
    {[
      { label: "CEP", key: "cep", placeholder: "00000-000" },
      { label: "Rua", key: "rua", placeholder: "Av. Atlântica" },
      { label: "Número", key: "numero", placeholder: "1702" },
      {
        label: "Complemento",
        key: "complemento",
        placeholder: "Apto (opcional)",
      },
      { label: "Bairro", key: "bairro", placeholder: "Copacabana" },
      { label: "Cidade", key: "cidade", placeholder: "Cidade" },
    ].map(({ label, key, placeholder }) => (
      <div key={key}>
        <label className="text-zinc-400 text-xs font-semibold mb-1 block">
          {label}
        </label>

        <input
          value={enderecoEntrega[key]}
          onChange={(event) =>
            setEnderecoEntrega((prev) => ({
              ...prev,
              [key]: event.target.value,
            }))
          }
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
        />
      </div>
    ))}
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm space-y-1">
    <div className="flex justify-between text-zinc-400">
      <span>Subtotal</span>
      <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
    </div>

    <div className="flex justify-between text-zinc-400">
      <span>Entrega</span>
      <span>R$ 5,00</span>
    </div>

    <div className="flex justify-between text-white font-black text-base pt-2 border-t border-zinc-800">
      <span>Total</span>

      <span className="text-orange-400">
        R$ {(subtotal + taxaEntrega).toFixed(2).replace(".", ",")}
      </span>
    </div>
  </div>

  <button
    disabled={!enderecoValido}
    onClick={() => navigate("/pagamento")}
    className={`w-full py-4 rounded-2xl font-black text-base transition-all ${
      enderecoValido
        ? "bg-orange-600 hover:bg-orange-500 text-white"
        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
    }`}
  >
    Ir para Pagamento →
  </button>
</div>


);
}
