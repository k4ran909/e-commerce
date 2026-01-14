import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@shared/schema";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";

export default function ProductDetail() {
  const { t } = useTranslation();
  const [, params] = useRoute("/product/:id");
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
  });

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleCart } = useCart();
  const { toast } = useToast();
  const { me } = useAuth();
  const [, setLocation] = useLocation();
  const search = typeof window !== "undefined" ? window.location.search : "";
  const paramsSearch = new URLSearchParams(search);
  const from = paramsSearch.get("from");
  const backHref = from === "admin" ? "/admin" : "/products";
  const backLabel = from === "admin" ? t('common.back') + " to " + t('header.dashboard') : t('productDetail.backToProducts');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <Skeleton className="h-8 w-24 mb-8" />
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl mb-4">{t('products.noProducts')}</h2>
          <Link href={backHref}>
            <Button>{backLabel}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(product.price / 100);

  const handleAddToCart = () => {
    if (!me) {
      toast({ title: t('cart.loginRequired'), description: t('cart.loginToCheckout'), variant: "destructive" });
      const current = window.location.pathname + window.location.search;
      setLocation(`/login?returnTo=${encodeURIComponent(current)}`);
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: t('validation.required'),
        variant: "destructive",
      });
      return;
    }

    addToCart(product, selectedSize, quantity);
    toast({
      title: t('cart.itemAdded'),
      description: `${product.name} ${t('cart.itemAdded').toLowerCase()}`,
    });
    toggleCart();
  };

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Back button */}
        <Link href={backHref}>
          <Button variant="ghost" className="mb-8" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-md bg-accent">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-contain"
                data-testid="img-product-main"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1).map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square overflow-hidden rounded-md bg-accent cursor-pointer hover-elevate"
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 2}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1
                className="font-serif text-3xl lg:text-4xl font-light mb-2"
                data-testid="text-product-name"
              >
                {product.name}
              </h1>
              <p className="text-lg font-serif font-semibold" data-testid="text-product-price">
                {formattedPrice}
              </p>
            </div>

            {(product.isPreOrder || !product.inStock) && (
              <div className="flex gap-2">
                {product.isPreOrder && (
                  <Badge variant="secondary" data-testid="badge-preorder">
                    {t('products.preOrder')}
                  </Badge>
                )}
                {!product.inStock && (
                  <Badge variant="secondary" data-testid="badge-out-of-stock">
                    {t('products.outOfStock')}
                  </Badge>
                )}
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('productDetail.material')}</p>
              <p className="font-medium">{product.material}</p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <Label className="text-base mb-3 block">{t('cart.size')}</Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size) => (
                      <div key={size}>
                        <RadioGroupItem
                          value={size}
                          id={`size-${size}`}
                          className="peer sr-only"
                          data-testid={`radio-size-${size}`}
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className="flex items-center justify-center rounded-md border-2 border-muted bg-background px-3 py-3 hover-elevate peer-data-[state=checked]:border-primary cursor-pointer"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label className="text-base mb-3 block">{t('productDetail.quantity')}</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="button-decrease-quantity"
                  className="rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-increase-quantity"
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.inStock && !product.isPreOrder}
              data-testid="button-add-to-cart"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {product.isPreOrder ? t('products.preOrder') : t('productDetail.addToCart')}
            </Button>

            {/* Product Details Tabs */}
            <Tabs defaultValue="description" className="mt-8">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="description" data-testid="tab-description">
                  {t('productDetail.description')}
                </TabsTrigger>
                <TabsTrigger value="materials" data-testid="tab-materials">
                  {t('productDetail.material')}
                </TabsTrigger>
                <TabsTrigger value="shipping" data-testid="tab-shipping">
                  {t('checkout.shippingInfo')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4 text-sm leading-relaxed">
                <p data-testid="text-description">{product.description}</p>
              </TabsContent>
              <TabsContent value="materials" className="mt-4 text-sm leading-relaxed">
                <p>
                  Crafted from {product.material}, each piece is carefully handmade by
                  skilled artisans. We use only ethically sourced materials and
                  conflict-free gemstones.
                </p>
              </TabsContent>
              <TabsContent value="shipping" className="mt-4 text-sm leading-relaxed">
                <p>
                  Free shipping on all orders over Rp 1.000.000. Standard delivery
                  takes 3-5 business days. Express shipping available at checkout.
                  Pre-order items ship within 2-4 weeks.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
