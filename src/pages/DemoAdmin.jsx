import { useEffect, useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  Loader2,
  LogOut,
  PackageCheck,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminOrders, updateAdminOrderStatus } from "../lib/dataService";
import { Link } from "react-router-dom";

const statusOptions = [
  {
    value: "confirmed",
    label: "Confirmado",
    color: "text-orange-400 bg-orange-400/10",
  },
  {
    value: "preparing",
    label: "Em preparo",
    color: "text-yellow-400 bg-yellow-400/10",
  },
  {
    value: "out_for_delivery",
    label: "Saiu para entrega",
    color: "text-blue-400 bg-blue-400/10",
  },
  {
    value: "delivered",
    label: "Entregue",
    color: "text-green-400 bg-green-400/10",
  },
];

const nextStatusByCurrent = {
  confirmed: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "delivered",
  delivered: null,
};

function formatarMoeda(valor = 0) {
  return Number(valor).toFixed(2).replace(".", ",");
}

function getStatusInfo(status) {
  return (
    statusOptions.find((item) => item.value === status) || statusOptions[0]
  );
}

function getPaymentLabel(method) {
  if (method === "pix") return "Pix";
  if (method === "cartao") return "Cartão";
  if (method === "dinheiro") return "Dinheiro";

  return "Não informado";
}

function isAuthenticationError(error) {
  return error?.status === 401 || error?.status === 403;
}

export default function DemoAdmin() {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState("");

  const {
    data: pedidos = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: getAdminOrders,
  });

  const { admin, logout } = useAdminAuth();

  const handleStatusChange = async (pedidoId, novoStatus) => {
    setUpdatingId(pedidoId);
    setUpdateError("");

    try {
      await updateAdminOrderStatus(pedidoId, novoStatus);

      await queryClient.invalidateQueries({
        queryKey: ["adminOrders"],
      });
    } catch (requestError) {
      if (isAuthenticationError(requestError)) {
        logout();
        return;
      }

      setUpdateError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar o pedido.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const faturamento = pedidos.reduce(
    (total, pedido) => total + Number(pedido.total || 0),
    0,
  );

  return (
    <div className="px-4 py-5 space-y-5">
      {" "}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-zinc-100 font-black text-lg">
                Painel Administrativo
              </p>

              <p className="text-zinc-500 text-xs">
                {admin?.fullName || "Administrador"} · Gerencie os pedidos
                recebidos.
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="shrink-0 flex items-center gap-2 border border-zinc-700 hover:border-orange-500 text-zinc-300 hover:text-white rounded-xl px-3 py-2 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-zinc-500 text-xs">Pedidos recebidos</p>

          <p className="text-orange-400 font-black text-2xl">
            {pedidos.length}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-zinc-500 text-xs">Faturamento</p>

          <p className="text-orange-400 font-black text-2xl">
            R$ {formatarMoeda(faturamento)}
          </p>
        </div>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
        </div>
      )}
      {isError && (
        <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/50 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />

          <p className="text-red-300 text-sm">
            {error instanceof Error
              ? error.message
              : "Não foi possível carregar os pedidos."}
          </p>
        </div>
      )}
      {updateError && (
        <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/50 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />

          <p className="text-red-300 text-sm">{updateError}</p>
        </div>
      )}
      {!isLoading && !isError && pedidos.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <PackageCheck className="w-12 h-12 text-zinc-700 mx-auto mb-3" />

          <p className="text-zinc-300 font-bold text-sm">
            Nenhum pedido recebido ainda
          </p>

          <p className="text-zinc-500 text-xs mt-1">
            Faça um pedido pelo app para ele aparecer aqui.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {pedidos.map((pedido) => {
          const statusInfo = getStatusInfo(pedido.status);
          const proximoStatus = nextStatusByCurrent[pedido.status];
          const proximoStatusInfo = proximoStatus
            ? getStatusInfo(proximoStatus)
            : null;

          return (
            <div
              key={pedido.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-zinc-100 font-black text-sm">
                    Pedido #{pedido.orderNumber}
                  </p>

                  <p className="text-zinc-400 text-xs mt-0.5">
                    {pedido.customerName}
                  </p>

                  <p className="text-zinc-500 text-xs mt-0.5">
                    {new Date(pedido.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>

                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>

              <div className="space-y-2">
                {pedido.items?.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-sm">
                    <span>{item.emoji}</span>

                    <div className="flex-1">
                      <p className="text-zinc-200 font-semibold">
                        {item.quantity}x {item.name}
                      </p>

                      {item.customization?.farinha && (
                        <p className="text-zinc-500 text-xs">
                          Farinha: {item.customization.farinha}
                        </p>
                      )}

                      {item.customization?.ingredientes?.length > 0 && (
                        <p className="text-zinc-600 text-xs">
                          {item.customization.ingredientes.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Pagamento</span>

                  <span>{getPaymentLabel(pedido.paymentMethod)}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Entrega</span>

                  <span>
                    {pedido.address?.rua}, {pedido.address?.numero} ·{" "}
                    {pedido.address?.bairro}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-100 font-black pt-2 border-t border-zinc-800">
                  <span>Total</span>

                  <span className="text-orange-400">
                    R$ {formatarMoeda(pedido.total)}
                  </span>
                </div>
              </div>

              <div>
                {proximoStatus && proximoStatusInfo ? (
                  <button
                    disabled={updatingId === pedido.id}
                    onClick={() => handleStatusChange(pedido.id, proximoStatus)}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-bold rounded-xl text-sm transition-colors"
                  >
                    {updatingId === pedido.id
                      ? "Atualizando pedido..."
                      : `Marcar como ${proximoStatusInfo.label}`}
                  </button>
                ) : (
                  <p className="text-center text-green-400 text-sm font-bold py-3">
                    Pedido finalizado
                  </p>
                )}

                <Link
                  to={`/rastreio?pedido=${pedido.id}`}
                  className="block w-full py-3 mt-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-center text-sm transition-colors"
                >
                  Ver rastreio do cliente
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
