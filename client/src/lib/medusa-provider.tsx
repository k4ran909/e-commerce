/**
 * Medusa Provider - Central context for Medusa integration
 * 
 * This provider wraps the entire app and provides:
 * - Cart management synced with Medusa
 * - Customer authentication via Medusa
 * - Region/currency configuration
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import medusaClient, { Cart, Customer, Region } from "./medusa-client";

interface MedusaContextType {
    // Cart
    cart: Cart | null;
    cartLoading: boolean;
    addToCart: (variantId: string, quantity?: number) => Promise<void>;
    updateCartItem: (lineItemId: string, quantity: number) => Promise<void>;
    removeCartItem: (lineItemId: string) => Promise<void>;
    clearCart: () => void;
    cartItemsCount: number;

    // Customer
    customer: Customer | null;
    customerLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>;
    isAuthenticated: boolean;

    // Region
    region: Region | null;
    regions: Region[];
    setRegion: (regionId: string) => void;

    // Currency formatting
    formatPrice: (amount: number) => string;

    // Refresh functions
    refreshCart: () => Promise<void>;
    refreshCustomer: () => Promise<void>;
}

const MedusaContext = createContext<MedusaContextType | undefined>(undefined);

// Local storage keys
const CART_ID_KEY = "medusa_cart_id";
const REGION_ID_KEY = "medusa_region_id";

export function MedusaProvider({ children }: { children: ReactNode }) {
    // Cart state
    const [cart, setCart] = useState<Cart | null>(null);
    const [cartLoading, setCartLoading] = useState(true);

    // Customer state
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [customerLoading, setCustomerLoading] = useState(true);

    // Region state
    const [region, setRegionState] = useState<Region | null>(null);
    const [regions, setRegions] = useState<Region[]>([]);

    // Initialize regions
    useEffect(() => {
        async function fetchRegions() {
            try {
                const { regions: fetchedRegions } = await medusaClient.store.regions.list();
                setRegions(fetchedRegions);

                // Set default region from localStorage or first available
                const savedRegionId = localStorage.getItem(REGION_ID_KEY);
                const defaultRegion = savedRegionId
                    ? fetchedRegions.find(r => r.id === savedRegionId) || fetchedRegions[0]
                    : fetchedRegions[0];

                if (defaultRegion) {
                    setRegionState(defaultRegion);
                }
            } catch (err) {
                console.error("Failed to fetch regions:", err);
            }
        }
        fetchRegions();
    }, []);

    // Initialize cart
    useEffect(() => {
        async function initCart() {
            setCartLoading(true);
            try {
                const cartId = localStorage.getItem(CART_ID_KEY);
                if (cartId) {
                    const { cart: existingCart } = await medusaClient.cart.get(cartId);
                    setCart(existingCart);
                }
            } catch (err) {
                // Cart not found or expired, clear it
                localStorage.removeItem(CART_ID_KEY);
            } finally {
                setCartLoading(false);
            }
        }
        initCart();
    }, []);

    // Initialize customer session
    useEffect(() => {
        async function initCustomer() {
            setCustomerLoading(true);
            try {
                if (medusaClient.utils.isAuthenticated()) {
                    const { customer: existingCustomer } = await medusaClient.customer.getSession();
                    setCustomer(existingCustomer);
                }
            } catch (err) {
                // Session expired
                localStorage.removeItem("medusa_token");
            } finally {
                setCustomerLoading(false);
            }
        }
        initCustomer();
    }, []);

    // Create cart if needed
    const createCartIfNeeded = useCallback(async (): Promise<string> => {
        if (cart?.id) return cart.id;

        const { cart: newCart } = await medusaClient.cart.create(region?.id);
        localStorage.setItem(CART_ID_KEY, newCart.id);
        setCart(newCart);
        return newCart.id;
    }, [cart, region]);

    // Refresh cart
    const refreshCart = useCallback(async () => {
        const cartId = localStorage.getItem(CART_ID_KEY);
        if (!cartId) return;

        try {
            const { cart: refreshedCart } = await medusaClient.cart.get(cartId);
            setCart(refreshedCart);
        } catch (err) {
            localStorage.removeItem(CART_ID_KEY);
            setCart(null);
        }
    }, []);

    // Add to cart
    const addToCart = useCallback(async (variantId: string, quantity: number = 1) => {
        const cartId = await createCartIfNeeded();
        await medusaClient.cart.addItem(cartId, variantId, quantity);
        await refreshCart();
    }, [createCartIfNeeded, refreshCart]);

    // Update cart item
    const updateCartItem = useCallback(async (lineItemId: string, quantity: number) => {
        if (!cart?.id) return;

        if (quantity <= 0) {
            await medusaClient.cart.removeItem(cart.id, lineItemId);
        } else {
            await medusaClient.cart.updateItem(cart.id, lineItemId, quantity);
        }
        await refreshCart();
    }, [cart, refreshCart]);

    // Remove cart item
    const removeCartItem = useCallback(async (lineItemId: string) => {
        if (!cart?.id) return;
        await medusaClient.cart.removeItem(cart.id, lineItemId);
        await refreshCart();
    }, [cart, refreshCart]);

    // Clear cart
    const clearCart = useCallback(() => {
        localStorage.removeItem(CART_ID_KEY);
        setCart(null);
    }, []);

    // Refresh customer
    const refreshCustomer = useCallback(async () => {
        try {
            const { customer: refreshedCustomer } = await medusaClient.customer.getSession();
            setCustomer(refreshedCustomer);
        } catch {
            setCustomer(null);
        }
    }, []);

    // Login
    const login = useCallback(async (email: string, password: string) => {
        await medusaClient.customer.login(email, password);
        await refreshCustomer();

        // Associate cart with customer if exists
        if (cart?.id) {
            await refreshCart();
        }
    }, [refreshCustomer, cart, refreshCart]);

    // Logout
    const logout = useCallback(async () => {
        await medusaClient.customer.logout();
        setCustomer(null);
    }, []);

    // Register
    const register = useCallback(async (data: { email: string; password: string; first_name: string; last_name: string }) => {
        await medusaClient.customer.register(data);
        // Auto-login after registration
        await login(data.email, data.password);
    }, [login]);

    // Set region
    const setRegion = useCallback((regionId: string) => {
        const newRegion = regions.find(r => r.id === regionId);
        if (newRegion) {
            setRegionState(newRegion);
            localStorage.setItem(REGION_ID_KEY, regionId);

            // Update cart region if cart exists
            if (cart?.id) {
                medusaClient.cart.update(cart.id, { region_id: regionId }).then(refreshCart);
            }
        }
    }, [regions, cart, refreshCart]);

    // Format price
    const formatPrice = useCallback((amount: number) => {
        const currencyCode = region?.currency_code || "usd";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode.toUpperCase(),
        }).format(amount / 100);
    }, [region]);

    // Cart items count
    const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const value: MedusaContextType = {
        cart,
        cartLoading,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        cartItemsCount,
        customer,
        customerLoading,
        login,
        logout,
        register,
        isAuthenticated: !!customer,
        region,
        regions,
        setRegion,
        formatPrice,
        refreshCart,
        refreshCustomer,
    };

    return (
        <MedusaContext.Provider value={value}>
            {children}
        </MedusaContext.Provider>
    );
}

export function useMedusa() {
    const context = useContext(MedusaContext);
    if (!context) {
        throw new Error("useMedusa must be used within MedusaProvider");
    }
    return context;
}

// Convenience hooks
export function useMedusaCart() {
    const { cart, cartLoading, addToCart, updateCartItem, removeCartItem, clearCart, cartItemsCount, formatPrice } = useMedusa();
    return { cart, cartLoading, addToCart, updateCartItem, removeCartItem, clearCart, cartItemsCount, formatPrice };
}

export function useMedusaCustomer() {
    const { customer, customerLoading, login, logout, register, isAuthenticated } = useMedusa();
    return { customer, customerLoading, login, logout, register, isAuthenticated };
}

export function useMedusaRegion() {
    const { region, regions, setRegion, formatPrice } = useMedusa();
    return { region, regions, setRegion, formatPrice };
}
