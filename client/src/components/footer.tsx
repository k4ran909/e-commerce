import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [location, setLocation] = useLocation();

  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    if (location === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLocation(path);
    }
  };

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
              <span className="text-2xl">🧶</span>
              <span>Craftellar</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Handmade crochet accessories crafted with love and premium quality yarns.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/"
                  onClick={(e) => handleLinkClick('/', e)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {t('header.home')}
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  onClick={(e) => handleLinkClick('/products', e)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {t('header.products')}
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  onClick={(e) => handleLinkClick('/login', e)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {t('auth.login.submit')}
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  onClick={(e) => handleLinkClick('/register', e)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {t('auth.register.submit')}
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              {t('footer.categories')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=bags" className="text-muted-foreground hover:text-foreground transition-colors">
                  Bags & Purses
                </Link>
              </li>
              <li>
                <Link href="/products?category=hats" className="text-muted-foreground hover:text-foreground transition-colors">
                  Hats & Beanies
                </Link>
              </li>
              <li>
                <Link href="/products?category=scarves" className="text-muted-foreground hover:text-foreground transition-colors">
                  Scarves & Shawls
                </Link>
              </li>
              <li>
                <Link href="/products?category=amigurumi" className="text-muted-foreground hover:text-foreground transition-colors">
                  Amigurumi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>hello@craftellar.com</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Handmade with ❤️ from our studio</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} Craftellar. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
