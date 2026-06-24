import request from "supertest";
import jwt from "jsonwebtoken";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pool } from "../database/pool.js";
import { createApp } from "../app.js";

const TEST_JWT_SECRET = "farofa-test-jwt-secret";

process.env.JWT_SECRET = TEST_JWT_SECRET;

function createAdminToken() {
  return jwt.sign(
    {
      email: "admin@farofadoareias.local",
      role: "admin",
    },
    TEST_JWT_SECRET,
    {
      subject: "1",
      expiresIn: "1h",
    },
  );
}

type MockProduct = {
  id: number;
  name: string;
  emoji: string;
  price: string;
};

function createMockClient(products: MockProduct[] = []) {
  const query = vi.fn(async (...args: unknown[]) => {
    const [queryText] = args;
    const sql = String(queryText);

    // Returns active products used to calculate the order total.
    if (sql.includes("SELECT id, name, emoji, price")) {
      return { rows: products };
    }

    // Simulates the order created by PostgreSQL.
    if (sql.includes("INSERT INTO orders")) {
      return {
        rows: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            orderNumber: "10",
            status: "confirmed",
            subtotal: "59.70",
            deliveryFee: "5.00",
            total: "64.70",
            createdAt: "2026-06-23T12:00:00.000Z",
          },
        ],
      };
    }

    return { rows: [] };
  });

  return {
    query,
    release: vi.fn(),
  };
}

describe("POST /api/orders", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects an order without items", async () => {
    const connectSpy = vi.spyOn(pool, "connect");

    const response = await request(createApp())
      .post("/api/orders")
      .send({
        customer: {
          name: "Ryan Santos",
          phone: "21999999999",
        },
        address: {
          rua: "Rua Teste",
          numero: "123",
          bairro: "Centro",
          cidade: "Rio de Janeiro",
        },
        payment: {
          method: "pix",
          details: {},
        },
        items: [],
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Order must contain at least one item",
    });

    expect(connectSpy).not.toHaveBeenCalled();
  });

  it("creates an order using prices from the database", async () => {
    const client = createMockClient([
      {
        id: 1,
        name: "Farofa de Bacon com Ovo",
        emoji: "🥓",
        price: "24.90",
      },
      {
        id: 6,
        name: "Suco Natural de Frutas",
        emoji: "🧃",
        price: "9.90",
      },
    ]);

    vi.spyOn(pool, "connect").mockResolvedValue(client as never);

    const response = await request(createApp())
      .post("/api/orders")
      .send({
        customer: {
          name: "Ryan Santos",
          phone: "21999999999",
        },
        address: {
          rua: "Rua Teste",
          numero: "123",
          complemento: "Apto 4",
          bairro: "Centro",
          cidade: "Rio de Janeiro",
          cep: "20000-000",
        },
        payment: {
          method: "pix",
          details: {
            type: "simulated",
          },
        },
        items: [
          {
            productId: 1,
            quantity: 2,
            customization: {
              semCebola: true,
            },
          },
          {
            productId: 6,
            quantity: 1,
            customization: {},
          },
        ],
      });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      orderNumber: 10,
      status: "confirmed",
      subtotal: 59.7,
      deliveryFee: 5,
      total: 64.7,
      createdAt: "2026-06-23T12:00:00.000Z",
    });

    expect(client.query).toHaveBeenCalledWith("BEGIN");
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("rolls back when one or more products are unavailable", async () => {
    const client = createMockClient([]);

    vi.spyOn(pool, "connect").mockResolvedValue(client as never);

    const response = await request(createApp())
      .post("/api/orders")
      .send({
        customer: {
          name: "Ryan Santos",
          phone: "21999999999",
        },
        address: {
          rua: "Rua Teste",
          numero: "123",
          bairro: "Centro",
          cidade: "Rio de Janeiro",
        },
        payment: {
          method: "dinheiro",
          details: {},
        },
        items: [
          {
            productId: 999,
            quantity: 1,
            customization: {},
          },
        ],
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "One or more products are unavailable",
    });

    expect(client.query).toHaveBeenCalledWith("BEGIN");
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.query).not.toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalledTimes(1);
  });
});

