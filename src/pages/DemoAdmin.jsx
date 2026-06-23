import { useState } from "react";
import { ClipboardList, Loader2, PackageCheck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus } from "../lib/dataService";
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

function formatarMoeda(valor = 0) {
    return valor.toFixed(2).replace(".", ",");
}

function getStatusInfo(status) {
    return statusOptions.find((item) => item.value === status) || statusOptions[0];
}

function getPaymentLabel(method) {
    if (method === "pix") return "Pix";
    if (method === "cartao") return "Cartão";
    if (method === "dinheiro") return "Dinheiro";
    return "Não informado";
}

export default function DemoAdmin() {
    const queryClient = useQueryClient();
    const [updatingId, setUpdatingId] = useState(null);

    const {
        data: pedidos = [],
        isLoading,
    } = useQuery({
        queryKey: ["adminOrders"],
        queryFn: getOrders,
    });

    const handleStatusChange = async (pedidoId, novoStatus) => {
        setUpdatingId(pedidoId);

        await updateOrderStatus(pedidoId, novoStatus);

        await queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
        await queryClient.invalidateQueries({ queryKey: ["myOrders"] });

        setUpdatingId(null);
    };

    return (
        <div className="px-4 py-5 space-y-5">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-white" />
                    </div>

                    <div>
                        <p className="text-zinc-100 font-black text-lg">
                            Painel Administrativo
                        </p>
                        <p className="text-zinc-500 text-xs">
                            Acompanhe pedidos recebidos e atualize o status da entrega.
                        </p>
                    </div>
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
                    <p className="text-zinc-500 text-xs">Faturamento demo</p>
                    <p className="text-orange-400 font-black text-2xl">
                        R$ {formatarMoeda(pedidos.reduce((acc, pedido) => acc + (pedido.total || 0), 0))}
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                </div>
            )}

            {!isLoading && pedidos.length === 0 && (
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

                    return (
                        <div
                            key={pedido.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-zinc-100 font-black text-sm">
                                        Pedido #{pedido.id}
                                    </p>

                                    <p className="text-zinc-500 text-xs mt-0.5">
                                        {new Date(pedido.created_date).toLocaleString("pt-BR")}
                                    </p>
                                </div>

                                <span
                                    className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.color}`}
                                >
                                    {statusInfo.label}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {pedido.items?.map((item, index) => (
                                    <div
                                        key={`${pedido.id}-${index}`}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <span>{item.emoji}</span>

                                        <div className="flex-1">
                                            <p className="text-zinc-200 font-semibold">
                                                {item.quantity}x {item.name}
                                            </p>

                                            {item.personalizacao?.farinha && (
                                                <p className="text-zinc-500 text-xs">
                                                    Farinha: {item.personalizacao.farinha}
                                                </p>
                                            )}

                                            {item.personalizacao?.ingredientes?.length > 0 && (
                                                <p className="text-zinc-600 text-xs">
                                                    {item.personalizacao.ingredientes.join(", ")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-1 text-xs">
                                <div className="flex justify-between text-zinc-400">
                                    <span>Pagamento</span>
                                    <span>{getPaymentLabel(pedido.payment_method)}</span>
                                </div>

                                <div className="flex justify-between text-zinc-400">
                                    <span>Entrega</span>
                                    <span>
                                        {pedido.address?.rua}, {pedido.address?.bairro}
                                    </span>
                                </div>

                                <div className="flex justify-between text-zinc-100 font-black pt-2 border-t border-zinc-800">
                                    <span>Total</span>
                                    <span className="text-orange-400">
                                        R$ {formatarMoeda(pedido.total || 0)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-zinc-400 text-xs font-semibold mb-1 block">
                                    Atualizar status
                                </label>

                                <select
                                    value={pedido.status}
                                    disabled={updatingId === pedido.id}
                                    onChange={(event) =>
                                        handleStatusChange(pedido.id, event.target.value)
                                    }
                                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>

                                {updatingId === pedido.id && (
                                    <p className="text-orange-400 text-xs mt-2">
                                        Atualizando pedido...
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