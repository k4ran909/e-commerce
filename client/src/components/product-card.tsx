import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(product.price / 100);

  return (
    <Link href={`/product/${product.id}`}>
      <Card
        data-testid={`card-product-${product.id}`}
        className="group overflow-hidden border hover-elevate active-elevate-2 cursor-pointer transition-all duration-300"
      >
        <div className="relative aspect-square overflow-hidden bg-accent">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            data-testid={`img-product-${product.id}`}
            onError={(e) => {
              if (e.currentTarget.src.endsWith('/favicon.png')) return;
              e.currentTarget.src = "/favicon.png";
            }}
          />
          {product.isPreOrder && (
            <Badge
              variant="secondary"
              data-testid={`badge-preorder-${product.id}`}
              className="absolute top-3 right-3 font-medium"
            >
              Pre-Order
            </Badge>
          )}
          {!product.inStock && !product.isPreOrder && (
            <Badge
              variant="secondary"
              data-testid={`badge-outofstock-${product.id}`}
              className="absolute top-3 right-3 font-medium"
            >
              Out of Stock
            </Badge>
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
            {product.material}
          </p>
          <p
            className="font-serif text-lg font-semibold"
            data-testid={`text-product-price-${product.id}`}
          >
            {formattedPrice}
          </p>
        </div>
      </Card>
    </Link>
  );
}
