import { useState, useEffect } from "react";
import { Clock, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getCurrentUser } from "../lib/dataService";

export default function DemoPerfil() {
  const [nome, setNome] = useState("Cliente");
  const [email, setEmail] = useState("");
  const [editando, setEditando] = useState(false);
  useEffect(()=>{getCurrentUser().then(u=>{setNome(u.full_name||"Cliente");setEmail(u.email||"");});},[]);
  const { data: pedidos=[], isLoading } = useQuery({ queryKey:["myOrders"], queryFn:getOrders });

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center text-2xl font-black text-white">{nome[0]}</div>
        <div className="flex-1">{editando?(<div className="space-y-2"><input value={nome} onChange={e=>setNome(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 text-sm outline-none"/><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 text-sm outline-none"/><button onClick={()=>setEditando(false)} className="text-xs text-orange-400 font-bold">Salvar</button></div>):(<><p className="text-zinc-100 font-bold">{nome}</p><p className="text-zinc-500 text-xs">{email}</p><button onClick={()=>setEditando(true)} className="text-xs text-orange-400 font-semibold mt-1">Editar perfil</button></>)}</div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"><div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between"><div className="flex items-center gap-2 text-zinc-300 text-sm font-bold"><MapPin className="w-4 h-4 text-orange-500"/>Endereços Salvos</div></div>{[{label:"Casa",end:"Av. Atlântica, 1702 — Copacabana, RJ"},{label:"Trabalho",end:"R. da Quitanda, 86 — Centro, RJ"}].map((e,i)=><div key={i} className="px-4 py-3 border-b border-zinc-800 last:border-0 flex items-center justify-between"><div><p className="text-zinc-200 text-sm font-semibold">{e.label}</p><p className="text-zinc-500 text-xs">{e.end}</p></div><ChevronRight className="w-4 h-4 text-zinc-600"/></div>)}</div>
      <div><div className="flex items-center gap-2 text-zinc-300 text-sm font-bold mb-3"><Clock className="w-4 h-4 text-orange-500"/>Histórico de Pedidos</div><div className="space-y-3">{isLoading&&<div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-orange-400 animate-spin"/></div>}{!isLoading&&pedidos.length===0&&<p className="text-zinc-500 text-xs text-center py-4">Nenhum pedido ainda</p>}{pedidos.map(p=><div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><div className="flex justify-between items-start"><div><p className="text-zinc-200 font-bold text-sm">#{p.id}</p><p className="text-zinc-500 text-xs">{new Date(p.created_date).toLocaleDateString("pt-BR")}</p><p className="text-zinc-400 text-xs mt-1">{p.items?.map(i=>i.name||i.nome).join(", ")||"—"}</p></div><div className="text-right"><p className="text-orange-400 font-black text-sm">R$ {p.total?.toFixed(2).replace(".",",")}</p><span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${p.status==="delivered"?"text-green-400 bg-green-400/10":p.status==="out_for_delivery"?"text-blue-400 bg-blue-400/10":p.status==="preparing"?"text-yellow-400 bg-yellow-400/10":"text-orange-400 bg-orange-400/10"}`}>{p.status==="confirmed"?"Confirmado":p.status==="preparing"?"Preparo":p.status==="out_for_delivery"?"A caminho":"Entregue"}</span></div></div></div>)}</div></div>
    </div>
  );
}