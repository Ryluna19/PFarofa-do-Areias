import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Pencil, Phone, UserRound } from "lucide-react";
import { useCarrinho } from "../context/CarrinhoContext";

export default function DemoPerfil() {
  const [editandoDados, setEditandoDados] = useState(false);
  const [editandoEndereco, setEditandoEndereco] = useState(false);

  const { cliente, setCliente, enderecoEntrega, setEnderecoEntrega } =
    useCarrinho();

  const nomeExibicao = cliente.nome.trim() || "Cliente";
  const inicialNome = nomeExibicao.charAt(0).toUpperCase();

  const enderecoPreenchido =
    enderecoEntrega.rua.trim() &&
    enderecoEntrega.numero.trim() &&
    enderecoEntrega.bairro.trim() &&
    enderecoEntrega.cidade.trim();

  const atualizarCliente = (campo, valor) => {
    setCliente((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const atualizarEndereco = (campo, valor) => {
    setEnderecoEntrega((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  return (
    <div className="px-4 py-5 space-y-5 sm:px-6 lg:px-8 lg:py-8">
      {" "}
      <div>
        {" "}
        <p className="text-zinc-100 font-black text-xl">Meus dados</p>
        <p className="text-zinc-300 text-sm mt-1">
          Seus dados ficam salvos apenas neste dispositivo para facilitar novos
          pedidos.
        </p>
      </div>
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 shrink-0 rounded-full bg-orange-600 flex items-center justify-center text-2xl font-black text-white">
            {inicialNome}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-zinc-100 font-bold text-base">
                  {nomeExibicao}
                </p>

                <p className="text-zinc-300 text-sm mt-1">
                  {cliente.telefone || "Telefone não informado"}
                </p>
              </div>

              <button
                onClick={() => setEditandoDados((anterior) => !anterior)}
                className="shrink-0 text-orange-400 hover:text-orange-300 transition-colors"
                aria-label="Editar dados pessoais"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {editandoDados && (
          <div className="mt-5 pt-5 border-t border-zinc-800 space-y-3">
            <div>
              <label className="text-zinc-300 text-sm font-semibold mb-1 block">
                Nome
              </label>

              <input
                value={cliente.nome}
                onChange={(event) =>
                  atualizarCliente("nome", event.target.value)
                }
                placeholder="Seu nome completo"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 text-sm font-semibold mb-1 block">
                Telefone
              </label>

              <input
                value={cliente.telefone}
                onChange={(event) =>
                  atualizarCliente("telefone", event.target.value)
                }
                placeholder="(21) 99999-9999"
                inputMode="tel"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-500"
              />
            </div>

            <button
              onClick={() => setEditandoDados(false)}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Salvar dados
            </button>
          </div>
        )}
      </section>
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-400" />
            </div>

            <div>
              <p className="text-zinc-100 font-bold text-base">
                Endereço de entrega
              </p>

              <p className="text-zinc-300 text-sm mt-1">
                {enderecoPreenchido
                  ? `${enderecoEntrega.rua}, ${enderecoEntrega.numero} · ${enderecoEntrega.bairro}`
                  : "Nenhum endereço salvo ainda"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditandoEndereco((anterior) => !anterior)}
            className="shrink-0 text-orange-400 hover:text-orange-300 transition-colors"
            aria-label="Editar endereço"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>

        {editandoEndereco && (
          <div className="px-5 pb-5 pt-1 border-t border-zinc-800 space-y-3">
            <div className="pt-4">
              <label className="text-zinc-300 text-sm font-semibold mb-1 block">
                CEP
              </label>

              <input
                value={enderecoEntrega.cep}
                onChange={(event) =>
                  atualizarEndereco("cep", event.target.value)
                }
                placeholder="00000-000"
                inputMode="numeric"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 text-sm font-semibold mb-1 block">
                Rua
              </label>

              <input
                value={enderecoEntrega.rua}
                onChange={(event) =>
                  atualizarEndereco("rua", event.target.value)
                }
                placeholder="Av. Atlântica"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-300 text-sm font-semibold mb-1 block">
                  Número
                </label>

                <input
                  value={enderecoEntrega.numero}
                  onChange={(event) =>
                    atualizarEndereco("numero", event.target.value)
                  }
                  placeholder="1702"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 text-sm font-semibold mb-1 block">
                  Complemento
                </label>

                <input
                  value={enderecoEntrega.complemento}
                  onChange={(event) =>
                    atualizarEndereco("complemento", event.target.value)
                  }
                  placeholder="Apto 602"
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-300 text-sm font-semibold mb-1 block">
                Bairro
              </label>

              <input
                value={enderecoEntrega.bairro}
                onChange={(event) =>
                  atualizarEndereco("bairro", event.target.value)
                }
                placeholder="Copacabana"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 text-sm font-semibold mb-1 block">
                Cidade
              </label>

              <input
                value={enderecoEntrega.cidade}
                onChange={(event) =>
                  atualizarEndereco("cidade", event.target.value)
                }
                placeholder="Rio de Janeiro"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-500"
              />
            </div>

            <button
              onClick={() => setEditandoEndereco(false)}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition-colors"
            >
              Salvar endereço
            </button>
          </div>
        )}
      </section>
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Phone className="w-5 h-5 text-orange-400" />
          </div>

          <div>
            <p className="text-zinc-100 font-bold text-base">
              Pronto para pedir?
            </p>

            <p className="text-zinc-300 text-sm leading-5 mt-1">
              Seus dados preenchidos aqui serão usados automaticamente no
              checkout.
            </p>
          </div>
        </div>

        <Link
          to="/cardapio"
          className="block w-full mt-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl text-center text-sm transition-colors"
        >
          Ver cardápio
        </Link>
      </section>
    </div>
  );
}
