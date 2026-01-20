import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const heroImage = "/Elegant_hero_lifestyle_jewelry_photo_1ea3bf8d.webp";
  const ringsImage = "/Rose_gold_diamond_ring_406b3b84.webp";
  const necklacesImage = "/Gold_pendant_necklace_84aa4494.webp";
  const braceletsImage = "/Silver_charm_bracelet_db9c5a93.webp";
  const earringsImage = "/Pearl_stud_earrings_00219806.webp";
  const categories = [
    {
      name: t('products.rings'),
      description: "Timeless elegance for every moment",
      href: "/products?category=rings",
      testId: "card-category-rings",
      image: ringsImage,
    },
    {
      name: t('products.necklaces'),
      description: "Graceful pieces to elevate your style",
      href: "/products?category=necklaces",
      testId: "card-category-necklaces",
      image: necklacesImage,
    },
    {
      name: t('products.bracelets'),
      description: "Delicate charm for your wrist",
      href: "/products?category=bracelets",
      testId: "card-category-bracelets",
      image: braceletsImage,
    },
    {
      name: t('products.earrings'),
      description: "Stunning accents for every occasion",
      href: "/products?category=earrings",
      testId: "card-category-earrings",
      image: earringsImage,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] lg:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Elegant jewelry collection"
            className="h-full w-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src.endsWith('/favicon.png')) return;
              e.currentTarget.src = "/favicon.png";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl space-y-6">
            <h1
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-white"
              data-testid="text-hero-title"
            >
              {t('home.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <Link href="/products">
              <Button
                size="lg"
                data-testid="button-shop-now"
                className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
              >
                {t('home.hero.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-4">
              {t('products.categories')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('home.featured.title')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <Card
                  data-testid={category.testId}
                  className="group overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 h-full"
                >
                  <div className="aspect-square bg-accent relative overflow-hidden">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={`${category.name} category`}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        onError={(e) => {
                          if (e.currentTarget.src.endsWith('/favicon.png')) return;
                          e.currentTarget.src = "/favicon.png";
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/20 group-hover:from-black/10 group-hover:via-black/5 group-hover:to-black/10 transition-all duration-300" />
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

      {/* Featured Collection */}
      <section className="py-16 lg:py-24 bg-accent/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Crafted with Passion
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Each piece in our collection is meticulously handcrafted by skilled
              artisans, ensuring exceptional quality and timeless beauty. We use only
              the finest materials to create jewelry that tells your unique story.
            </p>
            <Link href="/products">
              <Button variant="outline" size="lg" data-testid="button-view-all">
                {t('home.featured.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
