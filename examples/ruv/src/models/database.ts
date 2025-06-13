import { User, Product, Order } from '../types';

class Database {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private orders: Map<string, Order> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const users: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const products: Product[] = [
      {
        id: '1',
        name: 'Laptop',
        description: 'High-performance laptop',
        price: 999.99,
        category: 'Electronics',
        stock: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Smartphone',
        description: 'Latest model smartphone',
        price: 699.99,
        category: 'Electronics',
        stock: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Coffee Maker',
        description: 'Automatic coffee maker',
        price: 79.99,
        category: 'Appliances',
        stock: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    users.forEach(user => this.users.set(user.id, user));
    products.forEach(product => this.products.set(product.id, product));
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: String(this.users.size + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: String(this.products.size + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(newProduct.id, newProduct);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | undefined {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  getOrdersByUserId(userId: string): Order[] {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const newOrder: Order = {
      ...order,
      id: String(this.orders.size + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Order | undefined {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = {
      ...order,
      ...updates,
      updatedAt: new Date(),
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  deleteOrder(id: string): boolean {
    return this.orders.delete(id);
  }
}

export const db = new Database();