import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/products", label: "All Jewelry" },
    { path: "/products?category=rings", label: "Rings" },
    { path: "/products?category=necklaces", label: "Necklaces" },
    { path: "/products?category=bracelets", label: "Bracelets" },
    { path: "/products?category=earrings", label: "Earrings" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" data-testid="link-home">
          <h1 className="font-serif text-xl font-semibold tracking-tight lg:text-2xl cursor-pointer hover-elevate px-3 py-2 rounded-md">
            Lumière
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <Button
                variant="ghost"
                data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`font-medium text-sm ${
                  location === link.path ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-search"
            className="hidden sm:flex rounded-full"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCart}
            data-testid="button-cart"
            className="relative rounded-full"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge
                variant="default"
                data-testid="badge-cart-count"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {totalItems}
              </Badge>
            )}
            <span className="sr-only">Shopping cart</span>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="button-menu" className="rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.path} href={link.path}>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`mobile-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`w-full justify-start font-medium ${
                        location === link.path ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
