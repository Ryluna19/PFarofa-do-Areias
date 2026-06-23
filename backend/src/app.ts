import cors from "cors";
import express from "express";
import { ordersRouter } from "./routes/ordersRoutes.js";
import { productsRouter } from "./routes/productsRoutes.js";

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/api/health", (_request, response) => {
        response.status(200).json({
            message: "Farofa do Areias API is running",
        });
    });

    app.use("/api/products", productsRouter);
    app.use("/api/orders", ordersRouter);

    return app;
}
