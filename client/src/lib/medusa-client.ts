/**
 * MedusaJS Client for JewelryCommerce
 * 
 * This client provides a clean interface to interact with MedusaJS backend APIs.
 * It handles all e-commerce operations including products, cart, checkout, and authentication.
 */

const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';

// Types
export interface Product {
    id: string;
    title: string;
    handle: string;
    description: string;
    thumbnail: string | null;
    images: Array<{ id: string; url: string }>;
    variants: ProductVariant[];
    options: ProductOption[];
    categories: Category[];
    collection: Collection | null;
    created_at: string;
    updated_at: string;
}

export interface ProductVariant {
    id: string;
    title: string;
    sku: string | null;
    inventory_quantity: number;
    prices: Price[];
    options: Array<{ value: string }>;
}

export interface Price {
    id: string;
    currency_code: string;
    amount: number;
}

export interface ProductOption {
    id: string;
    title: string;
    values: Array<{ value: string }>;
}

export interface Category {
    id: string;
    name: string;
    handle: string;
    parent_category_id: string | null;
    category_children: Category[];
}

export interface Collection {
    id: string;
    title: string;
    handle: string;
}

export interface Cart {
    id: string;
    email: string | null;
    items: LineItem[];
    region: Region;
    shipping_address: Address | null;
    billing_address: Address | null;
    shipping_methods: ShippingMethod[];
    payment_session: PaymentSession | null;
    subtotal: number;
    tax_total: number;
    shipping_total: number;
    discount_total: number;
    total: number;
}

export interface LineItem {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    variant: ProductVariant;
    quantity: number;
    unit_price: number;
    subtotal: number;
    total: number;
}

export interface Region {
    id: string;
    name: string;
    currency_code: string;
    countries: Array<{ iso_2: string; name: string }>;
}

export interface Address {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    country_code: string;
    postal_code: string;
    phone?: string;
}

export interface ShippingMethod {
    id: string;
    shipping_option: ShippingOption;
    price: number;
}

export interface ShippingOption {
    id: string;
    name: string;
    amount: number;
}

export interface PaymentSession {
    id: string;
    provider_id: string;
    status: string;
    data: Record<string, unknown>;
}

export interface Customer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    shipping_addresses: Address[];
    created_at: string;
}

export interface Order {
    id: string;
    display_id: number;
    status: string;
    fulfillment_status: string;
    payment_status: string;
    email: string;
    items: LineItem[];
    shipping_address: Address;
    billing_address: Address;
    shipping_methods: ShippingMethod[];
    subtotal: number;
    tax_total: number;
    shipping_total: number;
    discount_total: number;
    total: number;
    created_at: string;
}

// API Error class
export class MedusaError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'MedusaError';
        this.status = status;
        this.code = code;
    }
}

// Request helper
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${MEDUSA_BACKEND_URL}${endpoint}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add auth token if available
    const token = localStorage.getItem('medusa_token');
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Add publishable API key if available
    const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY;
    if (publishableKey) {
        (headers as Record<string, string>)['x-publishable-api-key'] = publishableKey;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for session-based auth
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new MedusaError(
            errorData.message || `API Error: ${response.status}`,
            response.status,
            errorData.code
        );
    }

    return response.json();
}

// ============================================
// STORE APIs (Customer-facing)
// ============================================

