import { Router } from "express";
import { pool } from "../database/pool.js";

type ProductRow = {
id: number;
name: string;
category: string;
description: string;
price: string;
emoji: string;
hasCustomization: boolean;
active: boolean;
displayOrder: number;
};

export const productsRouter = Router();

productsRouter.get("/", async (_request, response) => {
try {
const result = await pool.query<ProductRow>(`       SELECT
        id,
        name,
        category,
        description,
        price,
        emoji,
        has_customization AS "hasCustomization",
        active,
        display_order AS "displayOrder"
      FROM products
      WHERE active = TRUE
      ORDER BY display_order ASC
    `);


const products = result.rows.map((product) => ({
  ...product,
  price: Number(product.price),
}));

return response.status(200).json(products);


} catch (error) {
console.error("Failed to fetch products:", error);


return response.status(500).json({
  error: "Unable to fetch products",
});


}
});
