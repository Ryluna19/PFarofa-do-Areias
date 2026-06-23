import { useState } from "react";
import { AlertCircle, Loader2, LockKeyhole } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function DemoAdminLogin() {
    const { login } = useAdminAuth();

    const [email, setEmail] = useState("admin@farofadoareias.local");
    const [password, setPassword] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();


        setErro("");
        setCarregando(true);

        try {
            await login(email, password);
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível entrar no painel."
            );
        } finally {
            setCarregando(false);
        }


    };

    return (<div className="px-4 py-8"> <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6"> <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-600 flex items-center justify-center mb-5"> <LockKeyhole className="w-7 h-7 text-white" /> </div>


        <div className="text-center mb-6">
            <h1 className="text-zinc-100 font-black text-xl">
                Área administrativa
            </h1>

            <p className="text-zinc-500 text-sm mt-1">
                Entre para acompanhar e atualizar pedidos.
            </p>
        </div>

        {erro && (
            <div className="flex gap-2 bg-red-950/40 border border-red-800/50 rounded-xl p-3 mb-4">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />

                <p className="text-red-300 text-sm">{erro}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-zinc-400 text-xs font-semibold block mb-1">
                    E-mail
                </label>

                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none"
                />
            </div>

            <div>
                <label className="text-zinc-400 text-xs font-semibold block mb-1">
                    Senha
                </label>

                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
                />
            </div>

            <button
                disabled={carregando}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 text-white rounded-xl font-black text-sm transition-colors"
            >
                {carregando ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Entrando...
                    </span>
                ) : (
                    "Entrar no painel"
                )}
            </button>
        </form>
    </div>
    </div>


    );
}
