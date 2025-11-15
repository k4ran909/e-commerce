import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";
import { useState, useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";

export default function Products() {
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

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const categories = [
    { value: "all", label: "All Jewelry" },
    { value: "rings", label: "Rings" },
    { value: "necklaces", label: "Necklaces" },
    { value: "bracelets", label: "Bracelets" },
    { value: "earrings", label: "Earrings" },
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
              ? `Results for "${query}"`
              : selectedCategory === "all"
              ? "Products"
              : categories.find((c) => c.value === selectedCategory)?.label}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </p>
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
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {query ? "No products match your search" : "No products found in this category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
