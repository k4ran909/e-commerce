/**
 * Medusa React Hooks for JewelryCommerce
 * 
 * Custom hooks for managing e-commerce state with MedusaJS backend.
 * Provides easy-to-use interfaces for products, cart, checkout, and authentication.
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import medusaClient, {
    Product,
    Cart,
    Customer,
    Order,
    Category,
    Collection,
    Region,
    Address,
    MedusaError,
} from './medusa-client';

// ============================================
// PRODUCTS HOOKS
// ============================================

interface UseProductsParams {
    limit?: number;
    offset?: number;
    q?: string;
    categoryId?: string[];
    collectionId?: string[];
}

interface UseProductsResult {
    products: Product[];
    count: number;
    loading: boolean;
    error: Error | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useProducts(params?: UseProductsParams): UseProductsResult {
    const [products, setProducts] = useState<Product[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [offset, setOffset] = useState(params?.offset || 0);

    const limit = params?.limit || 12;

    const fetchProducts = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            setError(null);

            const currentOffset = reset ? 0 : offset;

            const result = await medusaClient.store.products.list({
                limit,
                offset: currentOffset,
                q: params?.q,
                category_id: params?.categoryId,
                collection_id: params?.collectionId,
            });

            if (reset) {
                setProducts(result.products);
                setOffset(limit);
            } else {
                setProducts((prev) => [...prev, ...result.products]);
                setOffset((prev) => prev + limit);
            }

            setCount(result.count);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [params?.q, params?.categoryId?.join(','), params?.collectionId?.join(','), limit, offset]);

    useEffect(() => {
        setOffset(0);
        fetchProducts(true);
    }, [params?.q, params?.categoryId?.join(','), params?.collectionId?.join(',')]);

    const loadMore = useCallback(async () => {
        if (!loading && products.length < count) {
            await fetchProducts(false);
        }
    }, [loading, products.length, count, fetchProducts]);

    const refresh = useCallback(async () => {
        setOffset(0);
        await fetchProducts(true);
    }, [fetchProducts]);

    return {
        products,
        count,
        loading,
        error,
        hasMore: products.length < count,
        loadMore,
        refresh,
    };
}

interface UseProductResult {
    product: Product | null;
    loading: boolean;
    error: Error | null;
}

export function useProduct(idOrHandle: string | null): UseProductResult {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!idOrHandle) {
            setLoading(false);
            return;
        }

        // Capture the value to satisfy TypeScript's null checking
        const productId = idOrHandle;

        async function fetchProduct() {
            try {
                setLoading(true);
                setError(null);
                const result = await medusaClient.store.products.get(productId);
                setProduct(result.product);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [idOrHandle]);

    return { product, loading, error };
}

// ============================================
// CATEGORIES HOOK
// ============================================

interface UseCategoriesResult {
    categories: Category[];
    loading: boolean;
    error: Error | null;
}

export function useCategories(): UseCategoriesResult {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                setLoading(true);
                const result = await medusaClient.store.categories.list();
                setCategories(result.product_categories);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    return { categories, loading, error };
}

// ============================================
// COLLECTIONS HOOK
// ============================================

interface UseCollectionsResult {
    collections: Collection[];
    loading: boolean;
    error: Error | null;
}

export function useCollections(): UseCollectionsResult {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchCollections() {
            try {
                setLoading(true);
                const result = await medusaClient.store.collections.list();
                setCollections(result.collections);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchCollections();
    }, []);

    return { collections, loading, error };
}

// ============================================
// CART CONTEXT & HOOK
// ============================================

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    error: Error | null;
    itemCount: number;
    total: number;
    formattedTotal: string;
    createCart: () => Promise<Cart>;
    addItem: (variantId: string, quantity?: number) => Promise<Cart>;
    updateItem: (lineItemId: string, quantity: number) => Promise<Cart>;
    removeItem: (lineItemId: string) => Promise<Cart>;
    applyDiscount: (code: string) => Promise<Cart>;
    removeDiscount: (code: string) => Promise<Cart>;
    updateCart: (data: { email?: string; shipping_address?: Address; billing_address?: Address }) => Promise<Cart>;
    clearCart: () => void;
    refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Initialize cart from localStorage
    useEffect(() => {
        async function initCart() {
            const cartId = medusaClient.utils.getCartId();

            if (!cartId) {
                setLoading(false);
                return;
            }

            try {
                const result = await medusaClient.cart.get(cartId);
                setCart(result.cart);
            } catch (err) {
                // Cart not found or expired, clear it
                medusaClient.utils.clearCartId();
            } finally {
                setLoading(false);
            }
        }

        initCart();
    }, []);

    const createCart = useCallback(async () => {
        setLoading(true);
        try {
            const result = await medusaClient.cart.create();
            medusaClient.utils.setCartId(result.cart.id);
            setCart(result.cart);
            return result.cart;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const addItem = useCallback(async (variantId: string, quantity: number = 1) => {
        let currentCart = cart;

        // Create cart if it doesn't exist
        if (!currentCart) {
            currentCart = await createCart();
        }

        try {
            const result = await medusaClient.cart.addItem(currentCart.id, variantId, quantity);
            setCart(result.cart);
            return result.cart;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [cart, createCart]);

    const updateItem = useCallback(async (lineItemId: string, quantity: number) => {
        if (!cart) throw new Error('No cart found');

        try {
            const result = await medusaClient.cart.updateItem(cart.id, lineItemId, quantity);
            setCart(result.cart);
            return result.cart;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [cart]);

    const removeItem = useCallback(async (lineItemId: string) => {
        if (!cart) throw new Error('No cart found');

        try {
            const result = await medusaClient.cart.removeItem(cart.id, lineItemId);
            setCart(result.cart);
            return result.cart;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [cart]);

    const applyDiscount = useCallback(async (code: string) => {
        if (!cart) throw new Error('No cart found');

        try {
            const result = await medusaClient.cart.applyDiscount(cart.id, code);
            setCart(result.cart);
            return result.cart;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [cart]);

    const removeDiscount = useCallback(async (code: string) => {
        if (!cart) throw new Error('No cart found');

        try {
            const result = await medusaClient.cart.removeDiscount(cart.id, code);
            setCart(result.cart);
            return result.cart;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [cart]);

    const updateCart = useCallback(async (data: {
        email?: string;
        shipping_address?: Address;
        billing_address?: Address
    }) => {
        if (!cart) throw new Error('No cart found');

        try {
            const result = await medusaClient.cart.update(cart.id, data);
            setCart(result.cart);
            return result.cart;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [cart]);

    const clearCart = useCallback(() => {
        medusaClient.utils.clearCartId();
        setCart(null);
    }, []);

    const refresh = useCallback(async () => {
        const cartId = medusaClient.utils.getCartId();
        if (!cartId) return;

        try {
            const result = await medusaClient.cart.get(cartId);
            setCart(result.cart);
        } catch (err) {
            medusaClient.utils.clearCartId();
            setCart(null);
        }
    }, []);

    const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const total = cart?.total || 0;
    const currencyCode = cart?.region?.currency_code || 'usd';

    const value: CartContextType = {
        cart,
        loading,
        error,
        itemCount,
        total,
        formattedTotal: medusaClient.utils.formatPrice(total, currencyCode),
        createCart,
        addItem,
        updateItem,
        removeItem,
        applyDiscount,
        removeDiscount,
        updateCart,
        clearCart,
        refresh,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

// ============================================
// CHECKOUT HOOK
// ============================================

interface UseCheckoutResult {
    cart: Cart | null;
    shippingOptions: Array<{ id: string; name: string; amount: number }>;
    loadingShipping: boolean;
    loadingPayment: boolean;
    completing: boolean;
    error: Error | null;
    setShippingAddress: (address: Address) => Promise<void>;
    setBillingAddress: (address: Address) => Promise<void>;
    setEmail: (email: string) => Promise<void>;
    selectShippingOption: (optionId: string) => Promise<void>;
    initPaymentSession: (providerId?: string) => Promise<void>;
    completeCheckout: () => Promise<Order>;
}

export function useCheckout(): UseCheckoutResult {
    const { cart, updateCart, refresh } = useCart();
    const [shippingOptions, setShippingOptions] = useState<Array<{ id: string; name: string; amount: number }>>([]);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Fetch shipping options when cart is available
    useEffect(() => {
        if (!cart?.id) return;

        async function fetchShippingOptions() {
            try {
                setLoadingShipping(true);
                const result = await medusaClient.checkout.getShippingOptions(cart!.id);
                setShippingOptions(result.shipping_options);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoadingShipping(false);
            }
        }

        fetchShippingOptions();
    }, [cart?.id]);

    const setShippingAddress = useCallback(async (address: Address) => {
        await updateCart({ shipping_address: address });
        await refresh();
    }, [updateCart, refresh]);

    const setBillingAddress = useCallback(async (address: Address) => {
        await updateCart({ billing_address: address });
        await refresh();
    }, [updateCart, refresh]);

    const setEmail = useCallback(async (email: string) => {
        await updateCart({ email });
    }, [updateCart]);

    const selectShippingOption = useCallback(async (optionId: string) => {
        if (!cart) throw new Error('No cart found');

        try {
            await medusaClient.checkout.addShippingMethod(cart.id, optionId);
            await refresh();
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [cart, refresh]);

    const initPaymentSession = useCallback(async (providerId = 'manual') => {
        if (!cart) throw new Error('No cart found');

        try {
            setLoadingPayment(true);
            await medusaClient.checkout.createPaymentSessions(cart.id);
            await medusaClient.checkout.selectPaymentSession(cart.id, providerId);
            await refresh();
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoadingPayment(false);
        }
    }, [cart, refresh]);

    const completeCheckout = useCallback(async (): Promise<Order> => {
        if (!cart) throw new Error('No cart found');

        try {
            setCompleting(true);
            const result = await medusaClient.checkout.complete(cart.id);
            // Clear cart after successful checkout
            medusaClient.utils.clearCartId();
            return result.order;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setCompleting(false);
        }
    }, [cart]);

    return {
        cart,
        shippingOptions,
        loadingShipping,
        loadingPayment,
        completing,
        error,
        setShippingAddress,
        setBillingAddress,
        setEmail,
        selectShippingOption,
        initPaymentSession,
        completeCheckout,
    };
}

// ============================================
// CUSTOMER/AUTH CONTEXT & HOOK
// ============================================

interface CustomerContextType {
    customer: Customer | null;
    loading: boolean;
    error: Error | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<Customer>;
    register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<Customer>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<{ first_name: string; last_name: string; phone: string }>) => Promise<Customer>;
    addAddress: (address: Address) => Promise<void>;
    updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
    deleteAddress: (addressId: string) => Promise<void>;
    refresh: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Check session on mount
    useEffect(() => {
        async function checkSession() {
            if (!medusaClient.utils.isAuthenticated()) {
                setLoading(false);
                return;
            }

            try {
                const result = await medusaClient.customer.getSession();
                setCustomer(result.customer);
            } catch (err) {
                // Token expired or invalid
                localStorage.removeItem('medusa_token');
            } finally {
                setLoading(false);
            }
        }

        checkSession();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            await medusaClient.customer.login(email, password);
            const result = await medusaClient.customer.getSession();
            setCustomer(result.customer);
            return result.customer;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (data: {
        email: string;
        password: string;
        first_name: string;
        last_name: string
    }) => {
        setLoading(true);
        setError(null);

        try {
            const result = await medusaClient.customer.register(data);
            // Auto-login after registration
            await medusaClient.customer.login(data.email, data.password);
            setCustomer(result.customer);
            return result.customer;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await medusaClient.customer.logout();
        } catch (err) {
            // Ignore errors during logout
        } finally {
            setCustomer(null);
        }
    }, []);

    const updateProfile = useCallback(async (data: Partial<{
        first_name: string;
        last_name: string;
        phone: string
    }>) => {
        try {
            const result = await medusaClient.customer.update(data);
            setCustomer(result.customer);
            return result.customer;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, []);

    const addAddress = useCallback(async (address: Address) => {
        try {
            const result = await medusaClient.customer.addAddress(address);
            setCustomer(result.customer);
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, []);

    const updateAddress = useCallback(async (addressId: string, address: Partial<Address>) => {
        try {
            const result = await medusaClient.customer.updateAddress(addressId, address);
            setCustomer(result.customer);
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, []);

    const deleteAddress = useCallback(async (addressId: string) => {
        try {
            const result = await medusaClient.customer.deleteAddress(addressId);
            setCustomer(result.customer);
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, []);

    const refresh = useCallback(async () => {
        try {
            const result = await medusaClient.customer.getSession();
            setCustomer(result.customer);
        } catch (err) {
            setCustomer(null);
        }
    }, []);

    const value: CustomerContextType = {
        customer,
        loading,
        error,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        refresh,
    };

    return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer(): CustomerContextType {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error('useCustomer must be used within a CustomerProvider');
    }
    return context;
}

// ============================================
// ORDERS HOOK
// ============================================

interface UseOrdersResult {
    orders: Order[];
    loading: boolean;
    error: Error | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
}

export function useOrders(limit: number = 10): UseOrdersResult {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [offset, setOffset] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        async function fetchOrders() {
            try {
                setLoading(true);
                const result = await medusaClient.customer.getOrders({ limit, offset: 0 });
                setOrders(result.orders);
                setCount(result.count);
                setOffset(limit);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [limit]);

    const loadMore = useCallback(async () => {
        if (loading || orders.length >= count) return;

        try {
            const result = await medusaClient.customer.getOrders({ limit, offset });
            setOrders((prev) => [...prev, ...result.orders]);
            setOffset((prev) => prev + limit);
        } catch (err) {
            setError(err as Error);
        }
    }, [loading, orders.length, count, limit, offset]);

    return {
        orders,
        loading,
        error,
        hasMore: orders.length < count,
        loadMore,
    };
}

interface UseOrderResult {
    order: Order | null;
    loading: boolean;
    error: Error | null;
}

export function useOrder(orderId: string | null): UseOrderResult {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        async function fetchOrder() {
            try {
                setLoading(true);
                const result = await medusaClient.order.get(orderId!);
                setOrder(result.order);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchOrder();
    }, [orderId]);

    return { order, loading, error };
}

// ============================================
// REGIONS HOOK
// ============================================

interface UseRegionsResult {
    regions: Region[];
    loading: boolean;
    error: Error | null;
}

export function useRegions(): UseRegionsResult {
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchRegions() {
            try {
                const result = await medusaClient.store.regions.list();
                setRegions(result.regions);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchRegions();
    }, []);

    return { regions, loading, error };
}

// ============================================
// SEARCH HOOK
// ============================================

interface UseSearchResult {
    results: Product[];
    loading: boolean;
    error: Error | null;
    search: (query: string) => Promise<void>;
    clear: () => void;
}

export function useSearch(): UseSearchResult {
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const search = useCallback(async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await medusaClient.store.products.search(query);
            setResults(result.products);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setResults([]);
        setError(null);
    }, []);

    return { results, loading, error, search, clear };
}

// ============================================
// COMBINED PROVIDER
// ============================================

interface MedusaProviderProps {
    children: ReactNode;
}

export function MedusaProvider({ children }: MedusaProviderProps) {
    return (
        <CustomerProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </CustomerProvider>
    );
}

export default {
    MedusaProvider,
    CartProvider,
    CustomerProvider,
    useProducts,
    useProduct,
    useCategories,
    useCollections,
    useCart,
    useCheckout,
    useCustomer,
    useOrders,
    useOrder,
    useRegions,
    useSearch,
};
