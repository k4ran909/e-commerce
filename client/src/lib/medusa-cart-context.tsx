/**
 * Medusa Cart Context for JewelryCommerce
 * 
 * This is a drop-in replacement for the existing cart-context.tsx
 * that fetches data from Medusa instead of the Express backend.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import medusaClient, { Cart, LineItem, Product as MedusaProduct } from "./medusa-client";

// Legacy Product type for compatibility with existing components
export interface LegacyProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    images: string[];
    category: string;
    material: string;
    sizes: string[];
    inStock: boolean;
    isPreOrder: boolean;
}

export interface CartItemType {
    product: LegacyProduct;
    quantity: number;
    size?: string;
    lineItemId?: string; // Medusa line item ID
    variantId?: string;  // Medusa variant ID
}

interface CartContextType {
    items: CartItemType[];
    totalItems: number;
    totalPrice: number;
    addToCart: (product: LegacyProduct, size?: string, quantity?: number) => void;
    removeFromCart: (productId: string, size?: string) => void;
    updateQuantity: (productId: string, quantity: number, size?: string) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    toggleCart: () => void;
    setIsCartOpen: (open: boolean) => void;
    // Medusa-specific
    cart: Cart | null;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to convert Medusa product to legacy format
function medusaToLegacyProduct(medusaProduct: MedusaProduct): LegacyProduct {
    const variant = medusaProduct.variants?.[0];
    const price = variant?.prices?.[0]?.amount || 0;

    return {
        id: medusaProduct.id,
        name: medusaProduct.title,
        description: medusaProduct.description || "",
        price: price,
        imageUrl: medusaProduct.thumbnail,
        images: medusaProduct.images?.map(img => img.url) || [],
        category: medusaProduct.categories?.[0]?.handle || "jewelry",
        material: medusaProduct.options?.[0]?.values?.[0]?.value || "Gold",
        sizes: medusaProduct.options?.find(o => o.title.toLowerCase() === 'size')?.values?.map(v => v.value) || [],
        inStock: (variant?.inventory_quantity || 0) > 0,
        isPreOrder: false,
    };
}

// Helper to convert Medusa line item to cart item
function lineItemToCartItem(lineItem: LineItem): CartItemType {
    const variant = lineItem.variant;
    const product: LegacyProduct = {
        id: variant?.id?.replace('variant_', 'prod_') || lineItem.id,
        name: lineItem.title,
        description: lineItem.description,
        price: lineItem.unit_price,
        imageUrl: lineItem.thumbnail,
        images: [],
        category: "jewelry",
        material: "",
        sizes: [],
        inStock: true,
        isPreOrder: false,
    };

    return {
        product,
        quantity: lineItem.quantity,
        lineItemId: lineItem.id,
        variantId: variant?.id,
        size: variant?.options?.[0]?.value,
    };
}

export function MedusaCartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [items, setItems] = useState<CartItemType[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    // Initialize cart
    useEffect(() => {
        async function initCart() {
            try {
                const cartId = medusaClient.utils.getCartId();
                if (cartId) {
                    const result = await medusaClient.cart.get(cartId);
                    setCart(result.cart);
                    setItems(result.cart.items?.map(lineItemToCartItem) || []);
                }
            } catch (err) {
                // Cart not found, clear it
                medusaClient.utils.clearCartId();
            } finally {
                setLoading(false);
            }
        }

        initCart();
    }, []);

    const createCartIfNeeded = useCallback(async (): Promise<string> => {
        if (cart?.id) return cart.id;

        try {
            const result = await medusaClient.cart.create();
            medusaClient.utils.setCartId(result.cart.id);
            setCart(result.cart);
            return result.cart.id;
        } catch (err) {
            throw new Error("Failed to create cart");
        }
    }, [cart]);

    const refreshCart = useCallback(async (cartId: string) => {
        try {
            const result = await medusaClient.cart.get(cartId);
            setCart(result.cart);
            setItems(result.cart.items?.map(lineItemToCartItem) || []);
        } catch (err) {
            console.error("Failed to refresh cart:", err);
        }
    }, []);

    const addToCart = useCallback(async (product: LegacyProduct, size?: string, quantity: number = 1) => {
        try {
            const cartId = await createCartIfNeeded();

            // For Medusa, we need a variant ID. 
            // In a real implementation, you'd fetch the product from Medusa first
            // For now, we'll construct it from the product ID
            const variantId = product.id.startsWith('variant_')
                ? product.id
                : product.id.replace('prod_', 'variant_');

            await medusaClient.cart.addItem(cartId, variantId, quantity);
            await refreshCart(cartId);

            toast({
                title: "Added to cart",
                description: `${product.name} has been added to your cart.`,
            });
        } catch (err: any) {
            console.error("Failed to add to cart:", err);
            toast({
                title: "Error",
                description: err.message || "Failed to add item to cart",
                variant: "destructive",
            });
        }
    }, [createCartIfNeeded, refreshCart, toast]);

    const removeFromCart = useCallback(async (productId: string, size?: string) => {
        if (!cart?.id) return;

        const item = items.find(i => i.product.id === productId && i.size === size);
        if (!item?.lineItemId) return;

        try {
            await medusaClient.cart.removeItem(cart.id, item.lineItemId);
            await refreshCart(cart.id);
        } catch (err) {
            console.error("Failed to remove from cart:", err);
        }
    }, [cart, items, refreshCart]);

    const updateQuantity = useCallback(async (productId: string, quantity: number, size?: string) => {
        if (!cart?.id) return;

        if (quantity <= 0) {
            removeFromCart(productId, size);
            return;
        }

        const item = items.find(i => i.product.id === productId && i.size === size);
        if (!item?.lineItemId) return;

        try {
            await medusaClient.cart.updateItem(cart.id, item.lineItemId, quantity);
            await refreshCart(cart.id);
        } catch (err) {
            console.error("Failed to update quantity:", err);
        }
    }, [cart, items, refreshCart, removeFromCart]);

    const clearCart = useCallback(() => {
        medusaClient.utils.clearCartId();
        setCart(null);
        setItems([]);
    }, []);

    const toggleCart = useCallback(() => {
        setIsCartOpen(prev => !prev);
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart?.total || items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider
            value={{
                items,
                totalItems,
                totalPrice,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isCartOpen,
                toggleCart,
                setIsCartOpen,
                cart,
                loading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within CartProvider or MedusaCartProvider");
    }
    return context;
}

// Re-export the legacy CartProvider for backwards compatibility
export { CartProvider } from "./cart-context";
