import { createContext, useContext, useState } from "react";

const CarrinhoContext = createContext(null);

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);

  const adicionarItem = (produto, personalizacao = {}) => {
    setItens(prev => {
      const key = produto.id + JSON.stringify(personalizacao);
      const existe = prev.find(i => i.key === key);
      if (existe) return prev.map(i => i.key === key ? { ...i, quantidade: i.quantidade + 1 } : i);
      return [...prev, { ...produto, personalizacao, quantidade: 1, key }];
    });
  };

  const removerItem = (key) => setItens(prev => prev.filter(i => i.key !== key));
  const alterarQuantidade = (key, delta) => {
    setItens(prev => prev.map(i => i.key === key ? { ...i, quantidade: Math.max(0, i.quantidade + delta) } : i).filter(i => i.quantidade > 0));
  };
  const limparCarrinho = () => setItens([]);
  const subtotal = itens.reduce((acc, i) => acc + (i.preco || i.price || 0) * i.quantidade, 0);
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <CarrinhoContext.Provider value={{ itens, adicionarItem, removerItem, alterarQuantidade, limparCarrinho, subtotal, totalItens }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() { return useContext(CarrinhoContext); }