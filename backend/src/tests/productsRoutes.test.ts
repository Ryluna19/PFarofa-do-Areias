import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pool } from "../database/pool.js";
import { createApp } from "../app.js";

describe("GET /api/products", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns active products ordered by display order", async () => {
    // Simulates products returned by PostgreSQL.
    const querySpy = vi.spyOn(pool, "query").mockResolvedValue({
      rows: [
        {
          id: 1,
          name: "Farofa de Bacon com Ovo",
          category: "Farofas",
          description: "Farofa crocante com bacon e ovo",
          price: "24.90",
          emoji: "🥓",
          hasCustomization: true,
          active: true,
          displayOrder: 1,
        },
        {
          id: 6,
          name: "Suco Natural de Frutas",
          category: "Bebidas",
          description: "Suco natural",
          price: "9.90",
          emoji: "🧃",
          hasCustomization: false,
          active: true,
          displayOrder: 6,
        },
      ],
    } as never);

    const response = await request(createApp()).get("/api/products");

    expect(response.status).toBe(200);

    expect(response.body).toEqual([
      {
        id: 1,
        name: "Farofa de Bacon com Ovo",
        category: "Farofas",
        description: "Farofa crocante com bacon e ovo",
        price: 24.9,
        emoji: "🥓",
        hasCustomization: true,
        active: true,
        displayOrder: 1,
      },
      {
        id: 6,
        name: "Suco Natural de Frutas",
        category: "Bebidas",
        description: "Suco natural",
        price: 9.9,
        emoji: "🧃",
        hasCustomization: false,
        active: true,
        displayOrder: 6,
      },
    ]);

    expect(querySpy).toHaveBeenCalledTimes(1);
  });

  it("returns an error when the database query fails", async () => {
    // Hides the expected route error during this simulated failure.
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.spyOn(pool, "query").mockRejectedValue(
      new Error("Database connection failed"),
    );

    const response = await request(createApp()).get("/api/products");

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      error: "Unable to fetch products",
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
