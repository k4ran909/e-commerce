/**
 * Medusa Cart Sheet Component
 * 
 * A slide-out cart panel that displays cart items from Medusa
 * and allows quantity updates and item removal.
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import { Link } from "wouter";
import { useMedusa } from "@/lib/medusa-provider";
import { useCart } from "@/lib/cart-context";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function MedusaCartSheet() {
    const { t } = useTranslation();
    const { cart, cartLoading, updateCartItem, removeCartItem, formatPrice, cartItemsCount } = useMedusa();
    const { isCartOpen, setIsCartOpen } = useCart();
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

    const handleUpdateQuantity = async (lineItemId: string, newQuantity: number) => {
        setUpdatingItems(prev => new Set(prev).add(lineItemId));
        try {
            await updateCartItem(lineItemId, newQuantity);
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(lineItemId);
                return next;
            });
        }
    };

    const handleRemoveItem = async (lineItemId: string) => {
        setUpdatingItems(prev => new Set(prev).add(lineItemId));
        try {
            await removeCartItem(lineItemId);
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(lineItemId);
                return next;
            });
        }
    };

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="w-full sm:max-w-lg flex flex-col">
                <SheetHeader className="space-y-2.5 pb-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            {t('cart.title')} ({cartItemsCount})
                        </SheetTitle>
                    </div>
                </SheetHeader>

                <Separator />

                {cartLoading ? (
                    <div className="flex-1 py-6 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-20 w-20 rounded" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !cart?.items?.length ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-lg mb-2">{t('cart.empty')}</p>
                        <p className="text-sm text-muted-foreground mb-6">
                            {t('cart.emptyDescription') || 'Add items to your cart to see them here'}
                        </p>
                        <Button onClick={() => setIsCartOpen(false)} asChild>
                            <Link href="/products">{t('cart.continueShopping')}</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 py-4">
                            <div className="space-y-4 pr-4">
                                {cart.items.map((item) => {
                                    const isUpdating = updatingItems.has(item.id);

                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex gap-4 p-3 rounded-lg bg-accent/50 transition-opacity ${isUpdating ? 'opacity-50' : ''
                                                }`}
                                        >
                                            {/* Product Image */}
                                            <div className="h-20 w-20 rounded-md bg-accent overflow-hidden flex-shrink-0">
                                                {item.thumbnail ? (
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {item.description || item.variant?.title}
                                                </p>
                                                <p className="font-semibold text-sm mt-1">
                                                    {formatPrice(item.unit_price)}
                                                </p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        disabled={isUpdating || item.quantity <= 1}
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        disabled={isUpdating}
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                                                        disabled={isUpdating}
                                                        onClick={() => handleRemoveItem(item.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        <Separator className="my-4" />

                        {/* Cart Summary */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                                <span>{formatPrice(cart.subtotal || 0)}</span>
                            </div>
                            {(cart.discount_total || 0) > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>{t('cart.discount')}</span>
                                    <span>-{formatPrice(cart.discount_total || 0)}</span>
                                </div>
                            )}
                            {(cart.shipping_total || 0) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('checkout.shippingInfo')}</span>
                                    <span>{formatPrice(cart.shipping_total || 0)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-semibold text-lg">
                                <span>{t('cart.total')}</span>
                                <span>{formatPrice(cart.total || 0)}</span>
                            </div>
                        </div>

                        <SheetFooter className="mt-4 gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsCartOpen(false)}
                            >
                                {t('cart.continueShopping')}
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => setIsCartOpen(false)}
                                asChild
                            >
                                <Link href="/checkout">{t('cart.checkout')}</Link>
                            </Button>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
