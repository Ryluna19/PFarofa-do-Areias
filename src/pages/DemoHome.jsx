import { Clock3, MapPin, ShoppingBag, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  {
    icon: ShoppingBag,
    title: "Pedido simples",
    description:
      "Monte sua farofa, confirme os dados e acompanhe tudo pelo app.",
  },
  {
    icon: Truck,
    title: "Entrega acompanhada",
    description:
      "Acompanhe quando seu pedido entra em preparo e sai para entrega.",
  },
  {
    icon: Clock3,
    title: "Feito na hora",
    description: "Pedidos preparados para chegar quentinhos até você.",
  },
];

export default function DemoHome() {
  return (
    <div className="px-4 py-5 space-y-6 sm:px-6 lg:px-8 lg:py-8">
      {" "}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-700 to-red-800 rounded-3xl p-6 lg:p-8">
        {" "}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />{" "}
        <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-black/10" />
        <div className="relative max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl mb-5">
            🥘
          </div>

          <p className="text-orange-100 text-sm font-bold uppercase tracking-[0.18em]">
            Sabor de casa
          </p>

          <h1 className="text-white font-black text-3xl lg:text-4xl leading-tight mt-2">
            Farofa do
            <br />
            Areias
          </h1>

          <p className="text-orange-50 text-base leading-6 mt-3 max-w-xl">
            Farofas feitas para deixar sua refeição mais completa, do pedido à
            entrega.
          </p>

          <Link
            to="/cardapio"
            className="mt-6 inline-flex items-center justify-center w-full lg:w-auto lg:px-8 py-3.5 bg-white hover:bg-orange-50 text-orange-700 font-black rounded-2xl text-sm transition-colors"
          >
            Ver cardápio
          </Link>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 lg:max-w-2xl">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <Clock3 className="w-5 h-5 text-orange-400 mb-3" />

          <p className="text-zinc-100 font-bold text-base">Pedidos rápidos</p>

          <p className="text-zinc-300 text-sm leading-5 mt-1">
            Escolha, personalize e finalize em poucos passos.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <MapPin className="w-5 h-5 text-orange-400 mb-3" />

          <p className="text-zinc-100 font-bold text-base">Entrega local</p>

          <p className="text-zinc-300 text-sm leading-5 mt-1">
            Informe seu endereço no checkout para concluir o pedido.
          </p>
        </div>
      </section>
      <section>
        <p className="text-zinc-100 font-black text-lg">
          Do pedido até sua porta
        </p>

        <p className="text-zinc-300 text-sm mt-1">
          Um fluxo simples para pedir e acompanhar.
        </p>

        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;

            return (
              <div
                key={highlight.title}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>

                <div>
                  <p className="text-zinc-100 font-bold text-base">
                    {highlight.title}
                  </p>

                  <p className="text-zinc-300 text-sm leading-5 mt-1">
                    {highlight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 lg:flex lg:items-center lg:justify-between lg:text-left">
        <div>
          <p className="text-zinc-100 font-bold text-sm">
            Já sabe o que quer pedir?
          </p>

          <p className="text-zinc-300 text-sm mt-1">
            Explore o cardápio e personalize sua farofa.
          </p>
        </div>

        <Link
          to="/cardapio"
          className="inline-flex mt-3 lg:mt-0 text-orange-400 hover:text-orange-300 font-bold text-sm transition-colors"
        >
          Explorar cardápio
        </Link>
      </section>
      <Link
        to="/admin"
        className="block text-center text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
      >
        Área do restaurante
      </Link>
    </div>
  );
}