describe("GET /api/orders/:id", () => {
  const trackingOrderId = "11111111-1111-4111-8111-111111111111";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects an invalid tracking id before querying the database", async () => {
    const querySpy = vi.spyOn(pool, "query");

    const response = await request(createApp()).get(
      "/api/orders/invalid-order-id",
    );

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Invalid order id",
    });

    expect(querySpy).not.toHaveBeenCalled();
  });

  it("returns 404 when the order does not exist", async () => {
    // Simulates a database search with no matching order.
    vi.spyOn(pool, "query").mockResolvedValue({
      rows: [],
    } as never);

    const response = await request(createApp()).get(
      `/api/orders/${trackingOrderId}`,
    );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      error: "Order not found",
    });
  });

  it("returns public tracking details with items and history", async () => {
    // Simulates the order, its items, and its status timeline.
    const querySpy = vi
      .spyOn(pool, "query")
      .mockResolvedValueOnce({
        rows: [
          {
            id: trackingOrderId,
            orderNumber: "10",
            status: "preparing",
            subtotal: "24.90",
            deliveryFee: "5.00",
            total: "29.90",
            paymentMethod: "pix",
            createdAt: "2026-06-23T12:00:00.000Z",
            street: "Rua Teste",
            number: "123",
            neighborhood: "Centro",
            city: "Rio de Janeiro",
          },
        ],
      } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            productName: "Farofa de Bacon com Ovo",
            productEmoji: "🥓",
            unitPrice: "24.90",
            quantity: 1,
            customization: {
              semCebola: true,
            },
          },
        ],
      } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            previousStatus: null,
            newStatus: "confirmed",
            createdAt: "2026-06-23T12:00:00.000Z",
          },
          {
            previousStatus: "confirmed",
            newStatus: "preparing",
            createdAt: "2026-06-23T12:10:00.000Z",
          },
        ],
      } as never);

    const response = await request(createApp()).get(
      `/api/orders/${trackingOrderId}`,
    );

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      id: trackingOrderId,
      orderNumber: 10,
      status: "preparing",
      subtotal: 24.9,
      deliveryFee: 5,
      total: 29.9,
      paymentMethod: "pix",
      createdAt: "2026-06-23T12:00:00.000Z",
      address: {
        rua: "Rua Teste",
        numero: "123",
        bairro: "Centro",
        cidade: "Rio de Janeiro",
      },
      items: [
        {
          id: 1,
          name: "Farofa de Bacon com Ovo",
          emoji: "🥓",
          price: 24.9,
          quantity: 1,
          customization: {
            semCebola: true,
          },
        },
      ],
      history: [
        {
          previousStatus: null,
          status: "confirmed",
          createdAt: "2026-06-23T12:00:00.000Z",
        },
        {
          previousStatus: "confirmed",
          status: "preparing",
          createdAt: "2026-06-23T12:10:00.000Z",
        },
      ],
    });

    expect(querySpy).toHaveBeenCalledTimes(3);
  });
});

describe("PATCH /api/orders/:id/status", () => {
  const orderId = "11111111-1111-4111-8111-111111111111";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("updates the order status and saves the history entry", async () => {
    const query = vi.fn(async (...args: unknown[]) => {
      const [queryText] = args;
      const sql = String(queryText);

      // Returns the current order status before the update.
      if (sql.includes("SELECT status")) {
        return {
          rows: [
            {
              status: "confirmed",
            },
          ],
        };
      }

      // Returns the updated order data.
      if (sql.includes("UPDATE orders")) {
        return {
          rows: [
            {
              id: orderId,
              orderNumber: "10",
              status: "preparing",
              updatedAt: "2026-06-23T12:10:00.000Z",
            },
          ],
        };
      }

      return {
        rows: [],
      };
    });

    const client = {
      query,
      release: vi.fn(),
    };

    vi.spyOn(pool, "connect").mockResolvedValue(client as never);

    const response = await request(createApp())
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${createAdminToken()}`)
      .send({
        status: "preparing",
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      id: orderId,
      orderNumber: 10,
      status: "preparing",
      updatedAt: "2026-06-23T12:10:00.000Z",
    });

    expect(query).toHaveBeenCalledWith("BEGIN");
    expect(query).toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalledTimes(1);

    const historyCall = query.mock.calls.find(([queryText]) =>
      String(queryText).includes("INSERT INTO order_status_history"),
    );

    expect(historyCall?.[1]).toEqual([orderId, "confirmed", "preparing", 1]);
  });

  it("rejects an invalid status transition", async () => {
    const query = vi.fn(async (queryText: unknown) => {
      const sql = String(queryText);

      // Returns a confirmed order to test an invalid jump.
      if (sql.includes("SELECT status")) {
        return {
          rows: [
            {
              status: "confirmed",
            },
          ],
        };
      }

      return {
        rows: [],
      };
    });

    const client = {
      query,
      release: vi.fn(),
    };

    vi.spyOn(pool, "connect").mockResolvedValue(client as never);

    const response = await request(createApp())
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${createAdminToken()}`)
      .send({
        status: "delivered",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Invalid status transition from confirmed to delivered",
    });

    expect(query).toHaveBeenCalledWith("BEGIN");
    expect(query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalledTimes(1);

    const updateCall = query.mock.calls.find(([queryText]) =>
      String(queryText).includes("UPDATE orders"),
    );

    expect(updateCall).toBeUndefined();
  });

  it("rejects an invalid order id before opening a transaction", async () => {
    const connectSpy = vi.spyOn(pool, "connect");

    const response = await request(createApp())
      .patch("/api/orders/invalid-id/status")
      .set("Authorization", `Bearer ${createAdminToken()}`)
      .send({
        status: "preparing",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Invalid order id",
    });

    expect(connectSpy).not.toHaveBeenCalled();
  });
});
