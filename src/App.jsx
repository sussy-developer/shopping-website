import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search, ShoppingCart, User, ChevronDown, Star, Plus, Minus, X, Check,
  Trash2, Package, CreditCard, Wallet, Truck, Heart, LogOut, Edit3,
  ShieldCheck, ArrowRight, ArrowLeft, Filter, ChevronRight, Eye, EyeOff,
  Sparkles, TrendingUp, Award, Clock, MapPin, Phone, Mail, Lock,
  Cpu, Shirt, Home as HomeIcon, BookOpen, Sparkle, Dumbbell, Headphones,
  Camera, Watch, Coffee, Lamp, Sofa, Laptop, Smartphone, Gift,
  Settings, ListOrdered, MessageSquare, AlertCircle, Loader2, ChevronLeft,
  Menu, LayoutGrid
} from "lucide-react";
import Lenis from '@studio-freight/lenis';
import CreativeTransition from "./CreativeTransition";

// ============================================================
// DATABASE LAYER
// Storage keys mirror the SQL relational schema exactly:
//   users:{id}, email_index:{email}, phone_index:{phone}
//   categories (single key, array)
//   products (single key, array) — small enough to batch
//   inventory:{product_id}
//   cart:{user_id} — enforces one cart per user
//   orders_by_user:{user_id} — index of order ids
//   order:{order_id}
//   order_items:{order_id}
//   payment:{order_id}
//   reviews_by_product:{product_id}
//   reviews_by_user:{user_id}
//   session:current
// ============================================================

const DB = {
  async get(key) { console.warn("Mock DB get called for", key); return null; },
  async set(key, value) { console.warn("Mock DB set called for", key); return true; },
  async del(key) { return true; },
  async list(prefix) { return []; }
};

// simple deterministic hash for demo passwords (NOT for production)
const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return "h" + Math.abs(h).toString(36);
};
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// ============================================================
// SEED DATA — categories & products
// ============================================================

const SEED_CATEGORIES = [
  { id: "cat_electronics", name: "Electronics", slug: "electronics", icon: "Cpu",
    accent: "#171717", tint: "#F5F5F5", description: "Cutting-edge gadgets & devices" },
  { id: "cat_fashion", name: "Fashion", slug: "fashion", icon: "Shirt",
    accent: "#171717", tint: "#F5F5F5", description: "Apparel for every occasion" },
  { id: "cat_home", name: "Home & Living", slug: "home", icon: "Sofa",
    accent: "#171717", tint: "#F5F5F5", description: "Furniture, decor, essentials" },
  { id: "cat_books", name: "Books", slug: "books", icon: "BookOpen",
    accent: "#171717", tint: "#F5F5F5", description: "Stories, ideas, knowledge" },
  { id: "cat_beauty", name: "Beauty", slug: "beauty", icon: "Sparkle",
    accent: "#171717", tint: "#F5F5F5", description: "Skincare & personal care" },
  { id: "cat_sports", name: "Sports", slug: "sports", icon: "Dumbbell",
    accent: "#171717", tint: "#F5F5F5", description: "Gear for active living" },
];

const SEED_PRODUCTS = [
  // Electronics
  { id: "p_001", name: "Aurora Wireless Headphones", brand: "Sonata Audio", category_id: "cat_electronics",
    price: 189.00, image: "/images/prod_headphones.png",
    description: "Studio-grade active noise cancellation with 40-hour battery life. Plush memory-foam cups, lossless Bluetooth 5.3, and an adaptive EQ that tunes itself to your hearing profile.",
    stock: 24 },
  { id: "p_002", name: "Lumen 14 Pro Laptop", brand: "Northwave", category_id: "cat_electronics",
    price: 1499.00, image: "/images/prod_laptop.png",
    description: "14-inch micro-OLED display, 18-core ARM silicon, 22-hour battery. Engineered for creative professionals who refuse to plug in.",
    stock: 8 },
  { id: "p_003", name: "Helix 5G Smartphone", brand: "Northwave", category_id: "cat_electronics",
    price: 899.00, image: "/images/prod_phone.png",
    description: "Triple-lens computational camera, titanium chassis, and a 6.7-inch LTPO display that drops to 1Hz to sip battery on the lock screen.",
    stock: 15 },
  { id: "p_004", name: "Orbit Smartwatch GS", brand: "Sonata Audio", category_id: "cat_electronics",
    price: 349.00, image: "/images/prod_watch.png",
    description: "Sapphire crystal face, dual-frequency GPS, blood-oxygen and ECG sensors. Seven days on a single charge.",
    stock: 0 },
  // Fashion
  { id: "p_005", name: "Linen Heritage Shirt", brand: "Marlow & Co", category_id: "cat_fashion",
    price: 89.00, image: "/images/prod_shirt.png",
    description: "Garment-dyed Belgian linen with mother-of-pearl buttons and reinforced split-tail hem. Pre-washed for that perfect Sunday-afternoon drape.",
    stock: 42 },
  { id: "p_006", name: "Stride Runner Sneakers", brand: "Kestrel", category_id: "cat_fashion",
    price: 145.00, image: "/images/prod_sneakers.png",
    description: "Nitrogen-infused foam midsole and a recycled-knit upper. Tested across 12,000 km of city pavement so your knees don't have to be.",
    stock: 30 },
  { id: "p_007", name: "Atelier Leather Tote", brand: "Marlow & Co", category_id: "cat_fashion",
    price: 320.00, image: "/images/prod_tote.png",
    description: "Full-grain vegetable-tanned Tuscan leather. Hand-stitched in Florence. Develops a patina that becomes uniquely yours.",
    stock: 12 },
  // Home
  { id: "p_008", name: "Cascade Pour-Over Set", brand: "Hearthworks", category_id: "cat_home",
    price: 68.00, image: "/images/prod_coffee.png",
    description: "Borosilicate glass server, ceramic cone, and 100 unbleached filters. The third-wave coffee ritual, distilled.",
    stock: 56 },
  { id: "p_009", name: "Halcyon Floor Lamp", brand: "Hearthworks", category_id: "cat_home",
    price: 240.00, image: "/images/prod_lamp.png",
    description: "Hand-blown opal glass diffuser on a brushed-brass column. Warm-dimming LED from 2200K to 3000K.",
    stock: 9 },
  { id: "p_010", name: "Modular Lounge Sofa", brand: "Atelier Nord", category_id: "cat_home",
    price: 1899.00, image: "/images/prod_sofa.png",
    description: "Reconfigurable five-piece system in boucle wool. Kiln-dried hardwood frame, eight-way hand-tied springs, and a lifetime structural warranty.",
    stock: 4 },
  // Books
  { id: "p_011", name: "The Cartographers' Field Guide", brand: "Folio Press", category_id: "cat_books",
    price: 32.00, image: "/images/prod_book1.png",
    description: "A literary atlas of imaginary places, with foldout maps and silver-foil endpapers. A National Book Critics Circle finalist.",
    stock: 78 },
  { id: "p_012", name: "Quiet Architectures", brand: "Folio Press", category_id: "cat_books",
    price: 45.00, image: "/images/prod_book2.png",
    description: "A photographic survey of brutalist libraries across Europe. Smyth-sewn binding, 312 plates, with an essay by Juhani Pallasmaa.",
    stock: 22 },
  // Beauty
  { id: "p_013", name: "Vetiver & Bergamot Eau de Parfum", brand: "Ondine", category_id: "cat_beauty",
    price: 125.00, image: "/images/prod_perfume.png",
    description: "Top notes of Calabrian bergamot give way to a heart of Haitian vetiver and a dry-down of warm tonka bean. Cruelty-free, made in Grasse.",
    stock: 33 },
  { id: "p_014", name: "Renewal Night Serum", brand: "Ondine", category_id: "cat_beauty",
    price: 88.00, image: "/images/prod_serum.png",
    description: "Time-release retinaldehyde with niacinamide and bakuchiol. Dermatologist-formulated for visible results in 28 nights.",
    stock: 17 },
  // Sports
  { id: "p_015", name: "Trailhead 45L Backpack", brand: "Kestrel", category_id: "cat_sports",
    price: 215.00, image: "/images/prod_backpack.png",
    description: "Recycled ripstop nylon, custom-molded hipbelt, integrated rain cover. Tested above 14,000 ft in the Cordillera Blanca.",
    stock: 19 },
  { id: "p_016", name: "Ascent Climbing Rope 60m", brand: "Kestrel", category_id: "cat_sports",
    price: 189.00, image: "/images/prod_rope.png",
    description: "9.5mm dynamic, dry-treated single rope. UIAA-certified for 8 falls. The redpoint workhorse of the sport-climbing world.",
    stock: 11 },
];

async function seedIfNeeded() {}

// ============================================================
// SERVICE LAYER — business logic & integrity rules
// ============================================================

const Auth = {
  async signup(data) {
    const res = await fetch(import.meta.env.VITE_API_URL + "/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || "Signup failed");
    return (await res.json()).user;
  },
  async login(data) {
    const res = await fetch(import.meta.env.VITE_API_URL + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.identifier, password: data.password }) });
    if (!res.ok) throw new Error((await res.json()).error || "Login failed");
    return (await res.json()).user;
  },
  async logout() {
    await fetch(import.meta.env.VITE_API_URL + "/api/auth/logout", { method: "POST" });
  },
  async current() {
    const res = await fetch(import.meta.env.VITE_API_URL + "/api/auth/current");
    if (!res.ok) return null;
    return (await res.json()).user;
  },
  async updateProfile(userId, patch) {
    throw new Error("Update profile not implemented in basic API");
  },
  async changePassword(userId, oldPw, newPw) {
    throw new Error("Change password not implemented in basic API");
  }
};

const Cart = {
  async get(userId) {
    const res = await fetch(import.meta.env.VITE_API_URL + "/api/cart");
    if (!res.ok) return { items: [] };
    return { items: await res.json() };
  },
  async addItem(userId, productId, qty = 1) {
    for(let i=0; i<qty; i++) {
        const res = await fetch(import.meta.env.VITE_API_URL + "/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: productId }) });
        if (!res.ok) throw new Error((await res.json()).error || "Failed to add to cart");
    }
    return await Cart.get(userId);
  },
  async setQuantity(userId, productId, qty) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/${productId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity: qty }) });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to update cart");
    return await Cart.get(userId);
  },
  async remove(userId, productId) {
    await fetch(`${import.meta.env.VITE_API_URL}/api/cart/${productId}`, { method: "DELETE" });
    return await Cart.get(userId);
  },
  async clear(userId) {
    await fetch(import.meta.env.VITE_API_URL + "/api/cart/clear", { method: "POST" });
  }
};

