import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  AlertCircle,
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  Home,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "../lib/dataService";

const etapas = [
  {
    id: 0,
    status: "confirmed",
    label: "Pedido Confirmado",
    desc: "Seu pedido foi recebido pelo restaurante!",
    icon: CheckCircle2,
  },
  {
    id: 1,
    status: "preparing",
    label: "Em Preparo",
    desc: "Nossa equipe está preparando com carinho ❤️",
    icon: ChefHat,
  },
  {
    id: 2,
    status: "out_for_delivery",
    label: "Saiu para Entrega",
    desc: "Seu pedido saiu para entrega.",
    icon: Bike,
  },
  {
    id: 3,
    status: "delivered",
    label: "Entregue!",
    desc: "Bom apetite! 🥘",
    icon: Home,
  },
];

const statusToStep = {
  confirmed: 0,
  preparing: 1,
  out_for_delivery: 2,
  delivered: 3,
};

function getPaymentLabel(method) {
  if (method === "pix") return "Pago via Pix";
  if (method === "cartao") return "Pago com Cartão";
  if (method === "dinheiro") return "Dinheiro na entrega";

  return "Pagamento não informado";
}

function formatarMoeda(valor = 0) {
  return Number(valor).toFixed(2).replace(".", ",");
}

function formatarData(data) {
  if (!data) {
    return "";
  }

  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DemoRastreio() {
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const { isAuthenticated } = useAdminAuth();
  const openedFromAdmin = searchParams.get("from") === "admin";
  const canReturnToAdmin = openedFromAdmin && isAuthenticated;
  const [avaliacao, setAvaliacao] = useState(0);
  const [avaliado, setAvaliado] = useState(false);

  const {
    data: pedido,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["order", pedidoId],
    queryFn: () => (pedidoId ? getOrder(pedidoId) : null),
    enabled: Boolean(pedidoId),
    refetchInterval: 2000,
  });

  const etapaAtual = pedido ? (statusToStep[pedido.status] ?? 0) : 0;
  const etapa = etapas[etapaAtual];

  const numeroPedido = pedido
    ? `#${pedido.orderNumber}`
    : pedidoId
      ? "Pedido não encontrado"
      : "#0000";

  const previsaoEntrega =
    etapaAtual >= 3
      ? "Pedido entregue"
      : `~${Math.max(6, 30 - etapaAtual * 8)} minutos`;

  function getHistoricoPorStatus(status) {
    return pedido?.history?.find((item) => item.status === status);
  }

  return (
    <div className="px-4 py-5 space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-2">🥘</div>

        <p className="text-zinc-500 text-xs">Pedido {numeroPedido}</p>

        {isLoading && (
          <Loader2 className="w-4 h-4 text-orange-400 animate-spin mx-auto mt-2" />
        )}

        {pedido && (
          <p className="text-zinc-500 text-xs mt-1">
            {getPaymentLabel(pedido.paymentMethod)} ·{" "}
            {pedido.items?.length || 0} item(ns)
          </p>
        )}

        {!isLoading && !pedido && !isError && (
          <p className="text-red-400 text-sm mt-3">Pedido não encontrado.</p>
        )}

        {isError && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm mt-3">
            <AlertCircle className="w-4 h-4" />
            <span>
              {error instanceof Error
                ? error.message
                : "Não foi possível carregar o pedido."}
            </span>
          </div>
        )}

        {pedido && (
          <>
            <p className="text-white font-black text-lg mt-1">{etapa.label}</p>

            <p className="text-zinc-400 text-sm mt-1">{etapa.desc}</p>

            <p className="text-orange-400 text-xs font-semibold mt-2">
              Atualizado automaticamente pelo restaurante
            </p>
          </>
        )}
      </div>

      {pedido && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-6 h-6 text-orange-400 shrink-0" />

          <div>
            <p className="text-zinc-100 font-bold text-sm">
              Previsão de entrega
            </p>

            <p className="text-zinc-500 text-xs">{previsaoEntrega}</p>
          </div>
        </div>
      )}

      {pedido && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <p className="text-zinc-100 font-bold text-sm">Resumo do pedido</p>

          <div className="space-y-1">
            {pedido.items?.map((item) => (
              <div
                key={`${pedido.id}-${item.id}`}
                className="flex justify-between gap-3 text-xs"
              >
                <span className="text-zinc-400">
                  {item.quantity}x {item.emoji} {item.name}
                </span>

                <span className="text-zinc-300">
                  R$ {formatarMoeda(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm font-black pt-2 border-t border-zinc-800">
            <span className="text-zinc-100">Total</span>

            <span className="text-orange-400">
              R$ {formatarMoeda(pedido.total)}
            </span>
          </div>
        </div>
      )}

      {pedido && (
        <div className="relative pl-8">
          <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-zinc-800" />

          <div className="space-y-6">
            {etapas.map((item, index) => {
              const concluida = index <= etapaAtual;
              const ativa = index === etapaAtual;
              const historico = getHistoricoPorStatus(item.status);

              return (
                <div key={item.id} className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
                      concluida
                        ? "bg-orange-600 border-orange-600"
                        : "bg-zinc-900 border-zinc-700"
                    } ${ativa ? "ring-4 ring-orange-500/30" : ""}`}
                  >
                    <item.icon
                      className={`w-3.5 h-3.5 ${
                        concluida ? "text-white" : "text-zinc-600"
                      }`}
                    />
                  </div>

                  <div
                    className={`transition-all ${
                      concluida ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold ${
                        concluida ? "text-zinc-100" : "text-zinc-500"
                      }`}
                    >
                      {item.label}
                    </p>

                    {concluida && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {historico
                          ? `Atualizado em ${formatarData(historico.createdAt)}`
                          : item.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {etapaAtual === 3 && !avaliado && pedido && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center space-y-3">
          <p className="text-zinc-100 font-bold">Como foi seu pedido?</p>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((nota) => (
              <button
                key={nota}
                onClick={() => setAvaliacao(nota)}
                className={`text-3xl transition-transform hover:scale-110 ${
                  nota <= avaliacao ? "opacity-100" : "opacity-30"
                }`}
              >
                ⭐
              </button>
            ))}
          </div>

          {avaliacao > 0 && (
            <button
              onClick={() => setAvaliado(true)}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm"
            >
              Enviar Avaliação
            </button>
          )}
        </div>
      )}

      {avaliado && (
        <div className="bg-green-900/30 border border-green-700/40 rounded-2xl p-4 text-center">
          <p className="text-green-400 font-bold text-sm">
            Obrigado pela avaliação! 🙏
          </p>
        </div>
      )}

      {canReturnToAdmin ? (
        <Link
          to="/admin"
          className="block w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-2xl text-center text-sm transition-colors"
        >
          Voltar ao painel
        </Link>
      ) : (
        <Link
          to="/"
          className="block w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-center text-sm transition-colors"
        >
          Fazer novo pedido
        </Link>
      )}
    </div>
  );
}
