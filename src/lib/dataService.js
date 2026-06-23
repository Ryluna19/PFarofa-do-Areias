const STORAGE_KEY = "farofa_orders";

const SEED_PRODUCTS = [
  {
    id: "p1",
    name: "Farofa de Bacon com Ovo",
    category: "Farofas",
    description: "Farofa crocante de mandioca com bacon artesanal e ovos mexidos",
    price: 24.90,
    emoji: "🥓",
    has_customization: true,
    active: true,
    display_order: 1,
    created_date: "2026-06-01T10:00:00Z",
  },
  {
    id: "p2",
    name: "Farofa de Calabresa",
    category: "Farofas",
    description: "Farofa de mandioca torrada com calabresa defumada e cebolinha",
    price: 22.90,
    emoji: "🥩",
    has_customization: true,
    active: true,
    display_order: 2,
    created_date: "2026-06-01T10:00:00Z",
  },
  {
    id: "p3",
    name: "Farofa Vegana",
    category: "Farofas",
    description: "Farofa integral com legumes grelhados, tomate seco e azeitonas",
    price: 21.90,
    emoji: "🥬",
    has_customization: true,
    active: true,
    display_order: 3,
    created_date: "2026-06-01T10:00:00Z",
  },
  {
    id: "p4",
    name: "Vinagrete Caseiro",
    category: "Acompanhamentos",
    description: "Vinagrete fresquinho com tomate, cebola, pimentão e cheiro-verde",
    price: 8.90,
    emoji: "🍅",
    has_customization: false,
    active: true,
    display_order: 4,
    created_date: "2026-06-01T10:00:00Z",
  },
  {
    id: "p5",
    name: "Farofa Extra Simples",
    category: "Acompanhamentos",
    description: "Porção extra de farofa de mandioca torrada pura",
    price: 6.90,
    emoji: "🍚",
    has_customization: false,
    active: true,
    display_order: 5,
    created_date: "2026-06-01T10:00:00Z",
  },
  {
    id: "p6",
    name: "Suco Natural de Frutas",
    category: "Bebidas",
    description: "Suco natural da fruta (laranja, limão, maracujá, acerola)",
    price: 9.90,
    emoji: "🧃",
    has_customization: false,
    active: true,
    display_order: 6,
    created_date: "2026-06-01T10:00:00Z",
  },
  {
    id: "p7",
    name: "Refrigerante Lata",
    category: "Bebidas",
    description: "Coca-Cola, Guaraná Antarctica, Sprite",
    price: 6.00,
    emoji: "🥤",
    has_customization: false,
    active: true,
    display_order: 7,
    created_date: "2026-06-01T10:00:00Z",
  },
];

// Carrega pedidos salvos localmente
function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Salva pedidos localmente
function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// Gera um ID simples para pedidos da demo
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Retorna os produtos do cardápio
export async function getProducts() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return SEED_PRODUCTS
    .filter((product) => product.active)
    .sort((a, b) => a.display_order - b.display_order);
}

// Cria um novo pedido no localStorage
export async function createOrder(data) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const orders = loadOrders();

  const newOrder = {
    id: generateId(),
    ...data,
    status: "confirmed",
    created_date: new Date().toISOString(),
  };

  orders.push(newOrder);
  saveOrders(orders);

  return newOrder;
}

// Busca um pedido específico
export async function getOrder(id) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return loadOrders().find((order) => order.id === id) || null;
}

// Busca todos os pedidos
export async function getOrders() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return loadOrders().sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  );
}

// Atualiza o status de um pedido
export async function updateOrderStatus(orderId, newStatus) {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const orders = loadOrders();

  const updatedOrders = orders.map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    return {
      ...order,
      status: newStatus,
      updated_date: new Date().toISOString(),
    };
  });

  saveOrders(updatedOrders);

  return updatedOrders.find((order) => order.id === orderId) || null;
}

// Dados simulados do usuário
export async function getCurrentUser() {
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    full_name: "Cliente",
    email: "cliente@farofadoareias.com.br",
  };
}