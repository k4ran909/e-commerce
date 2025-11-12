# Design Guidelines: Elegant Jewelry E-commerce Store

## Design Approach
**Reference-Based Design** inspired by Pandora US with influences from luxury jewelry e-commerce leaders (Tiffany & Co., Cartier, Mejuri). Focus on creating a sophisticated, feminine aesthetic that emphasizes product photography and creates an aspirational shopping experience.

**Core Principles:**
- Generous whitespace to create breathing room and luxury feel
- Product photography as the hero element
- Refined, understated elegance over bold statements
- Seamless, frictionless shopping experience

## Typography

**Font Families:**
- Headings: Playfair Display (serif) or Cormorant Garamond - elegant, refined
- Body: Inter or Montserrat (light/regular weights) - clean, readable
- Accents: Optionally use headings font for special callouts

**Hierarchy:**
- Hero Headlines: 3xl to 5xl, light weight
- Section Titles: 2xl to 3xl
- Product Names: lg to xl, medium weight
- Body Text: base, light to regular weight
- Buttons/CTAs: sm to base, medium weight, subtle letter-spacing
- Price Display: xl, medium weight for emphasis

## Layout System

**Spacing Primitives:** Use Tailwind units of 3, 4, 6, 8, 12, 16, 20 for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Grid gaps: gap-4 to gap-8
- Container max-width: max-w-7xl with px-4 to px-8

**Grid Systems:**
- Product grids: 2 columns mobile, 3-4 columns desktop (grid-cols-2 lg:grid-cols-4)
- Feature sections: 1-2 columns mobile, 2-3 columns desktop
- Cart layout: Single column mobile, 2-column desktop (cart items + summary)

## Component Library

### Navigation
- Sticky header with subtle shadow on scroll
- Logo centered or left-aligned
- Clean horizontal navigation with dropdown menus for categories
- Right-aligned icons: Search, Account, Cart with item count badge
- Mobile: Hamburger menu with slide-in drawer

### Product Cards
- High-quality square product images with subtle hover zoom
- Product name below image
- Price display with currency symbol
- "Pre-Order" or "New" badges positioned top-right on image
- Quick view or wishlist icon overlay on hover
- Subtle border or shadow for definition

### Product Detail Page
- Large image gallery (main image + thumbnails below or side)
- Product title, price, rating display
- Size/variant selector with elegant radio buttons or swatches
- Quantity selector with refined +/- buttons
- "Add to Cart" and "Pre-Order" primary buttons
- Detailed description in tabs or accordion (Description, Materials, Care, Shipping)
- "You May Also Like" carousel at bottom

### Shopping Cart
- Slide-in drawer from right OR dedicated page
- Product thumbnail, name, variant, quantity controls
- Remove item option (× icon)
- Running subtotal
- Fixed "Proceed to Checkout" button at bottom

### Checkout
- Multi-step or single-page form
- Shipping information fields with clean input styling
- Order summary sidebar (desktop) or collapsible section (mobile)
- Stripe payment integration with card element
- Trust badges and security indicators

### Forms & Inputs
- Subtle borders with focus states (soft glow, not harsh outlines)
- Floating labels or top-aligned labels
- Input fields: rounded-md with px-4 py-3
- Select dropdowns with custom styling
- Radio buttons and checkboxes: custom styled, elegant
- Error states: soft red indication below field

### Buttons
- Primary CTA: Medium size, rounded, subtle shadow
- Secondary: Outlined or ghost style
- Icon buttons: Circular or square with icon only
- Hover states: Slight lift (shadow increase) or opacity change
- Disabled state: Reduced opacity

### Product Filters
- Sidebar (desktop) or dropdown/drawer (mobile)
- Category checkboxes or buttons
- Price range slider
- Sort dropdown (Price: Low to High, New Arrivals, etc.)

## Images

**Hero Section:**
- Large, high-quality lifestyle image showcasing jewelry in elegant setting
- Image: Model wearing signature jewelry piece, soft natural lighting
- Minimal text overlay (headline + CTA button with blurred background)
- Height: 70vh to 80vh on desktop, 60vh on mobile

**Product Photography:**
- Clean white or soft neutral backgrounds
- Multiple angles for detail pages (front, side, worn on model)
- Consistent lighting and styling across all products
- Lifestyle images showing jewelry in use

**Category Banners:**
- Medium-height banners (40vh) for category pages
- Subtle overlay for text readability

**Trust & Social Proof:**
- Customer photos in testimonial section
- Instagram-style grid showcasing user-generated content
- Team/craftsman photos for "About" storytelling

**Placement:**
- Homepage: Hero + featured collections + category cards + customer gallery
- Category pages: Banner + product grid
- Product detail: Gallery + lifestyle shots
- About page: Craftsman/workshop photos

## Animations
Use sparingly for sophistication:
- Subtle fade-in on scroll for sections
- Product card hover: gentle image zoom (scale-105)
- Cart icon: bounce animation on item add
- Page transitions: Smooth fade between pages
- NO: Excessive parallax, flashy effects, or distracting movements