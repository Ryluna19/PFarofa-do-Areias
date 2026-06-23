CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE admins (
id SERIAL PRIMARY KEY,
full_name VARCHAR(100) NOT NULL CHECK (char_length(trim(full_name)) >= 2),
email VARCHAR(255) NOT NULL UNIQUE CHECK (email = lower(trim(email))),
password_hash VARCHAR(255) NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL UNIQUE,
category VARCHAR(30) NOT NULL CHECK (
category IN ('Farofas', 'Acompanhamentos', 'Bebidas')
),
description VARCHAR(255) NOT NULL,
price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
emoji VARCHAR(20) NOT NULL,
has_customization BOOLEAN NOT NULL DEFAULT FALSE,
active BOOLEAN NOT NULL DEFAULT TRUE,
display_order INTEGER NOT NULL UNIQUE CHECK (display_order > 0),
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
order_number BIGSERIAL NOT NULL UNIQUE,
customer_name VARCHAR(100) NOT NULL,
customer_phone VARCHAR(20) NOT NULL,
delivery_street VARCHAR(150) NOT NULL,
delivery_number VARCHAR(20) NOT NULL,
delivery_complement VARCHAR(100),
delivery_neighborhood VARCHAR(100) NOT NULL,
delivery_city VARCHAR(100) NOT NULL,
delivery_zip_code VARCHAR(9),
payment_method VARCHAR(20) NOT NULL CHECK (
payment_method IN ('pix', 'cartao', 'dinheiro')
),
payment_details JSONB NOT NULL DEFAULT '{}'::jsonb,
subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
delivery_fee NUMERIC(10, 2) NOT NULL CHECK (delivery_fee >= 0),
total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (
status IN ('confirmed', 'preparing', 'out_for_delivery', 'delivered')
),
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT orders_total_matches_values CHECK (total = subtotal + delivery_fee)
);

CREATE TABLE order_items (
id SERIAL PRIMARY KEY,
order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
product_name VARCHAR(100) NOT NULL,
product_emoji VARCHAR(20) NOT NULL,
unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
quantity INTEGER NOT NULL CHECK (quantity > 0),
customization JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE order_status_history (
id SERIAL PRIMARY KEY,
order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
previous_status VARCHAR(30) CHECK (
previous_status IS NULL OR previous_status IN (
'confirmed',
'preparing',
'out_for_delivery',
'delivered'
)
),
new_status VARCHAR(30) NOT NULL CHECK (
new_status IN (
'confirmed',
'preparing',
'out_for_delivery',
'delivered'
)
),
changed_by_admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_status_created_at
ON orders (status, created_at DESC);

CREATE INDEX idx_order_items_order_id
ON order_items (order_id);

CREATE INDEX idx_order_status_history_order_id
ON order_status_history (order_id);
