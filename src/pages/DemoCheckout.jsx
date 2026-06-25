import { useState } from "react";
import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCarrinho } from "../context/CarrinhoContext";

const inputClassName =
  "w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-500";

function formatarCep(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);

  if (numeros.length <= 5) {
    return numeros;
  }

  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
}

export default function DemoCheckout() {
  const navigate = useNavigate();

  const { subtotal, enderecoEntrega, setEnderecoEntrega, cliente, setCliente } =
    useCarrinho();

  const taxaEntrega = 5;

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");

  const telefoneNumeros = cliente.telefone.replace(/\D/g, "");

  const clienteValido =
    cliente.nome.trim().length >= 2 && telefoneNumeros.length >= 10;

  const enderecoValido =
    enderecoEntrega.rua.trim() &&
    enderecoEntrega.numero.trim() &&
    enderecoEntrega.bairro.trim() &&
    enderecoEntrega.cidade.trim();

  const checkoutValido = clienteValido && enderecoValido && subtotal > 0;

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

  const buscarCep = async () => {
    const cepNumeros = enderecoEntrega.cep.replace(/\D/g, "");

    if (!cepNumeros) {
      return;
    }

    if (cepNumeros.length !== 8) {
      setErroCep("Digite um CEP válido com 8 dígitos.");
      return;
    }

    setBuscandoCep(true);
    setErroCep("");

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepNumeros}/json/`,
      );

      if (!response.ok) {
        throw new Error("Não foi possível consultar o CEP.");
      }

      const endereco = await response.json();

      if (endereco.erro) {
        throw new Error("CEP não encontrado.");
      }

      setEnderecoEntrega((anterior) => ({
        ...anterior,
        cep: endereco.cep || anterior.cep,
        rua: endereco.logradouro || anterior.rua,
        bairro: endereco.bairro || anterior.bairro,
        cidade: endereco.localidade || anterior.cidade,
      }));
    } catch (error) {
      setErroCep(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar o CEP.",
      );
    } finally {
      setBuscandoCep(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-6 sm:px-6 lg:px-8 lg:py-8">
      {" "}
      <div>
        {" "}
        <p className="text-zinc-100 font-black text-xl mb-1">
          Dados para entrega{" "}
        </p>
        `
        <p className="text-zinc-300 text-sm">
          Informe seus dados e o endereço onde deseja receber o pedido.
        </p>
      </div>
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-orange-400" />
          </div>

          <div>
            <p className="text-zinc-100 font-bold text-base">Seus dados</p>

            <p className="text-zinc-300 text-sm mt-1">
              Usaremos estas informações para identificar seu pedido.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-zinc-300 text-sm font-semibold mb-1.5 block">
              Nome
            </label>

            <input
              value={cliente.nome}
              onChange={(event) => atualizarCliente("nome", event.target.value)}
              placeholder="Seu nome completo"
              className={inputClassName}
            />
          </div>

          <div>
            <label className="text-zinc-300 text-sm font-semibold mb-1.5 block">
              Telefone
            </label>

            <input
              value={cliente.telefone}
              onChange={(event) =>
                atualizarCliente("telefone", event.target.value)
              }
              placeholder="(21) 99999-9999"
              inputMode="tel"
              className={inputClassName}
            />
          </div>
        </div>
      </section>
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-zinc-100 font-bold text-base">
            Endereço de entrega
          </p>

          <p className="text-zinc-300 text-sm mt-1">
            Digite seu CEP para preencher rua, bairro e cidade automaticamente.
          </p>
        </div>

        <div className="max-w-sm">
          <label className="text-zinc-300 text-sm font-semibold mb-1.5 block">
            CEP
          </label>

          <div className="flex gap-2">
            <input
              value={enderecoEntrega.cep}
              onChange={(event) => {
                atualizarEndereco("cep", formatarCep(event.target.value));
                setErroCep("");
              }}
              onBlur={buscarCep}
              placeholder="00000-000"
              inputMode="numeric"
              className={inputClassName}
            />

            <button
              type="button"
              onClick={buscarCep}
              disabled={buscandoCep}
              className="shrink-0 px-4 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-100 font-bold rounded-xl text-sm transition-colors"
            >
              {buscandoCep ? (
                <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
              ) : (
                "Buscar"
              )}
            </button>
          </div>

          {erroCep && (
            <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
              <AlertCircle className="w-4 h-4" />
              {erroCep}
            </p>
          )}
        </div>

        <div>
          <label className="text-zinc-300 text-sm font-semibold mb-1.5 block">
            Rua
          </label>

          <input
            value={enderecoEntrega.rua}
            onChange={(event) => atualizarEndereco("rua", event.target.value)}
            placeholder="Av. Atlântica"
            className={inputClassName}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-zinc-300 text-sm font-semibold mb-1.5 block">
              Número
            </label>

            <input
              value={enderecoEntrega.numero}
              onChange={(event) =>
                atualizarEndereco("numero", event.target.value)
              }
              placeholder="1702"
              className={inputClassName}
            />
          </div>

          <div>
            <label className="text-zinc-300 text-sm font-semibold mb-1.5 block">
              Complemento
            </label>

            <input
              value={enderecoEntrega.complemento}
              onChange={(event) =>
                atualizarEndereco("complemento", event.target.value)
              }
              placeholder="Apto 602"
              className={inputClassName}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-zinc-300 text-sm font-semibold mb-1.5 block">
              Bairro
            </label>

            <input
              value={enderecoEntrega.bairro}
              onChange={(event) =>
                atualizarEndereco("bairro", event.target.value)
              }
              placeholder="Copacabana"
              className={inputClassName}
            />
          </div>

          <div>
            <label className="text-zinc-300 text-sm font-semibold mb-1.5 block">
              Cidade
            </label>

            <input
              value={enderecoEntrega.cidade}
              onChange={(event) =>
                atualizarEndereco("cidade", event.target.value)
              }
              placeholder="Rio de Janeiro"
              className={inputClassName}
            />
          </div>
        </div>
      </section>
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm space-y-3">
        <div className="flex justify-between text-zinc-300">
          <span>Subtotal</span>
          <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
        </div>

        <div className="flex justify-between text-zinc-300">
          <span>Entrega</span>
          <span>R$ 5,00</span>
        </div>

        <div className="flex justify-between text-white font-black text-lg pt-3 border-t border-zinc-800">
          <span>Total</span>

          <span className="text-orange-400">
            R$ {(subtotal + taxaEntrega).toFixed(2).replace(".", ",")}
          </span>
        </div>
      </section>
      <button
        disabled={!checkoutValido}
        onClick={() => navigate("/pagamento")}
        className={`w-full py-4 rounded-2xl font-black text-base transition-all ${
          checkoutValido
            ? "bg-orange-600 hover:bg-orange-500 text-white"
            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
        }`}
      >
        Ir para pagamento →
      </button>
    </div>
  );
}
