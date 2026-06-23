const STORAGE_KEY = "farofa_orders";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function getProducts() {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Unable to fetch products");
  }

  const products = await response.json();

  return products.map((product) => ({
    ...product,
    has_customization: product.hasCustomization,
    display_order: product.displayOrder,
  }));
}

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

export async function getOrder(id) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return loadOrders().find((order) => order.id === id) || null;
}

export async function getOrders() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return loadOrders().sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  );
}

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

export async function getCurrentUser() {
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    full_name: "Cliente",
    email: "cliente@farofadoareias.com.br",
  };
}