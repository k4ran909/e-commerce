/**
 * Medusa Product Card Component
 * 
 * Displays a product from Medusa with proper pricing
 * and add-to-cart functionality.
 */

import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMedusa } from "@/lib/medusa-provider";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/use-medusa-products";

interface MedusaProductCardProps {
    product: Product;
    showAddToCart?: boolean;
}

export function MedusaProductCard({ product, showAddToCart = false }: MedusaProductCardProps) {
    const { t } = useTranslation();
    const { addToCart, formatPrice } = useMedusa();
    const { setIsCartOpen } = useCart();
    const { toast } = useToast();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [adding, setAdding] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // For Medusa, we need a variant ID
        // The product.id from our hook is the product ID, we need to get the first variant
        const variantId = product.id.replace('prod_', 'variant_');

        setAdding(true);
        try {
            await addToCart(variantId, 1);
            toast({
                title: t('cart.itemAdded'),
                description: `${product.name} added to cart`,
            });
            setIsCartOpen(true);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to add to cart",
                variant: "destructive",
            });
        } finally {
            setAdding(false);
        }
    };

    // Format price
    const displayPrice = formatPrice(product.price);

    return (
        <Link href={`/product/${product.id}`}>
            <Card
                data-testid={`card-product-${product.id}`}
                className="group overflow-hidden border hover-elevate active-elevate-2 cursor-pointer transition-all duration-300"
            >
                <div className="relative aspect-square overflow-hidden bg-accent">
                    {!imageLoaded && (
                        <Skeleton className="absolute inset-0 w-full h-full" />
                    )}
                    <img
                        src={product.imageUrl || "/favicon.png"}
                        alt={product.name}
                        className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02] ${imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        data-testid={`img-product-${product.id}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                            const currentSrc = e.currentTarget.src;
                            if (currentSrc.endsWith('/favicon.png') || currentSrc.includes('favicon')) {
                                setImageLoaded(true);
                                return;
                            }
                            e.currentTarget.src = "/favicon.png";
                            setImageLoaded(true);
                        }}
                    />

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                        {product.isPreOrder && (
                            <Badge variant="secondary" className="font-medium">
                                {t('products.preOrder')}
                            </Badge>
                        )}
                        {!product.inStock && !product.isPreOrder && (
                            <Badge variant="secondary" className="font-medium">
                                {t('products.outOfStock')}
                            </Badge>
                        )}
                    </div>

                    {/* Quick Add Button */}
                    {showAddToCart && product.inStock && (
                        <Button
                            size="icon"
                            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-10 w-10 rounded-full shadow-lg"
                            onClick={handleAddToCart}
                            disabled={adding}
                        >
                            {adding ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Plus className="h-5 w-5" />
                            )}
                        </Button>
                    )}
                </div>

                <div className="p-4 space-y-2">
                    <h3
                        className="font-medium text-base lg:text-lg line-clamp-1"
                        data-testid={`text-product-name-${product.id}`}
                    >
                        {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        {product.material || product.category}
                    </p>
                    <div className="flex items-center justify-between">
                        <p
                            className="font-serif text-lg font-semibold"
                            data-testid={`text-product-price-${product.id}`}
                        >
                            {displayPrice}
                        </p>
                        {showAddToCart && product.inStock && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="lg:hidden"
                                onClick={handleAddToCart}
                                disabled={adding}
                            >
                                <ShoppingBag className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
}