const Orders = {
  async place(userId, { shipping, paymentMethod }) {
    const res = await fetch(import.meta.env.VITE_API_URL + "/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shipping, paymentMethod }) });
    if (!res.ok) throw new Error((await res.json()).error || "Failed to place order");
    const order = await res.json();
    return { order, items: order.items, payment: order.payment };
  },
  async listForUser(userId) {
    const res = await fetch(import.meta.env.VITE_API_URL + "/api/orders");
    if (!res.ok) return [];
    return await res.json();
  },
  async getById(orderId) {
    const orders = await Orders.listForUser(null);
    return orders.find(o => o.id === orderId) || null;
  },
  async updateStatus(orderId, newStatus) {
    // Not implemented
  }
};

const Reviews = {
  async listForProduct(productId) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews?product_id=${productId}`);
    if (!res.ok) return [];
    return await res.json();
  },
  async listForUser(userId) {
    return [];
  },
  async upsert(userId, userName, productId, rating, comment) {
    if (rating < 1 || rating > 5) throw new Error("Rating must be 1–5.");
    if (!comment?.trim()) throw new Error("Please add a comment.");
    await fetch(import.meta.env.VITE_API_URL + "/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: productId, rating, comment: comment.trim() }) });
  },
  async delete(userId, productId) {
    // Not implemented
  }
};

const STATUS_LABELS = {
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment failed"
};

// ============================================================
// ICON RESOLVER for products/categories
// ============================================================
const ICONS = {
  Cpu, Shirt, BookOpen, Sparkle, Dumbbell, Headphones, Camera, Watch,
  Coffee, Lamp, Sofa, Laptop, Smartphone, Gift, Package
};
const Ico = ({ name, ...p }) => {
  const C = ICONS[name] || Package;
  return <C {...p} />;
};

// ============================================================
// APP ROOT
// ============================================================

export default function App() {
  const [route, setRoute] = useState({ name: "home", params: {} });
  const [pendingRoute, setPendingRoute] = useState(null);
  const [transitionTrigger, setTransitionTrigger] = useState(0);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState({}); // product_id -> stock
  const [ratings, setRatings] = useState({}); // product_id -> {avg, count}
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const navigate = useCallback((name, params = {}) => {
    const newRoute = { name, params };
    setPendingRoute(newRoute);
    setTransitionTrigger(prev => prev + 1);
  }, []);

  // Initialize Lenis smooth scrolling with low sensitivity
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 0.6, // Lowers scroll sensitivity
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    window.history.replaceState(route, "", "");
    const handlePopState = (e) => {
      if (e.state && e.state.name) {
        setRoute(e.state);
      } else {
        setRoute({ name: "home", params: {} });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [catsRes, prodsRes] = await Promise.all([fetch(import.meta.env.VITE_API_URL + "/api/categories"), fetch(import.meta.env.VITE_API_URL + "/api/products")]);
      const cats = await catsRes.json();
      const prods = await prodsRes.json();
      setCategories(cats);
      setProducts(prods);
      
      const inv = {};
      const rat = {};
      for (const p of prods) {
        inv[p.id] = p.stock;
        rat[p.id] = { avg: p.rating, count: p.reviewsCount };
      }
      setInventory(inv);
      setRatings(rat);
    } catch(e) { console.error("refreshAll failed", e); }
  }, []);

  const refreshCart = useCallback(async (u = user) => {
    try {
      const c = await Cart.get(u ? u.id : null);
      setCartCount(c.items.reduce((s, i) => s + i.quantity, 0));
    } catch(e) { console.error("refreshCart failed", e); setCartCount(0); }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        await seedIfNeeded();
        const u = await Auth.current();
        setUser(u);
        await refreshAll();
        
        const c = await Cart.get(u ? u.id : null);
        setCartCount(c.items.reduce((s, i) => s + i.quantity, 0));
      } catch(e) { console.error("Init failed", e); }
      setLoading(false);
    })();
  }, []);

  const ctx = {
    user, setUser, navigate, route, products, categories, inventory, ratings,
    refreshAll, refreshCart, cartCount, showToast
  };

  if (loading) return <SplashScreen />;

  return (
    <div className="min-h-screen text-stone-900 selection:bg-orange-100 selection:text-orange-900" 
         style={{ fontFamily: "'Manrope', sans-serif" }}>
      <CreativeTransition 
        transitionTrigger={transitionTrigger} 
        onMidpoint={() => {
          if (pendingRoute) {
            setRoute(pendingRoute);
            window.history.pushState(pendingRoute, "", "");
            window.scrollTo({ top: 0, behavior: "auto" });
            setPendingRoute(null);
          }
        }} 
      />
      <CustomCursor />
      <FontInjector />
      <Navbar {...ctx} />
      <main className="pb-32">
        {route.name === "home" && <HomePage {...ctx} />}
        {route.name === "products" && <ProductsPage {...ctx} />}
        {route.name === "product" && <ProductDetailPage {...ctx} />}
        {route.name === "login" && <LoginPage {...ctx} />}
        {route.name === "signup" && <SignupPage {...ctx} />}
        {route.name === "cart" && <CartPage {...ctx} />}
        {route.name === "checkout" && <CheckoutPage {...ctx} />}
        {route.name === "order-success" && <OrderSuccessPage {...ctx} />}
        {route.name === "account" && <AccountPage {...ctx} />}
        {route.name === "admin" && <AdminPage {...ctx} />}
      </main>
      <Footer navigate={navigate} />
      {toast && <Toast {...toast} />}
    </div>
  );
}

const FontInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Manrope:wght@200..800&display=swap');
    
    :root {
      --font-display: 'Fraunces', serif;
      --font-body: 'Manrope', sans-serif;
    }

    .font-display { font-family: var(--font-display); font-optical-sizing: auto; }
    
    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes fadeUp { 
      from { opacity: 0; transform: translateY(20px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    .anim-fade-up { animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) both; }
    
    @keyframes pop { 
      0% { transform: scale(0.9) translateY(10px); opacity: 0; } 
      100% { transform: scale(1) translateY(0); opacity: 1; } 
    }
    .anim-pop { animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    
    @keyframes spin { to { transform: rotate(360deg); } }
    .anim-spin { animation: spin 1s linear infinite; }

    ::selection {
      background: #ffedd5;
      color: #9a3412;
    }
  `}</style>
);

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isHovering = false;
    let isActive = true;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseOver = (e) => {
      if (e.target.closest('button, a, input, select, [role="button"]')) {
        isHovering = true;
      } else {
        isHovering = false;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    const render = () => {
      if (!isActive) return;
      
      // Liquid interpolation
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (ringRef.current) {
        const scale = isHovering ? 1.5 : 1;
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale})`;

        if (isHovering) {
          ringRef.current.style.borderColor = 'rgba(255, 255, 255, 0.8)';
          ringRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else {
          ringRef.current.style.borderColor = 'rgba(255, 255, 255, 0.4)';
          ringRef.current.style.backgroundColor = 'transparent';
        }
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    return () => {
      isActive = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return (
    <>
      <div ref={ringRef}
           className="hidden md:block fixed top-0 left-0 w-10 h-10 -ml-5 -mt-5 rounded-full border-[1.5px] border-white/40 pointer-events-none z-[9999] transition-colors duration-300 mix-blend-difference"
           style={{ willChange: 'transform' }} />
      <div ref={dotRef}
           className="hidden md:block fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
           style={{ willChange: 'transform' }} />
    </>
  );
}

function Reveal({ children, delay = 0, direction = "up", className = "" }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  let transform = "translateY(50px) scale(0.95)";
  if (direction === "down") transform = "translateY(-50px) scale(0.95)";
  if (direction === "left") transform = "translateX(50px) scale(0.95)";
  if (direction === "right") transform = "translateX(-50px) scale(0.95)";

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translate(0) scale(1)" : transform,
    transition: "all 1.5s var(--snappy-fluid)",
    transitionDelay: `${delay}ms`,
    willChange: "opacity, transform"
  };

  return <div ref={ref} style={style} className={className}>{children}</div>;
}

function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <FontInjector />
      <div className="text-center">
        <div className="font-display text-5xl font-semibold text-stone-900">Meridian</div>
        <div className="mt-4 text-stone-500 text-sm tracking-widest uppercase">Loading marketplace</div>
      </div>
    </div>
  );
}

function Toast({ msg, type }) {
  const bg = type === "error" ? "bg-red-50 text-red-900 border-red-200" : "bg-stone-900 text-cream border-stone-900";
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 anim-pop">
      <div className={`px-5 py-3 rounded-full shadow-2xl border ${bg} text-sm font-medium flex items-center gap-2`}
           style={type !== "error" ? { background: "#1C1917", color: "#FAF6F0" } : {}}>
        {type === "error" ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        {msg}
      </div>
    </div>
  );
}

// ============================================================
// NAVBAR
// ============================================================

function Navbar({ user, setUser, navigate, route, categories, cartCount, refreshCart, showToast }) {
  const [search, setSearch] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate("products", { q: search.trim() });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10"
            style={{ background: "rgba(250, 246, 240, 0.7)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-20 flex items-center justify-between gap-8">
          <button onClick={() => navigate("home")} className="font-display text-2xl font-semibold tracking-tight shrink-0">
            Meridian<span className="text-orange-400">.</span>
          </button>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="flex items-center w-full bg-stone-200/50 border border-transparent rounded-full px-5 py-2.5 focus-within:bg-white focus-within:border-stone-200 transition-all duration-300">
              <Search className="w-4 h-4 text-stone-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Search the collection..."
                     className="flex-1 bg-transparent ml-3 text-sm outline-none placeholder-stone-400 font-medium" />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-1 mr-4 border-r border-stone-200 pr-4">
              <button onClick={() => navigate("products")} className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:text-stone-500 transition-colors">Shop</button>
              <div className="relative">
                <button onClick={() => setCatOpen(o => !o)} onBlur={() => setTimeout(() => setCatOpen(false), 150)}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:text-stone-500 transition-colors flex items-center gap-1">
                  Explore <ChevronDown className="w-3 h-3" />
                </button>
                {catOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 p-3 anim-fade-up overflow-hidden">
                    {categories.map(c => (
                      <button key={c.id} onMouseDown={() => { navigate("products", { cat: c.id }); setCatOpen(false); }}
                              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-stone-50 rounded-2xl text-sm text-left transition-colors group">
                        <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-100 text-stone-900 group-hover:scale-110 transition-transform">
                          <Ico name={c.icon} className="w-5 h-5" />
                        </span>
                        <span className="font-bold tracking-tight">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {user ? (
              <div className="flex items-center gap-3">
                <button onClick={() => navigate("cart")}
                        className="relative w-10 h-10 flex items-center justify-center hover:bg-stone-200/50 rounded-full transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 text-[9px] font-bold text-white bg-stone-900 rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </button>
                <div className="relative">
                  <button onClick={() => setUserOpen(o => !o)} onBlur={() => setTimeout(() => setUserOpen(false), 150)}
                          className="flex items-center gap-2 p-1 pl-3 rounded-full bg-stone-200/50 hover:bg-stone-200 transition-all">
                    <span className="text-xs font-bold uppercase tracking-widest">{user.full_name.split(' ')[0]}</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-900 text-white text-xs font-bold">
                      {user.full_name[0].toUpperCase()}
                    </div>
                  </button>
                  {userOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 p-3 anim-fade-up">
                      <div className="px-4 py-3 border-b border-stone-100 mb-2">
                        <div className="text-sm font-bold tracking-tight">{user.full_name}</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold truncate">{user.email}</div>
                      </div>
                      <NavItem icon={User} label="My Profile" onClick={() => { navigate("account", { tab: "profile" }); setUserOpen(false); }} />
                      <NavItem icon={ListOrdered} label="Orders" onClick={() => { navigate("account", { tab: "orders" }); setUserOpen(false); }} />
                      <NavItem icon={Settings} label="Admin" onClick={() => { navigate("admin"); setUserOpen(false); }} />
                      <div className="my-2 border-t border-stone-100" />
                      <NavItem icon={LogOut} label="Sign Out"
                               onClick={async () => { await Auth.logout(); setUser(null); refreshCart(null); setUserOpen(false); showToast("Signed out"); navigate("home"); }} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={() => navigate("login")} className="text-xs font-bold uppercase tracking-widest hover:text-stone-500 transition-colors">Login</button>
                <button onClick={() => navigate("signup")} className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-stone-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-stone-200">
                  Join
                </button>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 hover:bg-stone-200/50 rounded-full" onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {mobileOpen && <MobileMenu close={() => setMobileOpen(false)} user={user} setUser={setUser} navigate={navigate} categories={categories} refreshCart={refreshCart} showToast={showToast} cartCount={cartCount} />}
    </header>
  );
}

const NavItem = ({ icon: Icon, label, onClick }) => (
  <button onMouseDown={onClick} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-stone-50 rounded-xl text-sm text-left">
    <Icon className="w-4 h-4 text-stone-500" />{label}
  </button>
);

function MobileMenu({ close, user, setUser, navigate, categories, refreshCart, showToast, cartCount }) {
  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40" onClick={close}>
      <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-cream p-6 shadow-2xl" onClick={e => e.stopPropagation()}
           >
        <div className="flex items-center justify-between mb-6">
          <div className="font-display text-2xl font-semibold">Meridian<span className="text-orange-700">.</span></div>
          <button onClick={close}><X className="w-5 h-5" /></button>
        </div>
        {user ? (
          <div className="mb-4 p-3 bg-white rounded-2xl border border-cream">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: "#1C1917" }}>
                {user.full_name[0].toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm">{user.full_name}</div>
                <div className="text-xs text-stone-500 truncate">{user.email}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex flex-col gap-2">
            <button onClick={() => { navigate("login"); close(); }} className="w-full py-2.5 border border-stone-900 rounded-full text-sm font-medium">Log in</button>
            <button onClick={() => { navigate("signup"); close(); }} className="w-full py-2.5 bg-stone-900 text-cream rounded-full text-sm font-medium" style={{ color: "#FAF6F0" }}>Create account</button>
          </div>
        )}
        <div className="text-xs uppercase tracking-widest text-stone-500 mb-2">Shop</div>
        <button onClick={() => { navigate("products"); close(); }} className="w-full text-left py-2 text-sm font-medium">All products</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => { navigate("products", { cat: c.id }); close(); }}
                  className="w-full flex items-center gap-3 py-2 text-sm">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: c.tint, color: c.accent }}>
              <Ico name={c.icon} className="w-3.5 h-3.5" />
            </span>
            {c.name}
          </button>
        ))}
        {user && (
          <>
            <div className="text-xs uppercase tracking-widest text-stone-500 mb-2 mt-6">Account</div>
            <button onClick={() => { navigate("cart"); close(); }} className="w-full text-left py-2 text-sm font-medium flex items-center justify-between">
              Cart {cartCount > 0 && <span className="text-xs bg-orange-700 text-white rounded-full px-2 py-0.5">{cartCount}</span>}
            </button>
            <button onClick={() => { navigate("account", { tab: "orders" }); close(); }} className="w-full text-left py-2 text-sm font-medium">My orders</button>
            <button onClick={() => { navigate("account", { tab: "reviews" }); close(); }} className="w-full text-left py-2 text-sm font-medium">My reviews</button>
            <button onClick={() => { navigate("admin"); close(); }} className="w-full text-left py-2 text-sm font-medium">Admin panel</button>
            <button onClick={async () => { await Auth.logout(); setUser(null); refreshCart(null); close(); showToast("Signed out"); navigate("home"); }}
                    className="w-full text-left py-2 text-sm font-medium text-red-700 mt-2">Sign out</button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// REUSABLE — Product card, ratings, etc.
// ============================================================

function StarRating({ value, count, size = "sm" }) {
  const px = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${px}`}
              fill={i <= Math.round(value) ? "#F59E0B" : "transparent"}
              stroke={i <= Math.round(value) ? "#F59E0B" : "#D6D3D1"} strokeWidth={2} />
      ))}
      {count !== undefined && <span className="text-xs text-stone-500 ml-1">({count})</span>}
    </div>
  );
}

