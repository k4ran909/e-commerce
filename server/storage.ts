import {
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private orders: Map<string, Order>;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.seedProducts();
  }

  private seedProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Rose Gold Diamond Ring",
        description:
          "Exquisite handcrafted rose gold ring featuring a brilliant-cut diamond. Perfect for engagements or special occasions. Each piece is carefully crafted by skilled artisans.",
        price: 2500000,
        category: "rings",
        imageUrl: "/assets/generated_images/Rose_gold_diamond_ring_406b3b84.png",
        images: [
          "/assets/generated_images/Rose_gold_diamond_ring_406b3b84.png",
          "/assets/generated_images/Rose_gold_diamond_ring_406b3b84.png",
        ],
        material: "14K Rose Gold, Diamond",
        isPreOrder: false,
        inStock: true,
        sizes: ["5", "6", "7", "8", "9"],
      },
      {
        name: "Gold Pendant Necklace",
        description:
          "Delicate gold chain necklace with an elegant pendant. A timeless piece that complements any outfit. Crafted from premium materials.",
        price: 1800000,
        category: "necklaces",
        imageUrl: "/assets/generated_images/Gold_pendant_necklace_84aa4494.png",
        images: [
          "/assets/generated_images/Gold_pendant_necklace_84aa4494.png",
          "/assets/generated_images/Gold_pendant_necklace_84aa4494.png",
        ],
        material: "18K Yellow Gold",
        isPreOrder: false,
        inStock: true,
      },
      {
        name: "Silver Charm Bracelet",
        description:
          "Elegant sterling silver bracelet with customizable charm options. A perfect gift for loved ones. Each charm tells a unique story.",
        price: 950000,
        category: "bracelets",
        imageUrl: "/assets/generated_images/Silver_charm_bracelet_db9c5a93.png",
        images: [
          "/assets/generated_images/Silver_charm_bracelet_db9c5a93.png",
          "/assets/generated_images/Silver_charm_bracelet_db9c5a93.png",
        ],
        material: "Sterling Silver",
        isPreOrder: false,
        inStock: true,
        sizes: ["S", "M", "L"],
      },
      {
        name: "Pearl Stud Earrings",
        description:
          "Classic pearl earrings set in premium metal. Timeless elegance for everyday wear. Perfect for both casual and formal occasions.",
        price: 750000,
        category: "earrings",
        imageUrl: "/assets/generated_images/Pearl_stud_earrings_00219806.png",
        images: [
          "/assets/generated_images/Pearl_stud_earrings_00219806.png",
          "/assets/generated_images/Pearl_stud_earrings_00219806.png",
        ],
        material: "Freshwater Pearl, Sterling Silver",
        isPreOrder: false,
        inStock: true,
      },
      {
        name: "Rose Gold Stackable Rings Set",
        description:
          "Set of three delicate stackable rings in rose gold. Mix and match for a personalized look. Each ring is designed to complement the others beautifully.",
        price: 1650000,
        category: "rings",
        imageUrl: "/assets/generated_images/Rose_gold_stackable_rings_c4608c25.png",
        images: [
          "/assets/generated_images/Rose_gold_stackable_rings_c4608c25.png",
          "/assets/generated_images/Rose_gold_stackable_rings_c4608c25.png",
        ],
        material: "14K Rose Gold",
        isPreOrder: true,
        inStock: false,
        sizes: ["5", "6", "7", "8", "9"],
      },
      {
        name: "Gold Hoop Earrings",
        description:
          "Modern hoop earrings in polished gold. Versatile and sophisticated for any occasion. A must-have addition to your jewelry collection.",
        price: 1200000,
        category: "earrings",
        imageUrl: "/assets/generated_images/Gold_hoop_earrings_86358172.png",
        images: [
          "/assets/generated_images/Gold_hoop_earrings_86358172.png",
          "/assets/generated_images/Gold_hoop_earrings_86358172.png",
        ],
        material: "18K Yellow Gold",
        isPreOrder: false,
        inStock: true,
      },
      {
        name: "Silver Infinity Necklace",
        description:
          "Symbolic infinity pendant on a delicate silver chain. Represents eternal love and friendship. A meaningful gift for someone special.",
        price: 850000,
        category: "necklaces",
        imageUrl: "/assets/generated_images/Silver_infinity_necklace_eb3fd355.png",
        images: [
          "/assets/generated_images/Silver_infinity_necklace_eb3fd355.png",
          "/assets/generated_images/Silver_infinity_necklace_eb3fd355.png",
        ],
        material: "Sterling Silver",
        isPreOrder: false,
        inStock: true,
      },
      {
        name: "Diamond Tennis Bracelet",
        description:
          "Luxurious tennis bracelet featuring brilliant diamonds. A statement piece for special events. Expertly crafted for maximum sparkle.",
        price: 3500000,
        category: "bracelets",
        imageUrl: "/assets/generated_images/Silver_charm_bracelet_db9c5a93.png",
        images: [
          "/assets/generated_images/Silver_charm_bracelet_db9c5a93.png",
          "/assets/generated_images/Silver_charm_bracelet_db9c5a93.png",
        ],
        material: "18K White Gold, Diamonds",
        isPreOrder: true,
        inStock: false,
        sizes: ["S", "M", "L"],
      },
    ];

    sampleProducts.forEach((product) => {
      const id = randomUUID();
      this.products.set(id, { ...product, id });
    });
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
