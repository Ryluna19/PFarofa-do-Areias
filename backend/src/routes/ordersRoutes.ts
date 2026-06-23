import { Router } from "express";
import { pool } from "../database/pool.js";

type ProductRow = {
    id: number;
    name: string;
    emoji: string;
    price: string;
};

type CreatedOrderRow = {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: string;
    deliveryFee: string;
    total: string;
    createdAt: string;
};

type OrderItemInput = {
    productId: number;
    quantity: number;
    customization: Record<string, unknown>;
};

class HttpError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRequiredText(
    value: unknown,
    fieldName: string,
    maxLength: number
) {
    if (typeof value !== "string" || !value.trim()) {
        throw new HttpError(400, `${fieldName} is required`);
    }

    const text = value.trim();

    if (text.length > maxLength) {
        throw new HttpError(
            400,
            `${fieldName} must have at most ${maxLength} characters`
        );
    }

    return text;
}

function getOptionalText(value: unknown, maxLength: number) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    if (typeof value !== "string") {
        throw new HttpError(400, "Invalid optional text field");
    }

    const text = value.trim();

    if (text.length > maxLength) {
        throw new HttpError(
            400,
            `Optional text field must have at most ${maxLength} characters`
        );
    }

    return text || null;
}

function getOrderItems(value: unknown): OrderItemInput[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new HttpError(400, "Order must contain at least one item");
    }

    return value.map((item) => {
        if (!isRecord(item)) {
            throw new HttpError(400, "Invalid order item");
        }


        const productId = Number(item.productId);
        const quantity = Number(item.quantity);

        if (!Number.isInteger(productId) || productId <= 0) {
            throw new HttpError(400, "Invalid productId");
        }

        if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 20) {
            throw new HttpError(400, "Invalid quantity");
        }

        if (
            item.customization !== undefined &&
            !isRecord(item.customization)
        ) {
            throw new HttpError(400, "Invalid customization");
        }

        return {
            productId,
            quantity,
            customization: isRecord(item.customization)
                ? item.customization
                : {},
        };


    });
}

export const ordersRouter = Router();

ordersRouter.post("/", async (request, response) => {
    const body = request.body as Record<string, unknown>;

    try {
        if (
            !isRecord(body.customer) ||
            !isRecord(body.address) ||
            !isRecord(body.payment)
        ) {
            throw new HttpError(400, "Customer, address and payment are required");
        }


        const customerName = getRequiredText(
            body.customer.name,
            "customer.name",
            100
        );

        const customerPhone = getRequiredText(
            body.customer.phone,
            "customer.phone",
            20
        );

        const deliveryStreet = getRequiredText(
            body.address.rua,
            "address.rua",
            150
        );

        const deliveryNumber = getRequiredText(
            body.address.numero,
            "address.numero",
            20
        );

        const deliveryComplement = getOptionalText(
            body.address.complemento,
            100
        );

        const deliveryNeighborhood = getRequiredText(
            body.address.bairro,
            "address.bairro",
            100
        );

        const deliveryCity = getRequiredText(
            body.address.cidade,
            "address.cidade",
            100
        );

        const deliveryZipCode = getOptionalText(
            body.address.cep,
            9
        );

        const paymentMethod = body.payment.method;

        if (
            typeof paymentMethod !== "string" ||
            !["pix", "cartao", "dinheiro"].includes(paymentMethod)
        ) {
            throw new HttpError(400, "Invalid payment method");
        }

        const paymentDetails = isRecord(body.payment.details)
            ? body.payment.details
            : {};

        const orderItemsInput = getOrderItems(body.items);
        const productIds = [
            ...new Set(orderItemsInput.map((item) => item.productId)),
        ];

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const productsResult = await client.query<ProductRow>(
                `
      SELECT id, name, emoji, price
      FROM products
      WHERE id = ANY($1::int[])
        AND active = TRUE
    `,
                [productIds]
            );

            const productsById = new Map(
                productsResult.rows.map((product) => [product.id, product])
            );

            const missingProductIds = productIds.filter(
                (productId) => !productsById.has(productId)
            );

            if (missingProductIds.length > 0) {
                throw new HttpError(400, "One or more products are unavailable");
            }

            const orderItems = orderItemsInput.map((item) => {
                const product = productsById.get(item.productId);

                if (!product) {
                    throw new HttpError(400, "Product not found");
                }

                return {
                    productId: product.id,
                    productName: product.name,
                    productEmoji: product.emoji,
                    unitPrice: Number(product.price),
                    quantity: item.quantity,
                    customization: item.customization,
                };
            });

            const subtotal = Number(
                orderItems
                    .reduce(
                        (total, item) => total + item.unitPrice * item.quantity,
                        0
                    )
                    .toFixed(2)
            );

            const deliveryFee = 5;
            const total = Number((subtotal + deliveryFee).toFixed(2));

            const createdOrderResult = await client.query<CreatedOrderRow>(
                `
      INSERT INTO orders (
        customer_name,
        customer_phone,
        delivery_street,
        delivery_number,
        delivery_complement,
        delivery_neighborhood,
        delivery_city,
        delivery_zip_code,
        payment_method,
        payment_details,
        subtotal,
        delivery_fee,
        total
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13
      )
      RETURNING
        id,
        order_number AS "orderNumber",
        status,
        subtotal,
        delivery_fee AS "deliveryFee",
        total,
        created_at AS "createdAt"
    `,
                [
                    customerName,
                    customerPhone,
                    deliveryStreet,
                    deliveryNumber,
                    deliveryComplement,
                    deliveryNeighborhood,
                    deliveryCity,
                    deliveryZipCode,
                    paymentMethod,
                    JSON.stringify(paymentDetails),
                    subtotal,
                    deliveryFee,
                    total,
                ]
            );

            const createdOrder = createdOrderResult.rows[0];

            for (const item of orderItems) {
                await client.query(
                    `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          product_emoji,
          unit_price,
          quantity,
          customization
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      `,
                    [
                        createdOrder.id,
                        item.productId,
                        item.productName,
                        item.productEmoji,
                        item.unitPrice,
                        item.quantity,
                        JSON.stringify(item.customization),
                    ]
                );
            }

            await client.query(
                `
      INSERT INTO order_status_history (
        order_id,
        previous_status,
        new_status
      )
      VALUES ($1, NULL, 'confirmed')
    `,
                [createdOrder.id]
            );

            await client.query("COMMIT");

            return response.status(201).json({
                ...createdOrder,
                orderNumber: Number(createdOrder.orderNumber),
                subtotal: Number(createdOrder.subtotal),
                deliveryFee: Number(createdOrder.deliveryFee),
                total: Number(createdOrder.total),
            });
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }


    } catch (error) {
        if (error instanceof HttpError) {
            return response.status(error.statusCode).json({
                error: error.message,
            });
        }


        console.error("Failed to create order:", error);

        return response.status(500).json({
            error: "Unable to create order",
        });


    }
});

