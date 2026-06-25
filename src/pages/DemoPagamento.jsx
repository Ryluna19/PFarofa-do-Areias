import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CreditCard,
  DollarSign,
  Loader2,
  QrCode,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { createOrder } from "../lib/dataService";
import { useCarrinho } from "../context/CarrinhoContext";

const metodos = [
  {
    id: "pix",
    label: "Pix",
    icon: QrCode,
    desc: "Use a chave Pix após confirmar o pedido.",
  },
  {
    id: "cartao",
    label: "Cartão na entrega",
    icon: CreditCard,
    desc: "O entregador leva a maquininha até você.",
  },
  {
    id: "dinheiro",
    label: "Dinheiro na entrega",
    icon: DollarSign,
    desc: "Informe se precisa de troco.",
  },
];

const pixKey = "farofadoareias@pix.com.br";

function formatarMoeda(valor = 0) {
  return Number(valor).toFixed(2).replace(".", ",");
}

function parseValor(valor) {
  return Number(String(valor).replace(",", "."));
}

export default function DemoPagamento() {
  const navigate = useNavigate();

  const { itens, subtotal, limparCarrinho, cliente, enderecoEntrega } =
    useCarrinho();

  const taxaEntrega = 5;
  const total = subtotal + taxaEntrega;

  const [metodo, setMetodo] = useState("pix");
  const [pixCopiado, setPixCopiado] = useState(false);
  const [dinheiroOpcao, setDinheiroOpcao] = useState("sem_troco");
  const [trocoPara, setTrocoPara] = useState("");
  const [erroPagamento, setErroPagamento] = useState("");

  const criarPedidoMutation = useMutation({
    mutationFn: createOrder,
  });

  const precisaTroco = metodo === "dinheiro" && dinheiroOpcao === "troco";
  const valorTroco = parseValor(trocoPara);
  const trocoValido = !precisaTroco || valorTroco >= total;

  const valorTrocoCalculado =
    precisaTroco && trocoValido ? valorTroco - total : 0;

  const getPaymentDetails = () => {
    if (metodo === "pix") {
      return {
        type: "pix",
        pix_key: pixKey,
        payment_confirmation: "manual",
      };
    }

    if (metodo === "cartao") {
      return {
        type: "card",
        mode: "card_on_delivery",
      };
    }

    return {
      type: "cash",
      needs_change: dinheiroOpcao === "troco",
      change_for: dinheiroOpcao === "troco" ? valorTroco : null,
      change_value: dinheiroOpcao === "troco" ? valorTrocoCalculado : 0,
    };
  };

  const handleCopiarPix = async () => {
    try {
      await navigator.clipboard?.writeText(pixKey);
      setPixCopiado(true);

      setTimeout(() => {
        setPixCopiado(false);
      }, 2000);
    } catch {
      setErroPagamento("Não foi possível copiar a chave Pix.");
    }
  };

  const handleConfirmar = () => {
    const telefoneNumeros = cliente.telefone.replace(/\D/g, "");

    const clienteValido =
      cliente.nome.trim().length >= 2 && telefoneNumeros.length >= 10;

    const enderecoValido =
      enderecoEntrega.rua.trim() &&
      enderecoEntrega.numero.trim() &&
      enderecoEntrega.bairro.trim() &&
      enderecoEntrega.cidade.trim();

    if (!clienteValido || !enderecoValido) {
      setErroPagamento(
        "Preencha seus dados e endereço antes de confirmar o pedido.",
      );
      return;
    }

    if (itens.length === 0) {
      setErroPagamento("Adicione pelo menos um item ao carrinho.");
      return;
    }

    if (!trocoValido) {
      setErroPagamento(
        "O valor informado para troco deve ser maior ou igual ao total.",
      );
      return;
    }

    setErroPagamento("");

    criarPedidoMutation.mutate(
      {
        customer: {
          name: cliente.nome.trim(),
          phone: telefoneNumeros,
        },
        address: enderecoEntrega,
        payment: {
          method: metodo,
          details: getPaymentDetails(),
        },
        items: itens.map((item) => ({
          productId: item.id,
          quantity: item.quantidade,
          customization: item.personalizacao || {},
        })),
      },
      {
        onSuccess: (pedido) => {
          limparCarrinho();
          navigate(`/rastreio?pedido=${pedido.id}`);
        },
        onError: (error) => {
          setErroPagamento(
            error instanceof Error
              ? error.message
              : "Não foi possível confirmar o pedido.",
          );
        },
      },
    );
  };

  const estaProcessando = criarPedidoMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-6 sm:px-6 lg:px-8 lg:py-8">
      {" "}
      <div>
        {" "}
        <p className="text-zinc-100 font-black text-xl mb-1">
          Forma de pagamento{" "}
        </p>
        <p className="text-zinc-300 text-sm">
          Escolha como deseja pagar seu pedido.
        </p>
      </div>
      <section className="space-y-3">
        {metodos.map((item) => {
          const Icon = item.icon;
          const selecionado = metodo === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setMetodo(item.id);
                setErroPagamento("");
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                selecionado
                  ? "border-orange-500 bg-orange-600/10"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  selecionado ? "bg-orange-600" : "bg-zinc-800"
                }`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1">
                <p
                  className={`text-base font-bold ${
                    selecionado ? "text-orange-300" : "text-zinc-100"
                  }`}
                >
                  {item.label}
                </p>

                <p className="text-zinc-300 text-sm mt-1">{item.desc}</p>
              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selecionado
                    ? "border-orange-500 bg-orange-500"
                    : "border-zinc-600"
                }`}
              />
            </button>
          );
        })}
      </section>
      {metodo === "pix" && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <QrCode className="w-7 h-7 text-orange-400" />
          </div>

          <div>
            <p className="text-zinc-100 text-base font-black">
              Pagamento via Pix
            </p>

            <p className="text-zinc-300 text-sm leading-5 mt-1">
              Após confirmar o pedido, faça o pagamento usando a chave abaixo.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
            <p className="text-zinc-200 text-sm font-mono break-all">
              {pixKey}
            </p>
          </div>

          <button
            onClick={handleCopiarPix}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-sm font-bold transition-colors"
          >
            {pixCopiado ? "✓ Chave Pix copiada" : "Copiar chave Pix"}
          </button>
        </section>
      )}
      {metodo === "cartao" && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-400" />
            </div>

            <div>
              <p className="text-zinc-100 text-base font-black">
                Cartão na entrega
              </p>

              <p className="text-zinc-300 text-sm leading-5 mt-1">
                Não precisamos dos dados do seu cartão. O pagamento será feito
                com a maquininha no momento da entrega.
              </p>
            </div>
          </div>
        </section>
      )}
      {metodo === "dinheiro" && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-zinc-100 text-base font-black">
              Pagamento em dinheiro
            </p>

            <p className="text-zinc-300 text-sm mt-1">
              Informe se o entregador precisa levar troco.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDinheiroOpcao("sem_troco")}
              className={`py-3 rounded-xl text-sm font-bold border transition-colors ${
                dinheiroOpcao === "sem_troco"
                  ? "border-orange-500 bg-orange-600/20 text-orange-300"
                  : "border-zinc-700 bg-zinc-800 text-zinc-300"
              }`}
            >
              Sem troco
            </button>

            <button
              onClick={() => setDinheiroOpcao("troco")}
              className={`py-3 rounded-xl text-sm font-bold border transition-colors ${
                dinheiroOpcao === "troco"
                  ? "border-orange-500 bg-orange-600/20 text-orange-300"
                  : "border-zinc-700 bg-zinc-800 text-zinc-300"
              }`}
            >
              Preciso de troco
            </button>
          </div>

          {dinheiroOpcao === "troco" && (
            <div className="space-y-2">
              <label className="text-zinc-300 text-sm font-semibold block">
                Troco para quanto?
              </label>

              <input
                value={trocoPara}
                onChange={(event) => {
                  setTrocoPara(event.target.value);
                  setErroPagamento("");
                }}
                placeholder="Ex: 100"
                inputMode="decimal"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-500"
              />

              {!trocoValido && (
                <p className="text-red-400 text-sm">
                  O valor informado precisa ser maior ou igual ao total.
                </p>
              )}

              {trocoValido && trocoPara && (
                <p className="text-green-400 text-sm">
                  Troco estimado: R$ {formatarMoeda(valorTrocoCalculado)}
                </p>
              )}
            </div>
          )}
        </section>
      )}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center">
        <span className="text-zinc-300 text-base">Total</span>

        <span className="text-orange-400 font-black text-2xl">
          R$ {formatarMoeda(total)}
        </span>
      </section>
      {erroPagamento && (
        <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/50 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />

          <p className="text-red-300 text-sm">{erroPagamento}</p>
        </div>
      )}
      <button
        onClick={handleConfirmar}
        disabled={estaProcessando}
        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {estaProcessando ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Confirmando pedido...
          </>
        ) : metodo === "pix" ? (
          "Confirmar pedido e pagar via Pix →"
        ) : (
          "Confirmar pedido →"
        )}
      </button>
    </div>
  );
}
