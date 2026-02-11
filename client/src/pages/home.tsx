import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMedusaProducts } from "@/lib/use-medusa-products";
import { MedusaProductCard } from "@/components/medusa-product-card";

export default function Home() {
  const { t } = useTranslation();

  // Hero images for crochet accessories
  const heroImage = "/Elegant_hero_lifestyle_jewelry_photo_1ea3bf8d.webp";

  // Category images for crochet
  const bagsImage = "/favicon.png";
  const hatsImage = "/favicon.png";
  const scarvesImage = "/favicon.png";
  const amigurumiImage = "/favicon.png";

  // Fetch featured products from Medusa
  const { data: featuredProducts, isLoading: productsLoading } = useMedusaProducts({ limit: 4 });

  const categories = [
    {
      name: "Bags & Purses",
      description: "Handcrafted crochet bags for every occasion",
      href: "/products?category=bags",
      testId: "card-category-bags",
      image: bagsImage,
    },
    {
      name: "Hats & Beanies",
      description: "Cozy handmade headwear for all seasons",
      href: "/products?category=hats",
      testId: "card-category-hats",
      image: hatsImage,
    },
    {
      name: "Scarves & Shawls",
      description: "Elegant wraps to keep you warm",
      href: "/products?category=scarves",
      testId: "card-category-scarves",
      image: scarvesImage,
    },
    {
      name: "Amigurumi",
      description: "Adorable crocheted stuffed toys",
      href: "/products?category=amigurumi",
      testId: "card-category-amigurumi",
      image: amigurumiImage,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] lg:h-[80vh] overflow-hidden bg-gradient-to-br from-rose-100 via-amber-50 to-orange-100 dark:from-rose-950 dark:via-amber-950 dark:to-orange-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,146,60,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.2),transparent_50%)]" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl space-y-6">
            <div className="inline-block px-4 py-2 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-rose-200 dark:border-rose-800 mb-4">
              <span className="text-sm font-medium text-rose-600 dark:text-rose-400">✨ Handmade with Love</span>
            </div>
            <h1
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 dark:text-white"
              data-testid="text-hero-title"
            >
              Beautiful Crochet Accessories
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light max-w-2xl mx-auto">
              Discover unique, handcrafted crochet pieces made with premium yarn and endless creativity
            </p>
            <Link href="/products">
              <Button
                size="lg"
                data-testid="button-shop-now"
                className="mt-4 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25"
              >
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products from Medusa */}
      {(featuredProducts?.length || productsLoading) && (
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl lg:text-4xl font-light mb-4">
                Featured Creations
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our most loved handmade crochet pieces
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {productsLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : (
                featuredProducts?.slice(0, 4).map((product) => (
                  <MedusaProductCard key={product.id} product={product} showAddToCart />
                ))
              )}
            </div>

            <div className="text-center mt-8">
              <Link href="/products">
                <Button variant="outline" size="lg">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 lg:py-24 bg-accent/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find the perfect handmade accessory for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <Card
                  data-testid={category.testId}
                  className="group overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 h-full bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/50 dark:to-amber-950/50 border-rose-200/50 dark:border-rose-800/50"
                >
                  <div className="aspect-square bg-accent relative overflow-hidden flex items-center justify-center">
                    <div className="text-6xl">🧶</div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-serif text-xl font-medium mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Crafted with Passion
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Every piece at Craftellar is lovingly handmade using premium quality yarns.
              Our crochet accessories are designed to bring warmth, style, and a touch of
              artisanal charm to your everyday life. Each stitch tells a story of
              creativity and dedication.
            </p>
            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-rose-500">100%</div>
                <div className="text-sm text-muted-foreground">Handmade</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-rose-500">Premium</div>
                <div className="text-sm text-muted-foreground">Quality Yarn</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-rose-500">Unique</div>
                <div className="text-sm text-muted-foreground">Designs</div>
              </div>
            </div>
            <Link href="/products">
              <Button variant="outline" size="lg" data-testid="button-view-all" className="mt-8">
                Explore Our Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
