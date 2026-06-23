import { createContext, useContext, useEffect, useState } from "react";

const CarrinhoContext = createContext(null);

const enderecoInicial = {
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "Rio de Janeiro",
  cep: "",
};

function carregarCarrinho() {
  const itensSalvos = localStorage.getItem("farofa-carrinho");

  if (!itensSalvos) {
    return [];
  }

  try {
    const itensConvertidos = JSON.parse(itensSalvos);


    return Array.isArray(itensConvertidos) ? itensConvertidos : [];


  } catch {
    return [];
  }
}

function carregarEndereco() {
  const enderecoSalvo = localStorage.getItem("farofa-endereco");

  if (!enderecoSalvo) {
    return enderecoInicial;
  }

  try {
    return {
      ...enderecoInicial,
      ...JSON.parse(enderecoSalvo),
    };
  } catch {
    return enderecoInicial;
  }
}

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState(carregarCarrinho);
  const [enderecoEntrega, setEnderecoEntrega] = useState(carregarEndereco);

  useEffect(() => {
    localStorage.setItem("farofa-carrinho", JSON.stringify(itens));
  }, [itens]);

  useEffect(() => {
    localStorage.setItem("farofa-endereco", JSON.stringify(enderecoEntrega));
  }, [enderecoEntrega]);

  const adicionarItem = (produto, personalizacao = {}) => {
    setItens((prev) => {
      const key = produto.id + JSON.stringify(personalizacao);
      const existe = prev.find((item) => item.key === key);


      if (existe) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          ...produto,
          personalizacao,
          quantidade: 1,
          key,
        },
      ];
    });


  };

  const removerItem = (key) => {
    setItens((prev) => prev.filter((item) => item.key !== key));
  };

  const alterarQuantidade = (key, delta) => {
    setItens((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? {
              ...item,
              quantidade: Math.max(0, item.quantidade + delta),
            }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };

  const limparCarrinho = () => {
    setItens([]);
  };

  const subtotal = itens.reduce(
    (acc, item) => acc + (item.preco || item.price || 0) * item.quantidade,
    0
  );

  const totalItens = itens.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        alterarQuantidade,
        limparCarrinho,
        subtotal,
        totalItens,
        enderecoEntrega,
        setEnderecoEntrega,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
