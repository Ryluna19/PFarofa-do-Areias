import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, QrCode, DollarSign, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { createOrder } from "../lib/dataService";
import { useCarrinho } from "../context/CarrinhoContext";

const metodos = [
  {
    id: "cartao",
    label: "Cartão de Crédito/Débito",
    icon: CreditCard,
    desc: "Use um cartão salvo ou cadastre um novo",
  },
  {
    id: "pix",
    label: "Pix",
    icon: QrCode,
    desc: "Pagamento instantâneo",
  },
  {
    id: "dinheiro",
    label: "Dinheiro na Entrega",
    icon: DollarSign,
    desc: "Informe se precisa de troco",
  },
];

const cartoesSalvos = [
  {
    id: "card-1",
    bandeira: "Visa",
    final: "4821",
    nome: "Cliente",
  },
  {
    id: "card-2",
    bandeira: "Mastercard",
    final: "9034",
    nome: "Cliente",
  },
];

function formatarMoeda(valor) {
  return valor.toFixed(2).replace(".", ",");
}

function parseValor(valor) {
  return Number(String(valor).replace(",", "."));
}

export default function DemoPagamento() {
  const navigate = useNavigate();
  const { itens, subtotal, limparCarrinho, enderecoEntrega } = useCarrinho();

  const taxaEntrega = 5;
  const total = subtotal + taxaEntrega;

  const [metodo, setMetodo] = useState("pix");
  const [processando, setProcessando] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);

  const [cartaoModo, setCartaoModo] = useState("salvo");
  const [cartaoSelecionado, setCartaoSelecionado] = useState("card-1");
  const [novoCartao, setNovoCartao] = useState({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
  });

  const [dinheiroOpcao, setDinheiroOpcao] = useState("sem_troco");
  const [trocoPara, setTrocoPara] = useState("");

  const criarPedidoMutation = useMutation({ mutationFn: createOrder });

  const precisaTroco = metodo === "dinheiro" && dinheiroOpcao === "troco";
  const valorTroco = parseValor(trocoPara);
  const trocoValido = !precisaTroco || valorTroco >= total;
  const valorTrocoCalculado = precisaTroco && trocoValido ? valorTroco - total : 0;

  const cartaoNovoValido =
    novoCartao.numero.replace(/\D/g, "").length >= 13 &&
    novoCartao.nome.trim().length >= 3 &&
    novoCartao.validade.trim().length >= 4 &&
    novoCartao.cvv.trim().length >= 3;

  const cartaoValido =
    metodo !== "cartao" ||
    (cartaoModo === "salvo" && cartaoSelecionado) ||
    (cartaoModo === "novo" && cartaoNovoValido);

  const pagamentoValido = cartaoValido && trocoValido;

  const handleNovoCartaoChange = (campo, valor) => {
    setNovoCartao((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const getPaymentDetails = () => {
    if (metodo === "pix") {
      return {
        type: "pix",
        pix_key: "farofadoareias@pix.com.br",
      };
    }

    if (metodo === "cartao") {
      if (cartaoModo === "salvo") {
        const cartao = cartoesSalvos.find((item) => item.id === cartaoSelecionado);

        return {
          type: "card",
          mode: "saved_card",
          brand: cartao?.bandeira,
          last_digits: cartao?.final,
        };
      }

      return {
        type: "card",
        mode: "new_card",
        cardholder_name: novoCartao.nome,
        last_digits: novoCartao.numero.replace(/\D/g, "").slice(-4),
      };
    }

    return {
      type: "cash",
      needs_change: dinheiroOpcao === "troco",
      change_for: dinheiroOpcao === "troco" ? valorTroco : null,
      change_value: dinheiroOpcao === "troco" ? valorTrocoCalculado : 0,
    };
  };

  const handleConfirmar = () => {
    if (!pagamentoValido) {
      return;
    }

    setProcessando(true);

    criarPedidoMutation.mutate(
      {
        items: itens.map((item) => ({
          name: item.nome || item.name,
          emoji: item.emoji,
          price: item.preco !== undefined ? item.preco : item.price,
          quantity: item.quantidade,
          personalizacao: item.personalizacao,
        })),
        subtotal,
        delivery_fee: taxaEntrega,
        total,
        payment_method: metodo,
        payment_details: getPaymentDetails(),
        address: enderecoEntrega,
        status: "confirmed",
      },
      {
        onSuccess: (pedido) => {
          limparCarrinho();
          navigate(`/rastreio?pedido=${pedido.id}`);
        },
        onError: () => {
          setProcessando(false);
        },
      }
    );
  };

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <p className="text-zinc-100 font-black text-lg mb-1">
          Forma de Pagamento
        </p>
        <p className="text-zinc-500 text-xs">
          Escolha como deseja pagar seu pedido
        </p>
      </div>

      <div className="space-y-2">
        {metodos.map((item) => (
          <button
            key={item.id}
            onClick={() => setMetodo(item.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${metodo === item.id
              ? "border-orange-500 bg-orange-600/10"
              : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
              }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${metodo === item.id ? "bg-orange-600" : "bg-zinc-800"
                }`}
            >
              <item.icon className="w-5 h-5 text-white" />
            </div>

            <div>
              <p
                className={`text-sm font-bold ${metodo === item.id ? "text-orange-300" : "text-zinc-300"
                  }`}
              >
                {item.label}
              </p>
              <p className="text-xs text-zinc-500">{item.desc}</p>
            </div>

            <div
              className={`ml-auto w-4 h-4 rounded-full border-2 ${metodo === item.id
                ? "border-orange-500 bg-orange-500"
                : "border-zinc-600"
                }`}
            />
          </button>
        ))}
      </div>

      {metodo === "pix" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center space-y-3">
          <p className="text-zinc-300 text-sm font-bold">
            Escaneie o QR Code ou copie a chave
          </p>

          <div className="w-32 h-32 mx-auto bg-white rounded-xl flex items-center justify-center">
            <QrCode className="w-20 h-20 text-zinc-900" />
          </div>

          <p className="text-xs text-zinc-500 font-mono">
            farofadoareias@pix.com.br
          </p>

          <button
            onClick={() => {
              navigator.clipboard?.writeText("farofadoareias@pix.com.br");
              setPixCopiado(true);
              setTimeout(() => setPixCopiado(false), 2000);
            }}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold"
          >
            {pixCopiado ? "✓ Copiado!" : "Copiar chave Pix"}
          </button>
        </div>
      )}

      {metodo === "cartao" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-zinc-100 text-sm font-black mb-1">
              Dados do Cartão
            </p>
            <p className="text-zinc-500 text-xs">
              Selecione um cartão salvo ou adicione um novo para esta compra.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCartaoModo("salvo")}
              className={`py-2.5 rounded-xl text-sm font-bold border ${cartaoModo === "salvo"
                ? "border-orange-500 bg-orange-600/20 text-orange-300"
                : "border-zinc-700 bg-zinc-800 text-zinc-400"
                }`}
            >
              Cartão salvo
            </button>

            <button
              onClick={() => setCartaoModo("novo")}
              className={`py-2.5 rounded-xl text-sm font-bold border ${cartaoModo === "novo"
                ? "border-orange-500 bg-orange-600/20 text-orange-300"
                : "border-zinc-700 bg-zinc-800 text-zinc-400"
                }`}
            >
              Novo cartão
            </button>
          </div>

          {cartaoModo === "salvo" && (
            <div className="space-y-2">
              {cartoesSalvos.map((cartao) => (
                <button
                  key={cartao.id}
                  onClick={() => setCartaoSelecionado(cartao.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between ${cartaoSelecionado === cartao.id
                    ? "border-orange-500 bg-orange-600/10"
                    : "border-zinc-800 bg-zinc-950"
                    }`}
                >
                  <div>
                    <p className="text-zinc-100 text-sm font-bold">
                      {cartao.bandeira} final {cartao.final}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      Titular: {cartao.nome}
                    </p>
                  </div>

                  <span
                    className={`w-4 h-4 rounded-full border-2 ${cartaoSelecionado === cartao.id
                      ? "border-orange-500 bg-orange-500"
                      : "border-zinc-600"
                      }`}
                  />
                </button>
              ))}
            </div>
          )}

          {cartaoModo === "novo" && (
            <div className="space-y-3">
              <input
                value={novoCartao.numero}
                onChange={(e) => handleNovoCartaoChange("numero", e.target.value)}
                placeholder="Número do cartão"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
              />

              <input
                value={novoCartao.nome}
                onChange={(e) => handleNovoCartaoChange("nome", e.target.value)}
                placeholder="Nome impresso no cartão"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={novoCartao.validade}
                  onChange={(e) =>
                    handleNovoCartaoChange("validade", e.target.value)
                  }
                  placeholder="MM/AA"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
                />

                <input
                  value={novoCartao.cvv}
                  onChange={(e) => handleNovoCartaoChange("cvv", e.target.value)}
                  placeholder="CVV"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
                />
              </div>

              {!cartaoNovoValido && (
                <p className="text-xs text-zinc-500">
                  Preencha os dados do cartão para continuar. Este cadastro é
                  apenas visual para a demo.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {metodo === "dinheiro" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-zinc-100 text-sm font-black mb-1">
              Pagamento em Dinheiro
            </p>
            <p className="text-zinc-500 text-xs">
              Informe se o entregador precisa levar troco.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDinheiroOpcao("sem_troco")}
              className={`py-2.5 rounded-xl text-sm font-bold border ${dinheiroOpcao === "sem_troco"
                ? "border-orange-500 bg-orange-600/20 text-orange-300"
                : "border-zinc-700 bg-zinc-800 text-zinc-400"
                }`}
            >
              Sem troco
            </button>

            <button
              onClick={() => setDinheiroOpcao("troco")}
              className={`py-2.5 rounded-xl text-sm font-bold border ${dinheiroOpcao === "troco"
                ? "border-orange-500 bg-orange-600/20 text-orange-300"
                : "border-zinc-700 bg-zinc-800 text-zinc-400"
                }`}
            >
              Preciso de troco
            </button>
          </div>

          {dinheiroOpcao === "troco" && (
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-semibold block">
                Troco para quanto?
              </label>

              <input
                value={trocoPara}
                onChange={(e) => setTrocoPara(e.target.value)}
                placeholder="Ex: 100"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
              />

              {!trocoValido && (
                <p className="text-xs text-red-400">
                  O valor do troco precisa ser maior ou igual ao total do pedido.
                </p>
              )}

              {trocoValido && trocoPara && (
                <p className="text-xs text-green-400">
                  Troco estimado: R$ {formatarMoeda(valorTrocoCalculado)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center">
        <span className="text-zinc-400 text-sm">Total</span>
        <span className="text-orange-400 font-black text-xl">
          R$ {formatarMoeda(total)}
        </span>
      </div>

      <button
        onClick={handleConfirmar}
        disabled={
          !pagamentoValido || processando || criarPedidoMutation.isPending
        }
        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processando || criarPedidoMutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          "Confirmar Pedido →"
        )}
      </button>
    </div>
  );
}