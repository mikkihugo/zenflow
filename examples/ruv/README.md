# RUV REST API

A complete REST API built with Express.js and TypeScript featuring CRUD operations for users, products, and orders.

## Features

- RESTful API design
- TypeScript for type safety
- Express.js framework
- In-memory database with mock data
- CRUD operations for Users, Products, and Orders
- Error handling middleware
- CORS support
- Security headers with Helmet
- Request logging with Morgan

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```bash
cp .env.example .env
```

### Running the Application

#### Development mode:
```bash
npm run dev
```

#### Production mode:
```bash
npm run build
npm start
```

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `PATCH /api/v1/users/:id` - Partial update user
- `DELETE /api/v1/users/:id` - Delete user

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `PATCH /api/v1/products/:id` - Partial update product
- `DELETE /api/v1/products/:id` - Delete product

### Orders
- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders/:id` - Get order by ID
- `GET /api/v1/orders/user/:userId` - Get orders by user ID
- `POST /api/v1/orders` - Create new order
- `PATCH /api/v1/orders/:id/status` - Update order status
- `DELETE /api/v1/orders/:id` - Delete order

## Request & Response Examples

### Create User
**Request:**
```json
POST /api/v1/users
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "User created successfully"
}
```

### Create Product
**Request:**
```json
POST /api/v1/products
Content-Type: application/json

{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 29.99,
  "category": "Electronics",
  "stock": 150
}
```

### Create Order
**Request:**
```json
POST /api/v1/orders
Content-Type: application/json

{
  "userId": "1",
  "products": [
    {
      "productId": "1",
      "quantity": 2,
      "price": 999.99
    },
    {
      "productId": "2",
      "quantity": 1,
      "price": 699.99
    }
  ]
}
```

## Project Structure

```
src/
├── index.ts              # Application entry point
├── types/                # TypeScript type definitions
│   └── index.ts         # Shared interfaces
├── models/              # Data models
│   └── database.ts      # In-memory database
├── controllers/         # Request handlers
│   ├── userController.ts
│   ├── productController.ts
│   └── orderController.ts
├── routes/              # API routes
│   ├── index.ts
│   ├── userRoutes.ts
│   ├── productRoutes.ts
│   └── orderRoutes.ts
├── middleware/          # Custom middleware
│   ├── errorHandler.ts
│   └── notFound.ts
└── utils/              # Utility functions
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests (when configured)

## Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Nodemon** - Development auto-restart
- **ESLint** - Code linting
- **Prettier** - Code formatting

## License

MIT