export const storeApi = {
    // Products
    products: {
        async list(params?: {
            limit?: number;
            offset?: number;
            q?: string;
            category_id?: string[];
            collection_id?: string[];
            tags?: string[];
            order?: string;
        }): Promise<{ products: Product[]; count: number; limit: number; offset: number }> {
            const query = params
                ? '?' + new URLSearchParams(
                    Object.entries(params)
                        .filter(([, value]) => value !== undefined)
                        .flatMap(([key, value]) =>
                            Array.isArray(value)
                                ? value.map((v) => [key, v])
                                : [[key, String(value)]]
                        )
                ).toString()
                : '';
            return request(`/store/products${query}`);
        },

        async get(idOrHandle: string): Promise<{ product: Product }> {
            // Check if it's an ID or handle
            const isId = idOrHandle.startsWith('prod_');
            return request(`/store/products/${isId ? idOrHandle : `handle/${idOrHandle}`}`);
        },

        async search(query: string): Promise<{ products: Product[] }> {
            return request(`/store/products?q=${encodeURIComponent(query)}`);
        },
    },

    // Categories
    categories: {
        async list(params?: {
            limit?: number;
            offset?: number;
            parent_category_id?: string | null;
        }): Promise<{ product_categories: Category[] }> {
            const query = params
                ? '?' + new URLSearchParams(
                    Object.entries(params)
                        .filter(([, value]) => value !== undefined && value !== null)
                        .map(([key, value]) => [key, String(value)])
                ).toString()
                : '';
            return request(`/store/product-categories${query}`);
        },

        async get(id: string): Promise<{ product_category: Category }> {
            return request(`/store/product-categories/${id}`);
        },
    },

    // Collections
    collections: {
        async list(params?: {
            limit?: number;
            offset?: number;
        }): Promise<{ collections: Collection[] }> {
            const query = params
                ? '?' + new URLSearchParams(
                    Object.entries(params)
                        .filter(([, value]) => value !== undefined)
                        .map(([key, value]) => [key, String(value)])
                ).toString()
                : '';
            return request(`/store/collections${query}`);
        },

        async get(id: string): Promise<{ collection: Collection }> {
            return request(`/store/collections/${id}`);
        },
    },

    // Regions
    regions: {
        async list(): Promise<{ regions: Region[] }> {
            return request('/store/regions');
        },

        async get(id: string): Promise<{ region: Region }> {
            return request(`/store/regions/${id}`);
        },
    },
};

// ============================================
// CART APIs
// ============================================

export const cartApi = {
    async create(regionId?: string): Promise<{ cart: Cart }> {
        return request('/store/carts', {
            method: 'POST',
            body: JSON.stringify(regionId ? { region_id: regionId } : {}),
        });
    },

    async get(cartId: string): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}`);
    },

    async update(cartId: string, data: Partial<{
        email: string;
        shipping_address: Address;
        billing_address: Address;
        region_id: string;
        discounts: Array<{ code: string }>;
    }>): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Line items
    async addItem(
        cartId: string,
        variantId: string,
        quantity: number
    ): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}/line-items`, {
            method: 'POST',
            body: JSON.stringify({ variant_id: variantId, quantity }),
        });
    },

    async updateItem(
        cartId: string,
        lineItemId: string,
        quantity: number
    ): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}/line-items/${lineItemId}`, {
            method: 'POST',
            body: JSON.stringify({ quantity }),
        });
    },

    async removeItem(cartId: string, lineItemId: string): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}/line-items/${lineItemId}`, {
            method: 'DELETE',
        });
    },

    // Discount codes
    async applyDiscount(
        cartId: string,
        code: string
    ): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}`, {
            method: 'POST',
            body: JSON.stringify({ discounts: [{ code }] }),
        });
    },

    async removeDiscount(
        cartId: string,
        code: string
    ): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}/discounts/${code}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// CHECKOUT APIs
// ============================================

export const checkoutApi = {
    async getShippingOptions(cartId: string): Promise<{ shipping_options: ShippingOption[] }> {
        return request(`/store/shipping-options?cart_id=${cartId}`);
    },

    async addShippingMethod(
        cartId: string,
        optionId: string
    ): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}/shipping-methods`, {
            method: 'POST',
            body: JSON.stringify({ option_id: optionId }),
        });
    },

    async createPaymentSessions(cartId: string): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}/payment-sessions`, {
            method: 'POST',
        });
    },

    async selectPaymentSession(
        cartId: string,
        providerId: string
    ): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}/payment-session`, {
            method: 'POST',
            body: JSON.stringify({ provider_id: providerId }),
        });
    },

    async updatePaymentSession(
        cartId: string,
        providerId: string,
        data: Record<string, unknown>
    ): Promise<{ cart: Cart }> {
        return request(`/store/carts/${cartId}/payment-sessions/${providerId}`, {
            method: 'POST',
            body: JSON.stringify({ data }),
        });
    },

    async complete(cartId: string): Promise<{ order: Order; type: 'order' }> {
        return request(`/store/carts/${cartId}/complete`, {
            method: 'POST',
        });
    },
};

