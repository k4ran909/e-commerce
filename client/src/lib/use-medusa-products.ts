/**
 * Medusa Products Hook for JewelryCommerce
 * 
 * This hook fetches products from Medusa and converts them to the
 * legacy Product format used by existing components.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import medusaClient, { Product as MedusaProduct } from "./medusa-client";

// Legacy Product type (matches @shared/schema Product)
export interface Product {
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
    createdAt?: string;
    updatedAt?: string;
}

// Convert Medusa product to legacy format
function convertMedusaProduct(medusaProduct: MedusaProduct): Product {
    const variant = medusaProduct.variants?.[0];
    const price = variant?.prices?.[0]?.amount || 0;

    // Extract category from Medusa categories
    const category = medusaProduct.categories?.[0]?.handle ||
        medusaProduct.collection?.handle ||
        "jewelry";

    // Extract material from product options or tags
    const materialOption = medusaProduct.options?.find(
        o => o.title.toLowerCase() === 'material'
    );
    const material = materialOption?.values?.[0]?.value ||
        variant?.options?.find(o => o.value)?.value ||
        "Precious Metal";

    // Extract sizes from product options
    const sizeOption = medusaProduct.options?.find(
        o => o.title.toLowerCase() === 'size'
    );
    const sizes = sizeOption?.values?.map(v => v.value) || [];

    return {
        id: medusaProduct.id,
        name: medusaProduct.title,
        description: medusaProduct.description || "",
        price: price, // Price in cents
        imageUrl: medusaProduct.thumbnail,
        images: medusaProduct.images?.map(img => img.url) || [],
        category: category,
        material: material,
        sizes: sizes,
        inStock: (variant?.inventory_quantity || 0) > 0,
        isPreOrder: false,
        createdAt: medusaProduct.created_at,
        updatedAt: medusaProduct.updated_at,
    };
}

// Fetch all products from Medusa
export function useMedusaProducts(params?: {
    category?: string;
    q?: string;
    limit?: number;
    offset?: number;
}) {
    return useQuery<Product[]>({
        queryKey: ["/api/products", "medusa", params],
        queryFn: async () => {
            const searchParams: Record<string, any> = {};

            if (params?.limit) searchParams.limit = params.limit;
            if (params?.offset) searchParams.offset = params.offset;
            if (params?.q) searchParams.q = params.q;

            // Note: Medusa uses category_id not category handle
            // You may need to first fetch categories to get the ID

            const result = await medusaClient.store.products.list(searchParams);

            let products = result.products.map(convertMedusaProduct);

            // Filter by category on client side if needed
            if (params?.category && params.category !== "all") {
                products = products.filter(p =>
                    p.category.toLowerCase() === params.category?.toLowerCase()
                );
            }

            return products;
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
}

// Fetch single product from Medusa
export function useMedusaProduct(id: string | undefined) {
    return useQuery<Product | null>({
        queryKey: ["/api/products", "medusa", id],
        queryFn: async () => {
            if (!id) return null;

            try {
                const result = await medusaClient.store.products.get(id);
                return convertMedusaProduct(result.product);
            } catch (err) {
                console.error("Failed to fetch product:", err);
                return null;
            }
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
}

// Fetch categories from Medusa
export function useMedusaCategories() {
    return useQuery({
        queryKey: ["/api/categories", "medusa"],
        queryFn: async () => {
            const result = await medusaClient.store.categories.list();
            return result.product_categories.map(cat => ({
                value: cat.handle,
                label: cat.name,
                id: cat.id,
            }));
        },
        staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    });
}

// Hook to use either Medusa or legacy API based on environment
export function useProducts(useMedusa: boolean = true) {
    const medusaQuery = useMedusaProducts();
    const legacyQuery = useQuery<Product[]>({
        queryKey: ["/api/products"],
        enabled: !useMedusa,
    });

    return useMedusa ? medusaQuery : legacyQuery;
}

export function useProduct(id: string | undefined, useMedusa: boolean = true) {
    const medusaQuery = useMedusaProduct(id);
    const legacyQuery = useQuery<Product>({
        queryKey: ["/api/products", id],
        enabled: !!id && !useMedusa,
    });

    return useMedusa ? medusaQuery : legacyQuery;
}

// Export helper for components
export { convertMedusaProduct };