function ProductCard({ p, stock, rating, onAdd, onView }) {
  const outOfStock = stock === 0;
  return (
    <div className="group bg-white rounded-3xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-700">
      <button onClick={onView} className="block w-full relative overflow-hidden bg-stone-100">
        <div className="aspect-[4/5] w-full overflow-hidden">
          <img src={p.image} alt={p.name}
               className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        </div>
        {outOfStock && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md text-stone-900 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">
            Sold Out
          </div>
        )}
      </button>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">{p.brand}</div>
          <StarRating value={rating?.avg || 0} />
        </div>
        <button onClick={onView} className="block text-left w-full mb-4">
          <h3 className="font-display text-xl font-medium leading-tight hover:text-stone-500 transition-colors duration-300">{p.name}</h3>
        </button>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">${p.price.toFixed(2)}</div>
          <button onClick={onAdd} disabled={outOfStock}
                  className="rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 disabled:opacity-20 bg-stone-900 text-white hover:bg-stone-700 hover:scale-110 active:scale-95 shadow-lg shadow-stone-200"
                  aria-label="Add to cart">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HOME
// ============================================================

function HomePage({ products, categories, inventory, ratings, navigate, user, refreshCart, showToast }) {
  const featured = products.slice(0, 8);
  const trending = [...products].sort((a, b) => (ratings[b.id]?.count || 0) - (ratings[a.id]?.count || 0)).slice(0, 4);

  const handleAdd = async (p) => {
    try { await Cart.addItem(user?.id, p.id, 1); await refreshCart(); showToast(`${p.name} added to cart`); }
    catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* HERO */}
      <section className="mt-8 mb-24 relative overflow-hidden rounded-[2.5rem] h-[75vh] min-h-[600px] flex items-center">
        <img src="/images/ecommerce_hero.png" 
             className="absolute inset-0 w-full h-full object-cover" alt="Hero background" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/40 to-transparent" />
        
        <Reveal delay={100} direction="up" className="relative z-10 px-8 sm:px-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[1px] w-8 bg-orange-400" />
            <span className="text-xs uppercase tracking-[0.4em] text-orange-300 font-bold">Volume 01 / New Season</span>
          </div>
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-medium leading-[0.9] text-white mb-8">
            Elevate<br />Your Everyday<br /><em className="text-orange-300 italic serif">Essentials.</em>
          </h1>
          <p className="text-stone-200 text-lg mb-10 max-w-md leading-relaxed">
            A curated marketplace for the modern individual. Discover premium fashion, tech, and lifestyle collections designed for excellence.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate("products")}
                    className="px-8 py-4 bg-white text-stone-900 rounded-full text-sm font-bold hover:bg-stone-100 transition-all hover:scale-105 active:scale-95 shadow-xl">
              Shop Collection
            </button>
            <button onClick={() => navigate("products", { sort: "rating" })}
                    className="px-8 py-4 border border-white/30 backdrop-blur-md text-white rounded-full text-sm font-bold hover:bg-white/10 transition-all">
              Trending Now
            </button>
          </div>
        </Reveal>
      </section>

      {/* CATEGORIES GRID */}
      <section className="mb-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-stone-400 font-bold mb-3">Categories</div>
            <h2 className="font-display text-4xl sm:text-5xl font-medium">Explore by Department</h2>
          </div>
          <button onClick={() => navigate("products")} className="text-sm font-bold text-stone-900 hover:text-stone-500 transition-colors hidden sm:block">
            Browse All Departments →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 100} direction="up">
              <button onClick={() => navigate("products", { cat: c.id })}
                      className="group w-full relative h-48 rounded-3xl overflow-hidden bg-stone-100 flex items-end p-6 hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-stone-200 group-hover:bg-stone-300 transition-colors duration-500" />
                <div className="relative z-10 w-full text-left">
                  <div className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center mb-4 text-stone-900 group-hover:scale-110 group-hover:-rotate-12 transition-all">
                    <Ico name={c.icon} className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm tracking-tight">{c.name}</div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mb-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-stone-400 font-bold mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Selected</div>
            <h2 className="font-display text-4xl sm:text-5xl font-medium">Featured Pieces</h2>
          </div>
          <button onClick={() => navigate("products")} className="text-sm font-bold hover:text-stone-500 flex items-center gap-2 transition-colors">
            View Full Collection <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 150} direction="up">
              <ProductCard p={p} stock={inventory[p.id]} rating={ratings[p.id]}
                                  onAdd={() => handleAdd(p)}
                                  onView={() => navigate("product", { id: p.id })} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROMISE STRIP */}
      <section className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Truck, title: "Free shipping over $100", sub: "Delivered in 3–5 business days" },
          { icon: ShieldCheck, title: "Authentic guarantee", sub: "Every item verified before dispatch" },
          { icon: Award, title: "30-day returns", sub: "No questions, no restocking fees" }
        ].map((s, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-cream flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-cream flex items-center justify-center flex-shrink-0" style={{ color: "#FAF6F0" }}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">{s.title}</div>
              <div className="text-sm text-stone-500">{s.sub}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// ============================================================
// PRODUCT LISTING
// ============================================================

function ProductsPage({ products, categories, inventory, ratings, navigate, route, user, refreshCart, showToast }) {
  const [filters, setFilters] = useState({
    cat: route.params.cat || "",
    brand: "",
    inStock: false,
    min: "", max: "",
    sort: route.params.sort || "default",
    q: route.params.q || ""
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFilters(f => ({ ...f, cat: route.params.cat || "", q: route.params.q || "", sort: route.params.sort || f.sort }));
  }, [route.params.cat, route.params.q, route.params.sort]);

  const brands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products]);

  const filtered = useMemo(() => {
    let r = [...products];
    if (filters.cat) r = r.filter(p => p.category_id === filters.cat);
    if (filters.brand) r = r.filter(p => p.brand === filters.brand);
    if (filters.inStock) r = r.filter(p => (inventory[p.id] || 0) > 0);
    if (filters.min) r = r.filter(p => p.price >= parseFloat(filters.min));
    if (filters.max) r = r.filter(p => p.price <= parseFloat(filters.max));
    if (filters.q) {
      const q = filters.q.toLowerCase();
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filters.sort === "price-asc") r.sort((a, b) => a.price - b.price);
    else if (filters.sort === "price-desc") r.sort((a, b) => b.price - a.price);
    else if (filters.sort === "newest") r.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (filters.sort === "rating") r.sort((a, b) => (ratings[b.id]?.avg || 0) - (ratings[a.id]?.avg || 0));
    return r;
  }, [products, filters, inventory, ratings]);

  const activeCat = categories.find(c => c.id === filters.cat);

  const handleAdd = async (p) => {
    try { await Cart.addItem(user?.id, p.id, 1); await refreshCart(); showToast(`${p.name} added to bag`); }
    catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
      <div className="mb-16">
        <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-4 flex items-center gap-2">
          <button onClick={() => navigate("home")} className="hover:text-stone-900 transition-colors">Home</button> 
          <span className="text-stone-300">/</span>
          <span className="text-stone-900">Collection</span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-medium">{activeCat ? activeCat.name : "The Collection"}</h1>
        {filters.q && <p className="text-lg text-stone-400 mt-4 font-medium italic">Showing results for “{filters.q}”</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* SIDEBAR FILTERS */}
        <aside className={`${showFilters ? "fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm" : ""} lg:static lg:block`} onClick={() => setShowFilters(false)}>
          <div className={`${showFilters ? "absolute right-0 top-0 h-full w-80 p-8 shadow-2xl anim-fade-up" : ""} lg:static lg:w-64 lg:shrink-0`}
                onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <span className="font-display text-2xl font-medium">Filters</span>
              <button onClick={() => setShowFilters(false)}><X className="w-6 h-6" /></button>
            </div>
            <FilterPanel filters={filters} setFilters={setFilters} categories={categories} brands={brands} />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-10 gap-4 flex-wrap pb-6 border-b border-stone-100">
            <button onClick={() => setShowFilters(true)} className="lg:hidden px-6 py-3 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-3 h-3" /> Filters
            </button>
            <div className="text-xs font-bold uppercase tracking-widest text-stone-400">{filtered.length} Objects found</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hidden sm:block">Sort by:</span>
              <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                      className="px-4 py-2 bg-transparent text-xs font-bold uppercase tracking-widest outline-none cursor-pointer hover:text-stone-400 transition-colors">
                <option value="default">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Package className="w-8 h-8 text-stone-300" />
              </div>
              <h2 className="font-display text-3xl font-medium mb-4 text-stone-900">No matches found</h2>
              <p className="text-stone-500 mb-10 max-w-sm mx-auto leading-relaxed">Try adjusting your filters or refining your search term.</p>
              <button onClick={() => setFilters({ cat: "", brand: "", inStock: false, min: "", max: "", sort: "default", q: "" })}
                      className="px-8 py-4 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-[0.2em]">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-12">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 100} direction="up">
                  <ProductCard p={p} stock={inventory[p.id]} rating={ratings[p.id]}
                               onAdd={() => handleAdd(p)} onView={() => navigate("product", { id: p.id })} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ filters, setFilters, categories, brands }) {
  return (
    <div className="space-y-12">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-6">Department</div>
        <div className="space-y-2 relative">
          <button onClick={() => setFilters(f => ({ ...f, cat: "" }))}
                  className={`group flex items-center justify-between w-full px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-500 overflow-hidden relative ${
                    !filters.cat 
                      ? "text-stone-900 bg-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/80 backdrop-blur-md translate-x-2" 
                      : "text-stone-400 hover:bg-stone-100/50 hover:text-stone-700 hover:translate-x-1 border border-transparent"
                  }`}>
            <span className="relative z-10 flex items-center gap-3">
              <span className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${!filters.cat ? "bg-orange-400 scale-100" : "bg-stone-300 scale-0 group-hover:scale-100"}`}></span>
              All Collections
            </span>
          </button>
          
          {categories.map(c => (
            <button key={c.id} onClick={() => setFilters(f => ({ ...f, cat: c.id }))}
                    className={`group flex items-center justify-between w-full px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-500 overflow-hidden relative ${
                      filters.cat === c.id 
                        ? "text-stone-900 bg-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white/80 backdrop-blur-md translate-x-2" 
                        : "text-stone-400 hover:bg-stone-100/50 hover:text-stone-700 hover:translate-x-1 border border-transparent"
                    }`}>
              <span className="relative z-10 flex items-center gap-3">
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${filters.cat === c.id ? "bg-orange-400 scale-100" : "bg-stone-300 scale-0 group-hover:scale-100"}`}></span>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-6">Price Range</div>
        <div className="flex gap-4">
          <input type="number" placeholder="Min" value={filters.min} onChange={e => setFilters(f => ({ ...f, min: e.target.value }))}
                 className="w-full px-4 py-3 bg-stone-100 border border-transparent rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-stone-200 transition-all" />
          <input type="number" placeholder="Max" value={filters.max} onChange={e => setFilters(f => ({ ...f, max: e.target.value }))}
                 className="w-full px-4 py-3 bg-stone-100 border border-transparent rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-stone-200 transition-all" />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${filters.inStock ? "bg-stone-900 border-stone-900" : "border-stone-200 group-hover:border-stone-400"}`}>
            {filters.inStock && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
          </div>
          <input type="checkbox" checked={filters.inStock} onChange={e => setFilters(f => ({ ...f, inStock: e.target.checked }))}
                 className="hidden" />
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500 group-hover:text-stone-900 transition-colors">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}

// ============================================================
// PRODUCT DETAILS
// ============================================================

function ProductDetailPage({ products, categories, inventory, ratings, navigate, route, user, refreshAll, refreshCart, showToast }) {
  const p = products.find(x => x.id === route.params.id);
  const [qty, setQty] = useState(1);
  const [reviewList, setReviewList] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!p) return;
    (async () => {
      const list = await Reviews.listForProduct(p.id);
      setReviewList(list);
      if (user) {
        const mine = list.find(r => r.user_id === user.id);
        setMyReview(mine);
        if (mine) setReviewForm({ rating: mine.rating, comment: mine.comment });
      }
    })();
  }, [p?.id, user?.id]);

  if (!p) return <div className="max-w-7xl mx-auto px-6 py-20 text-center">Product not found.</div>;

  const cat = categories.find(c => c.id === p.category_id);
  const stock = inventory[p.id] || 0;
  const rating = ratings[p.id];
  const related = products.filter(x => x.category_id === p.category_id && x.id !== p.id).slice(0, 4);

  const handleAdd = async (then) => {
    try {
      await Cart.addItem(user?.id, p.id, qty);
      await refreshCart();
      showToast(`Added ${qty} × ${p.name} to cart`);
      if (then === "buy") navigate("cart");
    } catch (e) { showToast(e.message, "error"); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate("login");
    try {
      await Reviews.upsert(user.id, user.full_name, p.id, reviewForm.rating, reviewForm.comment);
      await refreshAll();
      const list = await Reviews.listForProduct(p.id);
      setReviewList(list);
      setMyReview(list.find(r => r.user_id === user.id));
      setEditing(false);
      showToast("Review saved");
    } catch (err) { showToast(err.message, "error"); }
  };

  const deleteReview = async () => {
    if (!user) return;
    await Reviews.delete(user.id, p.id);
    await refreshAll();
    setReviewList(await Reviews.listForProduct(p.id));
    setMyReview(null);
    setReviewForm({ rating: 5, comment: "" });
    showToast("Review deleted");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
      <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-12 flex items-center gap-2">
        <button onClick={() => navigate("home")} className="hover:text-stone-900 transition-colors">Home</button> 
        <span className="text-stone-300">/</span>
        <button onClick={() => navigate("products", { cat: p.category_id })} className="hover:text-stone-900 transition-colors">{cat?.name}</button> 
        <span className="text-stone-300">/</span>
        <span className="text-stone-900">{p.name}</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-16 mb-32">
        <div className="lg:col-span-7">
          <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-stone-100 shadow-2xl">
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="text-xs uppercase tracking-[0.3em] text-orange-400 font-bold mb-4">{p.brand}</div>
          <h1 className="font-display text-5xl sm:text-6xl font-medium leading-[1.1] mb-6">{p.name}</h1>
          
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-stone-100">
            <StarRating value={rating?.avg || 0} size="md" />
            <span className="text-sm text-stone-400 font-medium">{rating?.count || 0} Reviews</span>
            <span className="h-4 w-[1px] bg-stone-200" />
            <span className="text-sm text-stone-400 font-medium uppercase tracking-widest">{cat?.name}</span>
          </div>

          <div className="text-4xl font-semibold tracking-tight mb-8">${p.price.toFixed(2)}</div>
          
          <p className="text-stone-500 leading-relaxed text-lg mb-10">{p.description}</p>

          <div className="space-y-8 mb-12">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-4">Quantity</div>
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-stone-100 rounded-full p-1 border border-stone-200">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all disabled:opacity-20" disabled={qty <= 1}>
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all disabled:opacity-20" disabled={qty >= stock}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  {stock > 0 ? `${stock} available` : 'Out of stock'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => handleAdd()} disabled={stock === 0}
                    className="flex-1 py-5 bg-stone-900 text-white rounded-full font-bold text-sm hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-stone-200 disabled:opacity-20">
              Add to Bag
            </button>
            <button onClick={() => handleAdd("buy")} disabled={stock === 0}
                    className="flex-1 py-5 bg-white border-2 border-stone-900 text-stone-900 rounded-full font-bold text-sm hover:bg-stone-50 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <section className="mb-16">
        <h2 className="font-display text-3xl font-medium mb-8">Reviews & ratings</h2>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border border-cream p-6 h-fit">
            <div className="text-6xl font-display font-semibold">{(rating?.avg || 0).toFixed(1)}</div>
            <StarRating value={rating?.avg || 0} size="md" />
            <div className="text-sm text-stone-500 mt-2">{rating?.count || 0} review{(rating?.count || 0) === 1 ? "" : "s"}</div>

            <div className="border-t border-cream mt-6 pt-6">
              {!user ? (
                <div>
                  <div className="text-sm mb-3">Sign in to write a review.</div>
                  <button onClick={() => navigate("login")} className="w-full py-2.5 bg-stone-900 rounded-full text-sm font-semibold" style={{ color: "#FAF6F0" }}>Log in</button>
                </div>
              ) : (myReview && !editing) ? (
                <div>
                  <div className="text-sm font-semibold mb-2">Your review</div>
                  <StarRating value={myReview.rating} />
                  <p className="text-sm text-stone-700 mt-2 mb-3">{myReview.comment}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(true)} className="flex-1 py-2 border border-stone-300 rounded-full text-xs font-semibold">Edit</button>
                    <button onClick={deleteReview} className="flex-1 py-2 border border-red-300 text-red-700 rounded-full text-xs font-semibold">Delete</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitReview} className="space-y-3">
                  <div className="text-sm font-semibold">{myReview ? "Edit your review" : "Write a review"}</div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <button type="button" key={i} onClick={() => setReviewForm(f => ({ ...f, rating: i }))}>
                        <Star className="w-7 h-7" fill={i <= reviewForm.rating ? "#F59E0B" : "transparent"}
                              stroke={i <= reviewForm.rating ? "#F59E0B" : "#D6D3D1"} strokeWidth={2} />
                      </button>
                    ))}
                  </div>
                  <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                            placeholder="Share your experience..." rows={4}
                            className="w-full px-3 py-2 bg-cream border border-cream rounded-xl text-sm outline-none focus:border-stone-400"
                             />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2.5 bg-stone-900 rounded-full text-sm font-semibold" style={{ color: "#FAF6F0" }}>
                      {myReview ? "Update review" : "Submit review"}
                    </button>
                    {editing && <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 border border-stone-300 rounded-full text-sm font-semibold">Cancel</button>}
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {reviewList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cream p-12 text-center">
                <MessageSquare className="w-10 h-10 mx-auto text-stone-300 mb-3" />
                <div className="font-medium">No reviews yet</div>
                <div className="text-sm text-stone-500">Be the first to share your thoughts.</div>
              </div>
            ) : reviewList.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-cream p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-stone-900 text-cream flex items-center justify-center text-sm font-semibold" style={{ color: "#FAF6F0" }}>
                      {r.user_name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{r.user_name}</div>
                      <div className="text-xs text-stone-500">{new Date(r.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</div>
                    </div>
                  </div>
                  <StarRating value={r.rating} />
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mt-3">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-3xl font-medium mb-8">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map(rp => (
              <ProductCard key={rp.id} p={rp} stock={inventory[rp.id]} rating={ratings[rp.id]}
                           onAdd={() => handleAdd()} onView={() => navigate("product", { id: rp.id })} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ============================================================
// AUTH PAGES
// ============================================================

function AuthShell({ children, title, subtitle }) {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 pt-12 pb-20 anim-fade-up">
      <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 via-orange-200 to-amber-100"></div>
        <h1 className="font-display text-4xl font-medium mb-3 tracking-tight">{title}</h1>
        <p className="text-stone-500 text-sm mb-10 font-medium">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, error, children }) => (
  <div className="group">
    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-2.5 group-focus-within:text-orange-500 transition-colors">{label}</label>
    {children}
    {error && <div className="text-xs text-red-600 mt-2 font-bold">{error}</div>}
  </div>
);

const authInputClass = "w-full px-5 py-4 bg-stone-50/50 border border-stone-200/50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-300 transition-all font-medium text-stone-900 shadow-sm placeholder:text-stone-400";

function SignupPage({ setUser, navigate, refreshCart, showToast }) {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim() || form.full_name.length < 2) e.full_name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!/^[+\d][\d\s\-()]{6,}$/.test(form.phone)) e.phone = "Enter a valid phone number.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(form.password) || !/\d/.test(form.password)) e.password = "Include an uppercase letter and a number.";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const u = await Auth.signup(form);
      setUser(u);
      await refreshCart(u);
      showToast("Welcome to Meridian");
      navigate("home");
    } catch (err) { setErrs({ form: err.message }); }
    setBusy(false);
  };

  return (
    <AuthShell title="Create account" subtitle="Join Meridian to shop, track orders, and review products.">
      <form onSubmit={submit} className="space-y-6">
        <Field label="Full name" error={errs.full_name}>
          <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                 className={authInputClass} placeholder="Jane Doe" />
        </Field>
        <Field label="Email" error={errs.email}>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                 className={authInputClass} placeholder="jane@example.com" />
        </Field>
        <Field label="Phone" error={errs.phone}>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                 placeholder="+1 555 123 4567"
                 className={authInputClass} />
        </Field>
        <Field label="Password" error={errs.password}>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={form.password}
                   onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                   className={`${authInputClass} pr-12`} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors">
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </Field>
        <Field label="Confirm password" error={errs.confirm}>
          <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                 className={authInputClass} placeholder="••••••••" />
        </Field>
        {errs.form && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4 font-medium shadow-sm">{errs.form}</div>}
        
        <div className="pt-2">
          <button disabled={busy} type="submit" className="w-full py-4 bg-stone-900 rounded-2xl font-bold text-sm text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0">
            {busy ? "Creating account..." : "Create account"}
          </button>
        </div>
        
        <div className="text-center text-sm text-stone-500 font-medium pt-4 border-t border-stone-100">
          Already have an account? <button type="button" onClick={() => navigate("login")} className="text-stone-900 font-bold hover:text-orange-500 transition-colors">Log in</button>
        </div>
      </form>
    </AuthShell>
  );
}

function LoginPage({ setUser, navigate, refreshCart, showToast }) {
  const [form, setForm] = useState({ identifier: "", password: "", remember: true });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const u = await Auth.login(form);
      setUser(u);
      await refreshCart(u);
      showToast(`Welcome back, ${u.full_name.split(" ")[0]}`);
      navigate("home");
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue shopping.">
      <form onSubmit={submit} className="space-y-6">
        <Field label="Email or phone">
          <input value={form.identifier} onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                 className={authInputClass} placeholder="jane@example.com" />
        </Field>
        <Field label="Password">
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={form.password}
                   onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                   className={`${authInputClass} pr-12`} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors">
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </Field>
        
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${form.remember ? "bg-stone-900 border-stone-900" : "border-stone-300 group-hover:border-stone-500 bg-white"}`}>
              {form.remember && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
            </div>
            <input type="checkbox" checked={form.remember} onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                   className="hidden" />
            <span className="text-sm font-medium text-stone-600 group-hover:text-stone-900 transition-colors">Remember me</span>
          </label>
          <button type="button" className="text-sm font-bold text-stone-400 hover:text-stone-900 transition-colors" onClick={() => showToast("Demo: password reset not implemented")}>Forgot password?</button>
        </div>
        
        {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4 font-medium shadow-sm">{err}</div>}
        
        <div className="pt-2">
          <button disabled={busy} type="submit" className="w-full py-4 bg-stone-900 rounded-2xl font-bold text-sm text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0">
            {busy ? "Logging in..." : "Log in"}
          </button>
        </div>
        
        <div className="text-center text-sm text-stone-500 font-medium pt-4 border-t border-stone-100">
          New to Meridian? <button type="button" onClick={() => navigate("signup")} className="text-stone-900 font-bold hover:text-orange-500 transition-colors">Create account</button>
        </div>
      </form>
    </AuthShell>
  );
}

