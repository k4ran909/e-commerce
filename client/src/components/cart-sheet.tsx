import { Sheet, SheetContent, SheetTitle, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function CartSheet() {
  const { items, totalPrice, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const { me } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalPrice / 100);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent hideClose className="flex w-full flex-col sm:max-w-lg" aria-describedby={undefined}>
        <div className="flex items-center justify-between mb-2">
          <SheetTitle className="font-serif text-2xl">{t('cart.title')}</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <X className="h-6 w-6" />
              <span className="sr-only">{t('common.close')}</span>
            </Button>
          </SheetClose>
        </div>
        <SheetDescription asChild>
          <p id="cart-description" className="sr-only">
          {items.length === 0 
            ? t('cart.empty') 
            : `${t('cart.title')} ${items.length} ${items.length === 1 ? t('cart.item') : t('cart.items')}`}
          </p>
        </SheetDescription>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">{t('cart.empty')}</p>
            <Link href="/products">
              <Button onClick={() => setIsCartOpen(false)} data-testid="button-browse-products">
                {t('cart.continueShopping')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item, index) => {
                  const itemKey = `${item.product.id}-${item.size || "default"}`;
                  const formattedPrice = new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(item.product.price / 100);

                  return (
                    <div
                      key={itemKey}
                      data-testid={`cart-item-${itemKey}`}
                      className="flex gap-4"
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-accent">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <h4
                              className="font-medium text-sm"
                              data-testid={`text-cart-item-name-${itemKey}`}
                            >
                              {item.product.name}
                            </h4>
                            {item.size && (
                              <p className="text-sm text-muted-foreground">
                                {t('cart.size')}: {item.size}
                              </p>
                            )}
                            <p className="text-sm font-medium mt-1">{formattedPrice}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            data-testid={`button-remove-${itemKey}`}
                            className="h-8 w-8 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1, item.size)
                            }
                            data-testid={`button-decrease-${itemKey}`}
                            className="h-8 w-8 rounded-full"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span
                            className="w-8 text-center text-sm font-medium"
                            data-testid={`text-quantity-${itemKey}`}
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1, item.size)
                            }
                            data-testid={`button-increase-${itemKey}`}
                            className="h-8 w-8 rounded-full"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between text-base font-medium">
                <span>{t('cart.subtotal')}</span>
                <span data-testid="text-cart-total" className="font-serif text-lg">
                  {formattedTotal}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('cart.shippingNote')}
              </p>
              <Button
                className="w-full"
                onClick={() => {
                  if (!me) {
                    toast({
                      title: t('cart.loginRequired'),
                      description: t('cart.loginToCheckout'),
                      variant: "destructive",
                    });
                    setIsCartOpen(false);
                    setLocation("/login?returnTo=%2Fcheckout");
                    return;
                  }
                  setIsCartOpen(false);
                  setLocation("/checkout");
                }}
                data-testid="button-checkout"
              >
                {t('cart.checkout')}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