// ============================================
// CUSTOMER APIs
// ============================================

export const customerApi = {
    async register(data: {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        phone?: string;
    }): Promise<{ customer: Customer }> {
        return request('/store/customers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async login(email: string, password: string): Promise<{ token: string }> {
        const result = await request<{ token: string }>('/store/auth/customer/emailpass', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        // Store the token
        localStorage.setItem('medusa_token', result.token);
        return result;
    },

    async logout(): Promise<void> {
        await request('/store/auth', { method: 'DELETE' });
        localStorage.removeItem('medusa_token');
    },

    async getSession(): Promise<{ customer: Customer }> {
        return request('/store/customers/me');
    },

    async update(data: Partial<{
        first_name: string;
        last_name: string;
        phone: string;
        password: string;
    }>): Promise<{ customer: Customer }> {
        return request('/store/customers/me', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Addresses
    async addAddress(address: Address): Promise<{ customer: Customer }> {
        return request('/store/customers/me/addresses', {
            method: 'POST',
            body: JSON.stringify({ address }),
        });
    },

    async updateAddress(
        addressId: string,
        address: Partial<Address>
    ): Promise<{ customer: Customer }> {
        return request(`/store/customers/me/addresses/${addressId}`, {
            method: 'POST',
            body: JSON.stringify(address),
        });
    },

    async deleteAddress(addressId: string): Promise<{ customer: Customer }> {
        return request(`/store/customers/me/addresses/${addressId}`, {
            method: 'DELETE',
        });
    },

    // Orders
    async getOrders(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{ orders: Order[]; count: number }> {
        const query = params
            ? '?' + new URLSearchParams(
                Object.entries(params)
                    .filter(([, value]) => value !== undefined)
                    .map(([key, value]) => [key, String(value)])
            ).toString()
            : '';
        return request(`/store/customers/me/orders${query}`);
    },
};

// ============================================
// ORDER APIs
// ============================================

export const orderApi = {
    async get(orderId: string): Promise<{ order: Order }> {
        return request(`/store/orders/${orderId}`);
    },

    async getByDisplayId(displayId: number): Promise<{ orders: Order[] }> {
        return request(`/store/orders?display_id=${displayId}`);
    },

    async lookup(data: {
        display_id: number;
        email: string;
    }): Promise<{ order: Order }> {
        return request(`/store/orders/batch/customer/${data.display_id}?email=${encodeURIComponent(data.email)}`);
    },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const utils = {
    /**
     * Format price with currency
     */
    formatPrice(amount: number, currencyCode: string = 'usd'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode.toUpperCase(),
        }).format(amount / 100);
    },

    /**
     * Get or create cart ID from localStorage
     */
    getCartId(): string | null {
        return localStorage.getItem('medusa_cart_id');
    },

    /**
     * Store cart ID in localStorage
     */
    setCartId(cartId: string): void {
        localStorage.setItem('medusa_cart_id', cartId);
    },

    /**
     * Clear cart ID from localStorage
     */
    clearCartId(): void {
        localStorage.removeItem('medusa_cart_id');
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('medusa_token');
    },

    /**
     * Get variant price for a specific currency
     */
    getVariantPrice(variant: ProductVariant, currencyCode: string = 'usd'): number | null {
        const price = variant.prices.find(
            (p) => p.currency_code.toLowerCase() === currencyCode.toLowerCase()
        );
        return price ? price.amount : null;
    },

    /**
     * Get the cheapest variant of a product
     */
    getCheapestVariant(product: Product, currencyCode: string = 'usd'): ProductVariant | null {
        let cheapest: ProductVariant | null = null;
        let cheapestPrice = Infinity;

        for (const variant of product.variants) {
            const price = utils.getVariantPrice(variant, currencyCode);
            if (price !== null && price < cheapestPrice) {
                cheapestPrice = price;
                cheapest = variant;
            }
        }

        return cheapest;
    },
};

// ============================================
// DEFAULT EXPORT
// ============================================

const medusaClient = {
    store: storeApi,
    cart: cartApi,
    checkout: checkoutApi,
    customer: customerApi,
    order: orderApi,
    utils,
    // Config
    backendUrl: MEDUSA_BACKEND_URL,
};

export default medusaClient;