// ============================================================
// CART
// ============================================================

function CartPage({ user, navigate, products, inventory, refreshCart, refreshAll, showToast }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setCart(await Cart.get(user?.id));
    setLoading(false);
  };
  useEffect(() => { reload(); }, [user?.id]);

  if (loading) return <div className="text-center py-32"><Loader2 className="w-8 h-8 anim-spin mx-auto text-stone-300" /></div>;

  const enriched = cart.items.map(i => {
    const p = products.find(x => x.id === i.product_id);
    return { ...i, product: p, subtotal: (p?.price || 0) * i.quantity, stock: inventory[i.product_id] || 0 };
  }).filter(i => i.product);

  const subtotal = enriched.reduce((s, i) => s + i.subtotal, 0);
  const shipping = subtotal > 100 ? 0 : (subtotal > 0 ? 9.95 : 0);
  const total = subtotal + shipping;

  const updateQty = async (productId, qty) => {
    try { await Cart.setQuantity(user?.id, productId, qty); await reload(); await refreshCart(); }
    catch (e) { showToast(e.message, "error"); }
  };
  const remove = async (productId) => {
    await Cart.remove(user?.id, productId);
    await reload(); await refreshCart();
    showToast("Removed from bag");
  };

  if (enriched.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 pt-32 text-center">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingCart className="w-10 h-10 text-stone-300" />
        </div>
        <h1 className="font-display text-4xl font-medium mb-4">Your Bag is Empty</h1>
        <p className="text-stone-500 mb-10 leading-relaxed">Discover pieces worth keeping in our collection.</p>
        <button onClick={() => navigate("products")} className="w-full py-4 bg-stone-900 text-white rounded-full font-bold text-sm hover:bg-stone-800 transition-all">Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
      <div className="flex items-baseline gap-4 mb-16">
        <h1 className="font-display text-5xl font-medium">Your Bag</h1>
        <span className="text-lg text-stone-400 font-medium">({enriched.length} items)</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          {enriched.map(i => (
            <div key={i.product_id} className="flex gap-8 pb-12 border-b border-stone-100 last:border-0">
              <button onClick={() => navigate("product", { id: i.product.id })}
                      className="w-32 h-40 sm:w-48 sm:h-60 rounded-[2rem] overflow-hidden bg-stone-100 flex-shrink-0 group shadow-lg">
                <img src={i.product.image} alt={i.product.name} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </button>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-2">{i.product.brand}</div>
                    <button onClick={() => navigate("product", { id: i.product.id })} className="text-left">
                      <h3 className="font-display text-2xl font-medium leading-tight hover:text-stone-500 transition-colors">{i.product.name}</h3>
                    </button>
                  </div>
                  <button onClick={() => remove(i.product_id)} className="text-stone-300 hover:text-red-500 transition-colors p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-auto flex items-end justify-between">
                  <div className="space-y-4">
                    <div className="text-sm font-bold tracking-tight text-stone-400">${i.product.price.toFixed(2)} each</div>
                    <div className="flex items-center bg-stone-100 rounded-full p-1 border border-stone-200 w-fit">
                      <button onClick={() => updateQty(i.product_id, i.quantity - 1)} disabled={i.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-all disabled:opacity-20"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm font-bold">{i.quantity}</span>
                      <button onClick={() => updateQty(i.product_id, i.quantity + 1)} disabled={i.quantity >= i.stock}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-all disabled:opacity-20"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight">${i.subtotal.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32 h-fit bg-stone-50 rounded-[2.5rem] p-8 sm:p-10 border border-stone-100 shadow-sm">
            <h3 className="font-display text-2xl font-medium mb-8">Summary</h3>
            <div className="space-y-4 text-sm font-bold uppercase tracking-widest text-stone-400 mb-8 pb-8 border-b border-stone-200">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-stone-900">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-stone-900">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
            </div>
            <div className="flex justify-between text-3xl font-bold tracking-tight mb-10">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            <button onClick={() => navigate("checkout")} className="w-full py-5 bg-stone-900 text-white rounded-full font-bold text-sm hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-stone-200">
              Proceed to Checkout
            </button>
            <p className="text-[10px] text-center mt-6 text-stone-400 font-bold uppercase tracking-[0.2em]">Complementary Carbon Neutral Shipping</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHECKOUT
// ============================================================

function CheckoutPage({ user, products, inventory, navigate, refreshAll, refreshCart, showToast }) {
  const [cart, setCart] = useState({ items: [] });
  const [shipping, setShipping] = useState({
    full_name: user?.full_name || "", address1: "", address2: "", city: "", state: "", zip: "", country: "United States", phone: user?.phone || ""
  });
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => setCart(await Cart.get(user.id)))();
  }, [user?.id]);

  if (!user) { navigate("login"); return null; }

  const enriched = cart.items.map(i => {
    const p = products.find(x => x.id === i.product_id);
    return { ...i, product: p, subtotal: (p?.price || 0) * i.quantity };
  }).filter(i => i.product);
  const subtotal = enriched.reduce((s, i) => s + i.subtotal, 0);
  const ship = subtotal > 100 ? 0 : 9.95;
  const total = subtotal + ship;

  const place = async (e) => {
    e.preventDefault();
    if (!shipping.address1 || !shipping.city || !shipping.zip) { showToast("Please complete shipping details", "error"); return; }
    if (method === "card" && (!card.number || !card.name)) { showToast("Please enter card details", "error"); return; }
    setBusy(true);
    try {
      const { order } = await Orders.place(user.id, { shipping, paymentMethod: method });
      await refreshAll();
      await refreshCart();
      navigate("order-success", { id: order.id });
    } catch (e) { showToast(e.message, "error"); }
    setBusy(false);
  };

  if (enriched.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 pt-20 text-center">
        <h1 className="font-display text-3xl font-medium mb-3">Nothing to check out</h1>
        <p className="text-stone-500 mb-6">Add items to your cart first.</p>
        <button onClick={() => navigate("products")} className="px-6 py-3 bg-stone-900 rounded-full font-semibold text-sm" style={{ color: "#FAF6F0" }}>Continue shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
      <h1 className="font-display text-4xl font-medium mb-8">Checkout</h1>
      <form onSubmit={place} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* SHIPPING */}
          <div className="bg-white rounded-2xl border border-cream p-6">
            <h2 className="font-display text-xl font-medium mb-5 flex items-center gap-2"><Truck className="w-5 h-5 text-stone-400" /> Shipping information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name">
                <input value={shipping.full_name} onChange={e => setShipping(s => ({ ...s, full_name: e.target.value }))} required
                       className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  />
              </Field>
              <Field label="Phone">
                <input value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))} required
                       className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  />
              </Field>
              <div className="sm:col-span-2"><Field label="Address line 1">
                <input value={shipping.address1} onChange={e => setShipping(s => ({ ...s, address1: e.target.value }))} required
                       className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  />
              </Field></div>
              <div className="sm:col-span-2"><Field label="Address line 2 (optional)">
                <input value={shipping.address2} onChange={e => setShipping(s => ({ ...s, address2: e.target.value }))}
                       className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  />
              </Field></div>
              <Field label="City">
                <input value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} required
                       className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  />
              </Field>
              <Field label="State / Region">
                <input value={shipping.state} onChange={e => setShipping(s => ({ ...s, state: e.target.value }))} required
                       className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  />
              </Field>
              <Field label="ZIP / Postal code">
                <input value={shipping.zip} onChange={e => setShipping(s => ({ ...s, zip: e.target.value }))} required
                       className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  />
              </Field>
              <Field label="Country">
                <input value={shipping.country} onChange={e => setShipping(s => ({ ...s, country: e.target.value }))} required
                       className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  />
              </Field>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="bg-white rounded-2xl border border-cream p-6">
            <h2 className="font-display text-xl font-medium mb-5 flex items-center gap-2"><CreditCard className="w-5 h-5 text-stone-400" /> Payment method</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { id: "card", label: "Credit card", icon: CreditCard },
                { id: "debit", label: "Debit card", icon: CreditCard },
                { id: "upi", label: "UPI", icon: Wallet },
                { id: "cod", label: "Cash on delivery", icon: Truck },
              ].map(m => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                        className={`p-4 rounded-xl border-2 transition text-left ${method === m.id ? "border-stone-900 bg-stone-50" : "border-cream hover:border-stone-300"}`}>
                  <m.icon className="w-5 h-5 mb-2 text-stone-700" />
                  <div className="text-sm font-semibold">{m.label}</div>
                </button>
              ))}
            </div>
            {(method === "card" || method === "debit") && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Field label="Card number">
                  <input value={card.number} onChange={e => setCard(c => ({ ...c, number: e.target.value }))} placeholder="4242 4242 4242 4242"
                         className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  />
                </Field></div>
                <div className="sm:col-span-2"><Field label="Name on card">
                  <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                         className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  />
                </Field></div>
                <Field label="Expiry"><input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))} placeholder="MM/YY"
                       className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  /></Field>
                <Field label="CVC"><input value={card.cvc} onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))} placeholder="123"
                       className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  /></Field>
                <div className="sm:col-span-2 text-xs text-stone-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Demo simulation — about 5% of card payments randomly fail to demonstrate failure handling. No real charges occur.
                </div>
              </div>
            )}
            {method === "upi" && (
              <Field label="UPI ID"><input placeholder="yourname@bank"
                     className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  /></Field>
            )}
            {method === "cod" && (
              <div className="text-sm text-stone-600 bg-cream rounded-xl p-4 border border-cream" >
                Pay in cash on delivery. Your order will be placed with payment status <strong>Pending</strong>.
              </div>
            )}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="lg:sticky lg:top-24 h-fit bg-white rounded-3xl border border-stone-100 p-8 shadow-sm">
          <h3 className="font-display text-2xl font-medium mb-8">Summary</h3>
          <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
            {enriched.map(i => (
              <div key={i.product_id} className="flex gap-4 text-sm items-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                  <img src={i.product.image} alt={i.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold tracking-tight truncate">{i.product.name}</div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Qty {i.quantity}</div>
                </div>
                <div className="font-bold">${i.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 pt-6 space-y-3">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400"><span>Shipping</span><span>{ship === 0 ? "Free" : `$${ship.toFixed(2)}`}</span></div>
            <div className="border-t border-stone-100 pt-6 flex justify-between text-xl font-bold">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button type="submit" disabled={busy} className="w-full mt-10 py-5 bg-stone-900 text-white rounded-full font-bold text-sm hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-stone-200 disabled:opacity-20">
            {busy ? "Processing..." : `Complete Purchase — $${total.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// ORDER SUCCESS
// ============================================================

function OrderSuccessPage({ navigate, route }) {
  const [order, setOrder] = useState(null);
  useEffect(() => {
    (async () => setOrder(await Orders.getById(route.params.id)))();
  }, [route.params.id]);
  if (!order) return <div className="text-center py-32"><Loader2 className="w-8 h-8 anim-spin mx-auto text-stone-300" /></div>;

  const failed = order.status === "payment_failed";
  const paid = order.payment?.status === "paid";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      <div className="bg-white rounded-[3rem] border border-stone-100 p-12 sm:p-20 text-center shadow-sm">
        <div className={`w-24 h-24 rounded-full mx-auto mb-10 flex items-center justify-center anim-pop ${failed ? "bg-red-50" : "bg-stone-50"}`}>
          {failed ? <X className="w-10 h-10 text-red-500" /> : <Check className="w-10 h-10 text-stone-900" strokeWidth={3} />}
        </div>
        <h1 className="font-display text-5xl font-medium mb-6">
          {failed ? "Transaction Failed" : paid ? "Confirmed" : "Order Received"}
        </h1>
        <p className="text-stone-500 text-lg mb-12 max-w-md mx-auto leading-relaxed font-medium">
          {failed ? "We couldn't process your payment. Please review your details and try again." : paid ? "Thank you for your acquisition. A confirmation email has been dispatched with tracking details." : "Payment pending for delivery. We'll contact you shortly."}
        </p>
        
        <div className="bg-stone-50 rounded-3xl p-8 mb-12 text-left">
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Order Reference</div>
              <div className="font-bold font-mono tracking-tight text-stone-900">{order.id}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Amount Paid</div>
              <div className="font-bold text-stone-900 text-lg">${order.total.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate("products")} className="flex-1 py-5 border-2 border-stone-100 text-stone-900 rounded-full font-bold text-sm hover:border-stone-900 transition-all">Continue Exploring</button>
          <button onClick={() => navigate("account", { tab: "order-details", orderId: order.id })}
                  className="flex-1 py-5 bg-stone-900 text-white rounded-full font-bold text-sm hover:bg-stone-800 transition-all shadow-xl shadow-stone-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ACCOUNT DASHBOARD
// ============================================================

function AccountPage({ user, setUser, navigate, route, products, refreshAll, refreshCart, showToast }) {
  const tab = route.params.tab || "profile";
  if (!user) { navigate("login"); return null; }
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
      <h1 className="font-display text-4xl font-medium mb-8">My account</h1>
      <div className="grid md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-cream p-4 sticky top-24">
            <div className="flex items-center gap-3 p-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-stone-900 text-cream flex items-center justify-center font-semibold" style={{ color: "#FAF6F0" }}>
                {user.full_name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{user.full_name}</div>
                <div className="text-xs text-stone-500 truncate">{user.email}</div>
              </div>
            </div>
            {[
              { id: "profile", icon: User, label: "Profile" },
              { id: "orders", icon: ListOrdered, label: "Orders" },
              { id: "reviews", icon: MessageSquare, label: "Reviews" },
            ].map(t => (
              <button key={t.id} onClick={() => navigate("account", { tab: t.id })}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${tab === t.id ? "bg-stone-900 text-cream" : "hover:bg-stone-50"}`}
                      style={tab === t.id ? { color: "#FAF6F0" } : {}}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
            <button onClick={async () => { await Auth.logout(); setUser(null); refreshCart(null); showToast("Signed out"); navigate("home"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 text-red-700 mt-2">
              <LogOut className="w-4 h-4" />Sign out
            </button>
          </div>
        </aside>
        <section className="md:col-span-3">
          {tab === "profile" && <ProfileTab user={user} setUser={setUser} showToast={showToast} />}
          {tab === "orders" && <OrdersTab user={user} navigate={navigate} />}
          {tab === "order-details" && <OrderDetailsTab orderId={route.params.orderId} navigate={navigate} />}
          {tab === "reviews" && <UserReviewsTab user={user} products={products} navigate={navigate} refreshAll={refreshAll} showToast={showToast} />}
        </section>
      </div>
    </div>
  );
}

function ProfileTab({ user, setUser, showToast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: user.full_name, email: user.email, phone: user.phone });
  const [pwForm, setPwForm] = useState({ old: "", new1: "", new2: "" });
  const [pwOpen, setPwOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await Auth.updateProfile(user.id, form);
      setUser(u);
      setEditing(false);
      showToast("Profile updated");
    } catch (e) { showToast(e.message, "error"); }
    setBusy(false);
  };
  const changePw = async (e) => {
    e.preventDefault();
    if (pwForm.new1 !== pwForm.new2) return showToast("New passwords don't match", "error");
    if (pwForm.new1.length < 8) return showToast("Password must be at least 8 characters", "error");
    setBusy(true);
    try {
      await Auth.changePassword(user.id, pwForm.old, pwForm.new1);
      setPwForm({ old: "", new1: "", new2: "" });
      setPwOpen(false);
      showToast("Password updated");
    } catch (e) { showToast(e.message, "error"); }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-cream p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-medium">Profile</h2>
          {!editing && <button onClick={() => setEditing(true)} className="text-sm font-semibold flex items-center gap-1 hover:text-orange-700"><Edit3 className="w-4 h-4" /> Edit</button>}
        </div>
        {!editing ? (
          <dl className="grid sm:grid-cols-2 gap-y-5 gap-x-8">
            <div><dt className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">Full name</dt><dd>{user.full_name}</dd></div>
            <div><dt className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">Email</dt><dd>{user.email}</dd></div>
            <div><dt className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">Phone</dt><dd>{user.phone}</dd></div>
            <div><dt className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">Member since</dt><dd>{new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</dd></div>
          </dl>
        ) : (
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name"><input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                   className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  /></Field>
            <Field label="Email"><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                   className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  /></Field>
            <Field label="Phone"><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                   className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  /></Field>
            <div className="sm:col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={busy} className="px-6 py-2.5 bg-stone-900 rounded-full font-semibold text-sm disabled:opacity-50" style={{ color: "#FAF6F0" }}>Save</button>
              <button type="button" onClick={() => { setEditing(false); setForm({ full_name: user.full_name, email: user.email, phone: user.phone }); }}
                      className="px-6 py-2.5 border border-stone-300 rounded-full font-semibold text-sm">Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-cream p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-medium">Password</h2>
          {!pwOpen && <button onClick={() => setPwOpen(true)} className="text-sm font-semibold flex items-center gap-1 hover:text-orange-700"><Lock className="w-4 h-4" /> Change</button>}
        </div>
        {pwOpen && (
          <form onSubmit={changePw} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Field label="Current password"><input type="password" value={pwForm.old} onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))}
                   className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  /></Field></div>
            <Field label="New password"><input type="password" value={pwForm.new1} onChange={e => setPwForm(f => ({ ...f, new1: e.target.value }))}
                   className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  /></Field>
            <Field label="Confirm new password"><input type="password" value={pwForm.new2} onChange={e => setPwForm(f => ({ ...f, new2: e.target.value }))}
                   className="w-full px-4 py-3 bg-cream border border-cream rounded-xl outline-none focus:border-stone-400"  /></Field>
            <div className="sm:col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={busy} className="px-6 py-2.5 bg-stone-900 rounded-full font-semibold text-sm disabled:opacity-50" style={{ color: "#FAF6F0" }}>Update password</button>
              <button type="button" onClick={() => setPwOpen(false)} className="px-6 py-2.5 border border-stone-300 rounded-full font-semibold text-sm">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: { bg: "#FEF3C7", fg: "#92400E" },
    processing: { bg: "#DBEAFE", fg: "#1E40AF" },
    shipped: { bg: "#E0F2FE", fg: "#075985" },
    delivered: { bg: "#D1FAE5", fg: "#065F46" },
    cancelled: { bg: "#FEE2E2", fg: "#991B1B" },
    payment_failed: { bg: "#FEE2E2", fg: "#991B1B" },
    pending: { bg: "#FEF3C7", fg: "#92400E" },
    paid: { bg: "#D1FAE5", fg: "#065F46" },
    failed: { bg: "#FEE2E2", fg: "#991B1B" },
    refunded: { bg: "#F3E8FF", fg: "#6B21A8" },
  };
  const s = map[status] || { bg: "#E7E5E4", fg: "#44403C" };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: s.bg, color: s.fg }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};

function OrdersTab({ user, navigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { setOrders(await Orders.listForUser(user.id)); setLoading(false); })(); }, [user.id]);
  if (loading) return <div className="text-center py-20"><Loader2 className="w-6 h-6 anim-spin mx-auto text-stone-400" /></div>;
  if (orders.length === 0) return (
    <div className="bg-white rounded-2xl border border-cream p-12 text-center">
      <Package className="w-12 h-12 mx-auto text-stone-300 mb-3" />
      <div className="font-display text-2xl font-medium mb-2">No orders yet</div>
      <div className="text-stone-500 mb-6">When you place an order, it'll show up here.</div>
      <button onClick={() => navigate("products")} className="px-6 py-2.5 bg-stone-900 rounded-full text-sm font-semibold" style={{ color: "#FAF6F0" }}>Start shopping</button>
    </div>
  );
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-medium mb-2">Order history</h2>
      {orders.map(o => (
        <div key={o.id} className="bg-white rounded-2xl border border-cream p-5 hover:shadow-md transition cursor-pointer"
             onClick={() => navigate("account", { tab: "order-details", orderId: o.id })}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">Order</div>
              <div className="font-mono text-sm font-semibold">{o.id}</div>
              <div className="text-xs text-stone-500 mt-1">{new Date(o.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">${o.total.toFixed(2)}</div>
              <div className="flex gap-2 mt-1 justify-end">
                <StatusBadge status={o.status} />
                <StatusBadge status={o.payment?.status} />
              </div>
            </div>
          </div>
          <button className="text-sm font-semibold mt-3 flex items-center gap-1 hover:text-orange-700">
            View details <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function OrderDetailsTab({ orderId, navigate }) {
  const [order, setOrder] = useState(null);
  useEffect(() => { (async () => setOrder(await Orders.getById(orderId)))(); }, [orderId]);
  if (!order) return <div className="text-center py-20"><Loader2 className="w-6 h-6 anim-spin mx-auto text-stone-400" /></div>;
  return (
    <div className="space-y-4">
      <button onClick={() => navigate("account", { tab: "orders" })} className="text-sm font-semibold flex items-center gap-1 hover:text-orange-700">
        <ChevronLeft className="w-4 h-4" /> Back to orders
      </button>
      <div className="bg-white rounded-2xl border border-cream p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-1">Order</div>
            <div className="font-mono font-semibold">{order.id}</div>
            <div className="text-sm text-stone-500 mt-1">{new Date(order.created_at).toLocaleString()}</div>
          </div>
          <div className="flex gap-2"><StatusBadge status={order.status} /><StatusBadge status={order.payment?.status} /></div>
        </div>

        {/* TIMELINE */}
        <div className="border-t border-cream pt-6 mb-6">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-4">Timeline</div>
          <div className="space-y-3">
            {(order.timeline || []).map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-stone-900 mt-2" />
                <div>
                  <div className="text-sm font-semibold">{t.label}</div>
                  <div className="text-xs text-stone-500">{new Date(t.at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ITEMS */}
        <div className="border-t border-cream pt-6 mb-6">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-4">Items</div>
          <div className="space-y-3">
            {order.items.map(i => (
              <div key={i.product_id} className="flex gap-4">
                <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center"
                     style={{ background: i.product_accent + "15" }}>
                  <Ico name={i.product_icon} className="w-7 h-7" style={{ color: i.product_accent }} strokeWidth={1.3} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{i.brand}</div>
                  <div className="font-medium">{i.product_name}</div>
                  <div className="text-sm text-stone-500">Qty {i.quantity} × ${i.price_at_purchase.toFixed(2)} <span className="text-[10px] ml-1">(price at purchase)</span></div>
                </div>
                <div className="font-semibold">${i.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT & SHIPPING */}
        <div className="grid sm:grid-cols-2 gap-6 border-t border-cream pt-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-3">Payment</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-stone-500">Method</span><span className="font-medium uppercase">{order.payment?.method}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Status</span><span><StatusBadge status={order.payment?.status} /></span></div>
              {order.payment?.transaction_id && <div className="flex justify-between"><span className="text-stone-500">Transaction</span><span className="font-mono text-xs">{order.payment.transaction_id}</span></div>}
              <div className="flex justify-between"><span className="text-stone-500">Amount</span><span className="font-semibold">${order.payment?.amount.toFixed(2)}</span></div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-3">Ship to</div>
            <div className="text-sm leading-relaxed">
              <div className="font-medium">{order.shipping?.full_name}</div>
              <div>{order.shipping?.address1}</div>
              {order.shipping?.address2 && <div>{order.shipping.address2}</div>}
              <div>{order.shipping?.city}, {order.shipping?.state} {order.shipping?.zip}</div>
              <div>{order.shipping?.country}</div>
              <div className="text-stone-500 mt-1">{order.shipping?.phone}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-cream pt-4 mt-6 flex justify-between text-lg font-semibold">
          <span>Total</span><span>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function UserReviewsTab({ user, products, navigate, refreshAll, showToast }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = async () => { setReviews(await Reviews.listForUser(user.id)); setLoading(false); };
  useEffect(() => { reload(); }, [user.id]);

  const remove = async (productId) => {
    await Reviews.delete(user.id, productId);
    await refreshAll();
    reload();
    showToast("Review deleted");
  };

  if (loading) return <div className="text-center py-20"><Loader2 className="w-6 h-6 anim-spin mx-auto text-stone-400" /></div>;
  if (reviews.length === 0) return (
    <div className="bg-white rounded-2xl border border-cream p-12 text-center">
      <MessageSquare className="w-12 h-12 mx-auto text-stone-300 mb-3" />
      <div className="font-display text-2xl font-medium mb-2">No reviews yet</div>
      <div className="text-stone-500">Share your thoughts on products you've purchased.</div>
    </div>
  );
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-medium mb-2">My reviews</h2>
      {reviews.map(r => {
        const p = products.find(x => x.id === r.product_id);
        if (!p) return null;
        return (
          <div key={r.id} className="bg-white rounded-2xl border border-cream p-5">
            <div className="flex items-start gap-4">
              <button onClick={() => navigate("product", { id: p.id })} className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: p.accent + "15" }}>
                <Ico name={p.icon} className="w-7 h-7" style={{ color: p.accent }} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <button onClick={() => navigate("product", { id: p.id })} className="text-left">
                    <div className="font-medium hover:text-orange-700">{p.name}</div>
                  </button>
                  <StarRating value={r.rating} />
                </div>
                <p className="text-sm text-stone-700 mb-2">{r.comment}</p>
                <div className="text-xs text-stone-500">{new Date(r.created_at).toLocaleDateString()}</div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => navigate("product", { id: p.id })} className="px-3 py-1.5 border border-stone-300 rounded-full text-xs font-semibold">Edit on product page</button>
                  <button onClick={() => remove(p.id)} className="px-3 py-1.5 border border-red-300 text-red-700 rounded-full text-xs font-semibold">Delete</button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// ADMIN
// ============================================================

function AdminPage({ user, navigate, products, categories, inventory, refreshAll, showToast }) {
  const [tab, setTab] = useState("products");
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    if (tab !== "orders") return;
    (async () => {
      const keys = await DB.list("order:");
      const list = [];
      for (const k of keys) {
        const o = await DB.get(k);
        if (o) { const p = await DB.get(`payment:${o.id}`); list.push({ ...o, payment: p }); }
      }
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAllOrders(list);
    })();
  }, [tab]);

  if (!user) { navigate("login"); return null; }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
      <h1 className="font-display text-4xl font-medium mb-2">Admin panel</h1>
      <p className="text-stone-500 mb-8">Manage products, inventory, categories, and orders.</p>

      <div className="flex gap-2 border-b border-cream mb-6 overflow-x-auto scrollbar-hide">
        {[
          { id: "products", label: "Products" },
          { id: "inventory", label: "Inventory" },
          { id: "categories", label: "Categories" },
          { id: "orders", label: "Orders" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap ${tab === t.id ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && <AdminProducts products={products} categories={categories} inventory={inventory} refreshAll={refreshAll} showToast={showToast} />}
      {tab === "inventory" && <AdminInventory products={products} inventory={inventory} refreshAll={refreshAll} showToast={showToast} />}
      {tab === "categories" && <AdminCategories categories={categories} refreshAll={refreshAll} showToast={showToast} />}
      {tab === "orders" && <AdminOrders orders={allOrders} refresh={async () => {
        const keys = await DB.list("order:");
        const list = [];
        for (const k of keys) {
          const o = await DB.get(k); if (o) { const p = await DB.get(`payment:${o.id}`); list.push({ ...o, payment: p }); }
        }
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setAllOrders(list);
      }} showToast={showToast} />}
    </div>
  );
}

function AdminProducts({ products, categories, inventory, refreshAll, showToast }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "", category_id: categories[0]?.id || "", price: "", description: "", image: "/images/prod_watch.png", stock: 10 });
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return showToast("Please complete required fields", "error");
    const id = "p_" + uid();
    const newProduct = {
      id, name: form.name, brand: form.brand, category_id: form.category_id,
      price: parseFloat(form.price), image: form.image,
      description: form.description, created_at: new Date().toISOString()
    };
    const prods = await DB.get("products") || [];
    prods.push(newProduct);
    await DB.set("products", prods);
    await DB.set(`inventory:${id}`, { product_id: id, stock: parseInt(form.stock, 10), updated_at: new Date().toISOString() });
    await refreshAll();
    setOpen(false);
    setForm({ name: "", brand: "", category_id: categories[0]?.id || "", price: "", description: "", image: "/images/prod_watch.png", stock: 10 });
    showToast("Product created");
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-stone-400">{products.length} Products in Catalog</div>
        <button onClick={() => setOpen(o => !o)} className="px-6 py-3 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-stone-200">
          <Plus className="w-4 h-4" /> Add New Piece
        </button>
      </div>
      {open && (
        <form onSubmit={submit} className="bg-white rounded-[2rem] border border-stone-100 p-8 mb-12 grid sm:grid-cols-2 gap-6 shadow-sm anim-fade-up">
          <Field label="Name"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                 className="w-full px-5 py-3 bg-stone-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-stone-200" /></Field>
          <Field label="Brand"><input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                 className="w-full px-5 py-3 bg-stone-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-stone-200" /></Field>
          <Field label="Category"><select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                 className="w-full px-5 py-3 bg-stone-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-stone-200">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></Field>
          <Field label="Price"><input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required
                 className="w-full px-5 py-3 bg-stone-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-stone-200" /></Field>
          <Field label="Stock"><input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                 className="w-full px-5 py-3 bg-stone-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-stone-200" /></Field>
          <Field label="Image URL"><input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                 className="w-full px-5 py-3 bg-stone-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-stone-200" /></Field>
          <div className="sm:col-span-2"><Field label="Description"><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                 className="w-full px-5 py-3 bg-stone-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-stone-200" /></Field></div>
          <div className="sm:col-span-2 flex gap-4 mt-2">
            <button type="submit" className="px-8 py-4 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:bg-stone-800">Create Piece</button>
            <button type="button" onClick={() => setOpen(false)} className="px-8 py-4 border-2 border-stone-200 rounded-full text-xs font-bold uppercase tracking-widest hover:border-stone-900 transition-all">Cancel</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm">
        <div className="divide-y divide-stone-50">
          {products.map(p => {
            const cat = categories.find(c => c.id === p.category_id);
            return (
              <div key={p.id} className="p-6 flex items-center gap-6 group hover:bg-stone-50 transition-colors">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">{p.brand}</div>
                  <div className="font-bold tracking-tight text-lg">{p.name}</div>
                  <div className="text-xs text-stone-400 font-medium">{cat?.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">${p.price.toFixed(2)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Stock: {inventory[p.id] ?? 0}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdminInventory({ products, inventory, refreshAll, showToast }) {
  const update = async (id, val) => {
    const stock = Math.max(0, parseInt(val, 10) || 0);
    await DB.set(`inventory:${id}`, { product_id: id, stock, updated_at: new Date().toISOString() });
    await refreshAll();
    showToast("Inventory updated");
  };
  return (
    <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm">
      <div className="divide-y divide-stone-50">
        {products.map(p => (
          <div key={p.id} className="p-6 flex items-center gap-6 hover:bg-stone-50 transition-colors">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">{p.brand}</div>
              <div className="font-bold tracking-tight">{p.name}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">On Hand:</span>
              <input type="number" defaultValue={inventory[p.id] ?? 0} onBlur={e => update(p.id, e.target.value)}
                     className="w-24 px-4 py-3 bg-stone-50 border border-transparent rounded-xl outline-none text-sm font-bold text-center focus:bg-white focus:border-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCategories({ categories, refreshAll, showToast }) {
  const [name, setName] = useState("");
  const create = async (e) => {
    e.preventDefault();
    if (!name) return;
    const id = "cat_" + uid();
    const colors = ["#0F766E", "#9F1239", "#854D0E", "#1E40AF", "#9333EA", "#15803D", "#B45309"];
    const accent = colors[Math.floor(Math.random() * colors.length)];
    const newCat = { id, name, slug: name.toLowerCase().replace(/\s+/g, "-"), icon: "Package", accent, tint: accent + "22", description: "Discover " + name };
    await DB.set("categories", [...categories, newCat]);
    await refreshAll();
    setName("");
    showToast("Category created");
  };
  return (
    <div>
      <form onSubmit={create} className="flex gap-3 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New category name"
               className="flex-1 px-4 py-2.5 bg-white border border-cream rounded-full outline-none" />
        <button className="px-5 py-2.5 bg-stone-900 rounded-full text-sm font-semibold" style={{ color: "#FAF6F0" }}>Add</button>
      </form>
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-cream p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.tint, color: c.accent }}>
              <Ico name={c.icon} className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-stone-500">{c.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminOrders({ orders, refresh, showToast }) {
  const updateStatus = async (orderId, status) => {
    await Orders.updateStatus(orderId, status);
    await refresh();
    showToast("Order status updated");
  };
  if (!orders.length) return (
    <div className="bg-white rounded-2xl border border-cream p-12 text-center">
      <Package className="w-12 h-12 mx-auto text-stone-300 mb-3" />
      <div className="font-medium">No orders yet</div>
    </div>
  );
  return (
    <div className="space-y-3">
      {orders.map(o => (
        <div key={o.id} className="bg-white rounded-2xl border border-cream p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div>
              <div className="font-mono text-xs">{o.id}</div>
              <div className="text-xs text-stone-500">{new Date(o.created_at).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">${o.total.toFixed(2)}</div>
              <div className="flex gap-2 mt-1 justify-end"><StatusBadge status={o.status} /><StatusBadge status={o.payment?.status} /></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-cream">
            <span className="text-xs text-stone-500 self-center mr-1">Update status:</span>
            {["processing", "shipped", "delivered", "cancelled"].map(s => (
              <button key={s} onClick={() => updateStatus(o.id, s)} disabled={o.status === s}
                      className="px-3 py-1 text-xs font-semibold rounded-full border border-stone-300 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed">
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================

function Footer({ navigate }) {
  return (
    <footer className="mt-12" style={{ background: "#171717" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-5">
            <div className="font-display text-3xl font-semibold mb-8 text-white">Meridian<span className="text-orange-400">.</span></div>
            <p className="text-lg leading-relaxed text-stone-400 max-w-sm mb-12">
              A sanctuary for those who appreciate the intersection of heritage craftsmanship and contemporary design.
            </p>
            <div className="flex gap-4">
              {['Instagram', 'Twitter', 'Pinterest'].map(s => (
                <a key={s} href="#" className="text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-orange-400 transition-colors">{s}</a>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-stone-500">Collection</div>
            <ul className="space-y-4 text-sm font-medium text-stone-300">
              <li><button onClick={() => navigate("products")} className="hover:text-white transition-colors">All Pieces</button></li>
              <li><button onClick={() => navigate("products", { sort: "newest" })} className="hover:text-white transition-colors">New Arrivals</button></li>
              <li><button onClick={() => navigate("products", { sort: "rating" })} className="hover:text-white transition-colors">Most Wanted</button></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-stone-500">Service</div>
            <ul className="space-y-4 text-sm font-medium text-stone-300">
              <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-stone-500">Newsletter</div>
            <p className="text-sm text-stone-400 mb-6 font-medium">Join for exclusive early access and stories.</p>
            <div className="flex border-b border-stone-700 pb-2">
              <input type="email" placeholder="Your email" className="bg-transparent text-sm text-white outline-none flex-1" />
              <button className="text-white hover:text-orange-400 transition-colors"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">
          <div>© 2026 Meridian. All rights reserved.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
