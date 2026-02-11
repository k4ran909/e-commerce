import { MedusaProductCard } from "@/components/medusa-product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { useMedusaProducts, type Product } from "@/lib/use-medusa-products";

// Feature flag to switch between Medusa and legacy API
const USE_MEDUSA = import.meta.env.VITE_USE_MEDUSA !== "false";

export default function Products() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [matchCat, params] = useRoute("/products/category/:category");
  const [searchStr, setSearchStr] = useState<string>(typeof window !== "undefined" ? window.location.search : "");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchStr(window.location.search);
    }
  }, [location]);

  const urlParams = useMemo(() => new URLSearchParams(searchStr), [searchStr]);
  const categoryFromPath = matchCat ? params?.category ?? null : null;
  const categoryParam = categoryFromPath || urlParams.get("category");
  const qParam = urlParams.get("q")?.trim() || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [query, setQuery] = useState<string>(qParam);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("all");
    }
  }, [categoryParam]);

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  // Fetch products from Medusa
  const { data: products, isLoading, error } = useMedusaProducts({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    q: query || undefined,
  });

  const categories = [
    { value: "all", label: t('products.all') },
    { value: "rings", label: t('products.rings') },
    { value: "necklaces", label: t('products.necklaces') },
    { value: "bracelets", label: t('products.bracelets') },
    { value: "earrings", label: t('products.earrings') },
  ];

  const filteredProducts = useMemo(() => {
    const base = (products || [])
      .filter((p) => selectedCategory === "all" || p.category === selectedCategory)
      .filter((p) => {
        if (!query) return true;
        const hay = `${p.name} ${p.description} ${p.material}`.toLowerCase();
        return hay.includes(query.toLowerCase());
      });

    return base.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, selectedCategory, sortBy, query]);

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl lg:text-4xl font-light mb-2">
            {query
              ? t('products.searchResults', { query })
              : selectedCategory === "all"
                ? t('products.title')
                : categories.find((c) => c.value === selectedCategory)?.label}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? t('products.product') : t('products.products')}
          </p>
          {USE_MEDUSA && (
            <p className="text-xs text-muted-foreground mt-1">
              Powered by Medusa
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => {
                  const value = category.value;
                  setSelectedCategory(value);
                  const params = new URLSearchParams(searchStr || "");
                  const q = params.get("q");
                  if (value === "all") {
                    setLocation(`/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
                  } else {
                    setLocation(`/products/category/${value}${q ? `?q=${encodeURIComponent(q)}` : ""}`);
                  }
                }}
                data-testid={`button-category-${category.value}`}
              >
                {category.label}
              </Button>
            ))}
          </div>
          <div className="sm:ml-auto w-full sm:w-48">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort">
                <SelectValue placeholder={t('products.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t('products.sort.featured')}</SelectItem>
                <SelectItem value="price-asc">{t('products.sort.priceLowToHigh')}</SelectItem>
                <SelectItem value="price-desc">{t('products.sort.priceHighToLow')}</SelectItem>
                <SelectItem value="name">{t('products.sort.name')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive text-lg mb-4">
              Failed to load products from Medusa
            </p>
            <p className="text-muted-foreground text-sm">
              Make sure the Medusa backend is running at {import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000'}
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {query ? t('products.noSearchResults') : t('products.noCategoryResults')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <MedusaProductCard key={product.id} product={product} showAddToCart />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