type OrderDetailsRow = {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: string;
    deliveryFee: string;
    total: string;
    paymentMethod: string;
    createdAt: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
};

type OrderItemRow = {
    id: number;
    productName: string;
    productEmoji: string;
    unitPrice: string;
    quantity: number;
    customization: Record<string, unknown>;
};

ordersRouter.get("/:id", async (request, response) => {
    try {
        const orderId = request.params.id;


        const orderResult = await pool.query<OrderDetailsRow>(
            `
    SELECT
      id,
      order_number AS "orderNumber",
      status,
      subtotal,
      delivery_fee AS "deliveryFee",
      total,
      payment_method AS "paymentMethod",
      created_at AS "createdAt",
      delivery_street AS street,
      delivery_number AS number,
      delivery_neighborhood AS neighborhood,
      delivery_city AS city
    FROM orders
    WHERE id = $1
  `,
            [orderId]
        );

        const order = orderResult.rows[0];

        if (!order) {
            return response.status(404).json({
                error: "Order not found",
            });
        }

        const itemsResult = await pool.query<OrderItemRow>(
            `
    SELECT
      id,
      product_name AS "productName",
      product_emoji AS "productEmoji",
      unit_price AS "unitPrice",
      quantity,
      customization
    FROM order_items
    WHERE order_id = $1
    ORDER BY id ASC
  `,
            [orderId]
        );

        return response.status(200).json({
            id: order.id,
            orderNumber: Number(order.orderNumber),
            status: order.status,
            subtotal: Number(order.subtotal),
            deliveryFee: Number(order.deliveryFee),
            total: Number(order.total),
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            address: {
                rua: order.street,
                numero: order.number,
                bairro: order.neighborhood,
                cidade: order.city,
            },
            items: itemsResult.rows.map((item) => ({
                id: item.id,
                name: item.productName,
                emoji: item.productEmoji,
                price: Number(item.unitPrice),
                quantity: item.quantity,
                customization: item.customization,
            })),
        });


    } catch (error) {
        console.error("Failed to fetch order:", error);


        return response.status(500).json({
            error: "Unable to fetch order",
        });


    }
});

