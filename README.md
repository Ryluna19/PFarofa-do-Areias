# 🥘 Farofa do Areias

[![Backend Tests](https://github.com/Ryluna19/PFarofa-do-Areias/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/Ryluna19/PFarofa-do-Areias/actions/workflows/backend-tests.yml)

Full-stack restaurant ordering application where customers can customize products, place orders, track delivery progress, and where administrators manage the restaurant workflow.

The project started as an academic Base44 prototype and was evolved into a full-stack application with a custom backend, PostgreSQL persistence, JWT authentication, automated tests, and GitHub Actions CI.

## Features

### Customer flow

* Product menu loaded from PostgreSQL
* Product customization before adding items to the cart
* Cart persistence with LocalStorage
* Delivery address and customer information persistence
* Simulated Pix, card, and cash payment options
* Order creation through a REST API
* Server-side price calculation using database values
* Public order tracking through a unique order ID
* Real delivery timeline with status history

### Admin flow

* Protected administrator login with JWT
* Administrative dashboard with received orders and revenue
* Order status updates through a controlled workflow
* Status history linked to the administrator who changed it
* Protected routes for order listing and status updates
* Automatic session handling when the token becomes invalid or expires

## Order status workflow

```text
Confirmed → Preparing → Out for delivery → Delivered
```

The API prevents invalid jumps, such as changing an order directly from `confirmed` to `delivered`.

## Tech stack

### Frontend

* React 18
* Vite
* JavaScript
* Tailwind CSS
* React Router DOM
* TanStack React Query
* Lucide React

### Backend

* Node.js
* Express
* TypeScript
* PostgreSQL
* pg
* bcrypt
* JSON Web Token
* dotenv

### Quality and tooling

* Vitest
* Supertest
* GitHub Actions
* Prettier
* ESLint
* Git and GitHub

## Architecture

```text
React frontend
        ↓
Express API with TypeScript
        ↓
PostgreSQL database
```

The frontend communicates with the API through `src/lib/dataService.js`.

The backend is responsible for:

* validating order data;
* calculating totals using database prices;
* creating orders, items, and status history in transactions;
* protecting administrator routes with JWT;
* controlling valid status transitions.

## Database structure

```text
admins
products
orders
order_items
order_status_history
```

The order history table records each status update, including the previous status, new status, timestamp, and administrator responsible for the change.

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/Ryluna19/PFarofa-do-Areias.git
cd PFarofa-do-Areias
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Create the PostgreSQL database

Create a PostgreSQL database named:

```text
farofa_do_areias
```

Run these files in order through pgAdmin Query Tool:

```text
backend/database/schema.sql
backend/database/seed.sql
```

### 5. Configure environment variables

Create a `backend/.env` file:

```env
PORT=3000

DB_USER=postgres
DB_HOST=localhost
DB_NAME=farofa_do_areias
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_PORT=5433

JWT_SECRET=YOUR_RANDOM_JWT_SECRET
```

Use your own PostgreSQL port if it differs from `5433`.

### 6. Run the application

Open one terminal for the backend:

```bash
cd backend
npm run dev
```

Open another terminal in the project root for the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:3000/api/health
```

## Demo administrator credentials

```text
Email: admin@farofadoareias.local
Password: admin12345
```

These credentials are created by `backend/database/seed.sql` and are intended only for local demonstration.

## API endpoints

| Method | Endpoint                 | Description                                   |
| ------ | ------------------------ | --------------------------------------------- |
| GET    | `/api/health`            | API health check                              |
| GET    | `/api/products`          | Returns active menu products                  |
| POST   | `/api/orders`            | Creates a new customer order                  |
| GET    | `/api/orders/:id`        | Returns public tracking information           |
| GET    | `/api/orders`            | Returns all orders for authenticated admins   |
| PATCH  | `/api/orders/:id/status` | Updates order status for authenticated admins |
| POST   | `/api/auth/login`        | Authenticates an administrator                |

## Testing

The backend has automated tests covering:

* API health check
* Administrator login
* JWT authentication middleware
* Product listing
* Order validation
* Server-side order price calculation
* Product availability validation
* Transaction rollback behavior
* Public order tracking
* Status transition rules
* Status history creation

Run tests:

```bash
cd backend
npm test
```

Run test coverage:

```bash
npm run coverage
```

Check TypeScript types:

```bash
npm run typecheck
```

Build the backend:

```bash
npm run build
```

## Continuous Integration

GitHub Actions automatically runs on every push and pull request:

```text
Install dependencies
→ TypeScript type check
→ Automated tests
→ Backend build
```

This helps prevent broken code from being pushed without validation.

## Future improvements

* Customer accounts and personal order history
* Product management inside the admin dashboard
* Sales dashboard with date filters
* Delivery fee based on neighborhood
* Better product availability controls
* Rate limiting for public endpoints
* Deployment with separate frontend and backend environments

## Author

Ryan Santos

[GitHub](https://github.com/Ryluna19) · [LinkedIn](https://www.linkedin.com/in/ryan-bulhoes-santos-560b25225/) · [Portfolio](https://ryluna19.github.io/PProfile/)
