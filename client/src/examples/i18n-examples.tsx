import { useTranslation } from 'react-i18next';

export function BasicExample() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('common.loading')}</p>
      <button>{t('common.submit')}</button>
    </div>
  );
}

export function NestedExample() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('home.hero.title')}</h2>
      <p>{t('home.hero.subtitle')}</p>
      <button>{t('home.hero.cta')}</button>
    </div>
  );
}

export function InterpolationExample() {
  const { t } = useTranslation();
  const minLength = 8;
  const maxLength = 20;
  
  return (
    <div>
      <p>{t('validation.minLength', { min: minLength })}</p>
      <p>{t('validation.maxLength', { max: maxLength })}</p>
    </div>
  );
}

export function LanguageSwitchExample() {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div>
      <h2>{t('header.home')}</h2>
      <div>
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('es')}>Español</button>
        <button onClick={() => changeLanguage('fr')}>Français</button>
        <button onClick={() => changeLanguage('id')}>Bahasa Indonesia</button>
      </div>
      <p>Current Language: {i18n.language}</p>
    </div>
  );
}

export function ConditionalExample({ isInStock }: { isInStock: boolean }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>{isInStock ? t('products.inStock') : t('products.outOfStock')}</p>
    </div>
  );
}

export function ArrayMappingExample() {
  const { t } = useTranslation();
  
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  return (
    <ul>
      {statuses.map(status => (
        <li key={status}>
          {t(`orderStatus.${status}`)}
        </li>
      ))}
    </ul>
  );
}

export function FormExample() {
  const { t } = useTranslation();
  
  return (
    <form>
      <div>
        <label>{t('auth.login.email')}</label>
        <input 
          type="email" 
          placeholder={t('auth.login.email')}
        />
      </div>
      <div>
        <label>{t('auth.login.password')}</label>
        <input 
          type="password" 
          placeholder={t('auth.login.password')}
        />
      </div>
      <button type="submit">{t('auth.login.submit')}</button>
    </form>
  );
}

export function NavigationExample() {
  const { t } = useTranslation();
  
  const navLinks = [
    { path: '/', label: t('header.home') },
    { path: '/products', label: t('header.products') },
    { path: '/cart', label: t('header.cart') },
  ];
  
  return (
    <nav>
      {navLinks.map(link => (
        <a key={link.path} href={link.path}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export function NotificationExample() {
  const { t } = useTranslation();
  
  const showSuccessMessage = () => {
    console.log(t('cart.itemAdded'));
  };
  
  const showErrorMessage = () => {
    console.log(t('checkout.orderError'));
  };
  
  return (
    <div>
      <button onClick={showSuccessMessage}>
        {t('common.success')}
      </button>
      <button onClick={showErrorMessage}>
        {t('common.error')}
      </button>
    </div>
  );
}

export function CategoryExample() {
  const { t } = useTranslation();
  
  const categories = ['rings', 'necklaces', 'earrings', 'bracelets'];
  
  return (
    <div>
      <h2>{t('products.categories')}</h2>
      <ul>
        {categories.map(category => (
          <li key={category}>
            <a href={`/products?category=${category}`}>
              {t(`products.${category}`)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DashboardExample({ user }: { user: { email: string } }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.welcome')}, {user.email}</h1>
      <nav>
        <a href="/dashboard">{t('dashboard.profile')}</a>
        <a href="/purchase-history">{t('header.purchaseHistory')}</a>
        <a href="/settings">{t('dashboard.settings')}</a>
      </nav>
    </div>
  );
}

export function AdminExample() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('admin.title')}</h1>
      <nav>
        <a href="/admin/products">{t('admin.products')}</a>
        <a href="/admin/orders">{t('admin.orders')}</a>
        <a href="/admin/users">{t('admin.users')}</a>
        <a href="/admin/analytics">{t('admin.analytics')}</a>
      </nav>
      <button>{t('admin.addProduct')}</button>
    </div>
  );
}

export function ValidationExample({ errors }: { errors: any }) {
  const { t } = useTranslation();
  
  return (
    <div>
      {errors.required && <p>{t('validation.required')}</p>}
      {errors.email && <p>{t('validation.email')}</p>}
      {errors.minLength && (
        <p>{t('validation.minLength', { min: errors.minLength })}</p>
      )}
    </div>
  );
}

export function FooterExample() {
  const { t } = useTranslation();
  
  return (
    <footer>
      <nav>
        <a href="/about">{t('footer.aboutUs')}</a>
        <a href="/contact">{t('footer.contact')}</a>
        <a href="/terms">{t('footer.termsOfService')}</a>
        <a href="/privacy">{t('footer.privacyPolicy')}</a>
      </nav>
      <p>{t('footer.copyright')}</p>
    </footer>
  );
}

export function CartExample({ items }: { items: any[] }) {
  const { t } = useTranslation();
  
  if (items.length === 0) {
    return (
      <div>
        <p>{t('cart.empty')}</p>
        <button>{t('cart.continueShopping')}</button>
      </div>
    );
  }
  
  return (
    <div>
      <h2>{t('cart.title')}</h2>
      <button>{t('cart.checkout')}</button>
    </div>
  );
}

export default {
  BasicExample,
  NestedExample,
  InterpolationExample,
  LanguageSwitchExample,
  ConditionalExample,
  ArrayMappingExample,
  FormExample,
  NavigationExample,
  NotificationExample,
  CategoryExample,
  DashboardExample,
  AdminExample,
  ValidationExample,
  FooterExample,
  CartExample,
};
