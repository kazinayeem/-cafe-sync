import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetPublicMenuQuery } from "@/services/publicMenuApi";
import {
  Coffee,
  QrCode,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  ChevronRight,
  Monitor,
  ChefHat,
  Menu as MenuIcon,
  X,
  Sliders,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function App() {
  const navigate = useNavigate();
  const { data: menuData } = useGetPublicMenuQuery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const business = menuData?.data?.business || {
    name: "Cafe Sync",
    address: "Mirpur, Dhaka",
    phone: "+880 1712-345678",
    openingTime: "08:00 AM",
    closingTime: "11:00 PM",
  };

  const products = menuData?.data?.products || [];

  // Curated fallback featured coffees if database products aren't loaded yet
  const fallbackFeatured = [
    {
      _id: "f1",
      name: "Velvet Flat White",
      description: "Double ristretto shot with micro-foamed silky steamed whole milk.",
      price: 240,
      imageUrl:
        "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80",
      tag: "Customer Favorite",
    },
    {
      _id: "f2",
      name: "Caramel Macchiato",
      description: "Freshly pulled espresso layered over vanilla syrup, milk, and rich caramel drizzle.",
      price: 280,
      imageUrl:
        "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80",
      tag: "House Special",
    },
    {
      _id: "f3",
      name: "Single-Origin Cold Brew",
      description: "16-hour slow steep Ethiopian Yirgacheffe with bright floral and citrus notes.",
      price: 260,
      imageUrl:
        "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
      tag: "Slow Steeped",
    },
    {
      _id: "f4",
      name: "Butter Almond Croissant",
      description: "Flaky golden French pastry layered with rich almond frangipane and toasted flakes.",
      price: 180,
      imageUrl:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
      tag: "Baked Fresh Daily",
    },
  ];

  const featuredItems =
    products.length >= 3
      ? products.slice(0, 4).map((p: any, i: number) => ({
          _id: p._id,
          name: p.name,
          description: p.description || "Crafted fresh upon order with specialty roasted beans.",
          price: p.sizes?.small || p.sizes?.large || p.price || 220,
          imageUrl: p.imageUrl || fallbackFeatured[i % 4].imageUrl,
          tag: i === 0 ? "Barista Pick" : i === 1 ? "Customer Favorite" : "Freshly Made",
        }))
      : fallbackFeatured;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#120B06] text-[#22150C] dark:text-[#FCF8F2] selection:bg-[#C86D3B]/20 selection:text-[#3C2415] font-sans overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/90 dark:bg-[#120B06]/90 backdrop-blur-md border-b border-[#EDE1D1] dark:border-[#332317] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo with Steam Micro-Interaction */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C86D3B] text-white shadow-md shadow-[#C86D3B]/25 group-hover:scale-105 transition-transform">
              <Coffee className="h-6 w-6 relative z-10" />
              {/* Subtle rising steam */}
              <span className="absolute -top-1.5 left-3.5 w-1.5 h-3 bg-white/70 rounded-full animate-steam-1" />
              <span className="absolute -top-2.5 left-5 w-1.5 h-3.5 bg-white/60 rounded-full animate-steam-2" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#22150C] dark:text-[#FCF8F2] block leading-none">
                Cafe Sync
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#786555] dark:text-[#A69180] mt-0.5 block">
                Specialty Coffee & Roastery
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wide uppercase text-[#786555] dark:text-[#A69180]">
            <a
              href="#menu"
              className="hover:text-[#C86D3B] dark:hover:text-[#D97736] transition-colors"
            >
              Our Menu
            </a>
            <a
              href="#qr-order"
              className="hover:text-[#C86D3B] dark:hover:text-[#D97736] transition-colors flex items-center gap-1"
            >
              <QrCode className="h-3.5 w-3.5" />
              Table QR Order
            </a>
            <a
              href="#tracking"
              className="hover:text-[#C86D3B] dark:hover:text-[#D97736] transition-colors"
            >
              Live Tracker
            </a>
            <a
              href="#experience"
              className="hover:text-[#C86D3B] dark:hover:text-[#D97736] transition-colors"
            >
              Experience
            </a>
            <a
              href="#display"
              className="hover:text-[#C86D3B] dark:hover:text-[#D97736] transition-colors flex items-center gap-1 text-[#C86D3B] dark:text-[#D97736]"
            >
              <Monitor className="h-3.5 w-3.5" />
              Cafe TV Display
            </a>
          </div>

          {/* Desktop Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-xs font-bold text-[#786555] dark:text-[#A69180] hover:text-[#22150C] dark:hover:text-[#FCF8F2] hover:bg-[#F6EFE6] dark:hover:bg-[#261B12] rounded-xl"
            >
              Staff POS ➔
            </Button>
            <Button
              onClick={() => navigate("/menu")}
              className="h-11 px-5 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E30] text-white font-black text-xs shadow-md shadow-[#C86D3B]/20 flex items-center gap-2"
            >
              <Coffee className="h-4 w-4" />
              Explore Menu
            </Button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              size="sm"
              onClick={() => navigate("/menu")}
              className="h-9 px-3 rounded-xl bg-[#C86D3B] text-white font-bold text-xs"
            >
              Menu
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[#EDE1D1] dark:border-[#332317] bg-[#FDFBF7] dark:bg-[#1C130C] text-[#22150C] dark:text-[#FCF8F2]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#EDE1D1] dark:border-[#332317] bg-[#FDFBF7] dark:bg-[#120B06] px-4 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-4">
            <div className="flex flex-col space-y-3 text-sm font-bold text-[#22150C] dark:text-[#FCF8F2]">
              <a
                href="#menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-[#F6EFE6] dark:hover:bg-[#261B12]"
              >
                ☕ Our Menu
              </a>
              <a
                href="#qr-order"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-[#F6EFE6] dark:hover:bg-[#261B12] flex items-center gap-2"
              >
                <QrCode className="h-4 w-4 text-[#C86D3B]" />
                Table QR Ordering
              </a>
              <a
                href="#tracking"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-[#F6EFE6] dark:hover:bg-[#261B12]"
              >
                ⏱️ Order Live Tracker
              </a>
              <a
                href="/display"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-[#F6EFE6] dark:hover:bg-[#261B12] flex items-center gap-2 text-[#C86D3B]"
              >
                <Monitor className="h-4 w-4" />
                Cafe TV Status Display
              </a>
              <a
                href="#experience"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-[#F6EFE6] dark:hover:bg-[#261B12]"
              >
                🌿 The Cafe Experience
              </a>
            </div>

            <div className="pt-4 border-t border-[#EDE1D1] dark:border-[#332317] flex flex-col gap-2">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/menu");
                }}
                className="w-full h-11 rounded-xl bg-[#C86D3B] text-white font-black text-xs shadow-md"
              >
                View Full Cafe Menu
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full h-11 rounded-xl border-[#EDE1D1] dark:border-[#332317] font-bold text-xs"
              >
                Staff POS Register ➔
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* 2. CAFE INFO STRIP */}
      {/* ========================================================================= */}
      <section className="bg-[#F6EFE6] dark:bg-[#1C130C] border-b border-[#EDE1D1] dark:border-[#332317] py-2.5 px-4 text-xs font-semibold text-[#786555] dark:text-[#A69180]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
            <Clock className="h-3.5 w-3.5 text-[#C86D3B]" />
            <span>
              Open Today: {business.openingTime || "08:00 AM"} — {business.closingTime || "11:00 PM"}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#C86D3B]" />
            <span>{business.address || "Mirpur, Dhaka"}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-[#C86D3B]" />
            <span>{business.phone || "+880 1712-345678"}</span>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-1.5 w-full sm:w-auto">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#22150C] dark:text-[#FCF8F2]">
              Table QR Ordering & KDS Live
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Warm Ambient Coffee Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C86D3B]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#D97706]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Storytelling & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F6EFE6] dark:bg-[#261B12] border border-[#EDE1D1] dark:border-[#332317] text-[#C86D3B] dark:text-[#D97736] text-xs font-black tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Specialty Coffee & Touchless Table Ordering
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#22150C] dark:text-[#FCF8F2] leading-[1.08]">
              Good coffee. <br />
              <span className="text-[#C86D3B] dark:text-[#D97736] underline decoration-[#C86D3B]/30 decoration-wavy decoration-2">
                Good moments.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#786555] dark:text-[#A69180] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Order your favorite handcrafted brew, customize sizes and milk options, and follow your preparation in real time — straight from your seat.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                onClick={() => navigate("/menu")}
                className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E30] text-white font-black text-sm shadow-xl shadow-[#C86D3B]/25 flex items-center justify-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Coffee className="h-4 w-4" />
                View Cafe Menu
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>

              <a
                href="#qr-order"
                className="w-full sm:w-auto h-13 px-6 rounded-2xl border-2 border-[#EDE1D1] dark:border-[#332317] bg-white dark:bg-[#1C130C] hover:bg-[#F6EFE6] dark:hover:bg-[#261B12] text-[#22150C] dark:text-[#FCF8F2] font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <QrCode className="h-4 w-4 text-[#C86D3B]" />
                Order from Table
              </a>
            </div>

            {/* Micro Social Proof / Trust metrics */}
            <div className="pt-4 border-t border-[#EDE1D1]/80 dark:border-[#332317] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-[#786555] dark:text-[#A69180]">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500 font-black">★ 4.9/5</span>
                <span>Specialty Roast Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>100% Single-Origin Arabica</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-[#C86D3B]" />
                <span>Zero Queue Waiting</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Visual Card with Steam Micro-Interaction */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#EDE1D1] dark:border-[#332317] bg-white dark:bg-[#1C130C] shadow-2xl p-4 sm:p-6 space-y-4">
              {/* Main Photo Banner with Floating Badges */}
              <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-2xl bg-[#F6EFE6] dark:bg-[#261B12] group">
                <img
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80"
                  alt="Fresh Artisan Latte with Latte Art"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Steam Rising Micro Interaction */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none flex gap-2">
                  <span className="w-2 h-8 bg-white/60 rounded-full blur-[1px] animate-steam-1" />
                  <span className="w-2 h-10 bg-white/70 rounded-full blur-[1px] animate-steam-2" />
                  <span className="w-2 h-7 bg-white/50 rounded-full blur-[1px] animate-steam-3" />
                </div>

                {/* Floating Tag */}
                <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <span className="h-2 w-2 rounded-full bg-[#C86D3B]" />
                  Freshly Brewed to Order
                </div>

                {/* Floating Price Pill */}
                <div className="absolute bottom-3 right-3 bg-white dark:bg-[#1C130C] text-[#22150C] dark:text-[#FCF8F2] px-3.5 py-1.5 rounded-xl text-xs font-black shadow-lg font-tabular border border-[#EDE1D1] dark:border-[#332317]">
                  From ৳220
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-lg font-black text-[#22150C] dark:text-[#FCF8F2]">
                    Signature Caramel Macchiato
                  </h3>
                  <p className="text-xs text-[#786555] dark:text-[#A69180] font-medium">
                    Fresh steamed oat milk, vanilla bean & espresso drizzle
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/menu")}
                  className="h-9 px-3.5 rounded-xl bg-[#F6EFE6] dark:bg-[#261B12] hover:bg-[#C86D3B] hover:text-white text-[#C86D3B] dark:text-[#D97736] font-bold text-xs transition-colors shrink-0"
                >
                  Order ➔
                </Button>
              </div>
            </div>

            {/* Decorative Offset Badge */}
            <div className="absolute -bottom-5 -left-5 bg-[#C86D3B] text-white p-3.5 rounded-2xl shadow-xl hidden sm:flex items-center gap-2.5 text-xs font-black">
              <Sparkles className="h-4 w-4" />
              <span>Roasted In-House Daily</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURED COFFEE MENU SECTION */}
      {/* ========================================================================= */}
      <section id="menu" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#F6EFE6]/50 dark:bg-[#180F08] border-y border-[#EDE1D1] dark:border-[#332317]">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#C86D3B] dark:text-[#D97736]">
                Handcrafted Specialty Menu
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#22150C] dark:text-[#FCF8F2]">
                Made for coffee lovers
              </h2>
              <p className="text-xs sm:text-sm text-[#786555] dark:text-[#A69180] max-w-lg">
                Freshly prepared favorites, roasted with care and customized just how you like them.
              </p>
            </div>

            <Button
              onClick={() => navigate("/menu")}
              variant="outline"
              className="h-11 px-5 rounded-2xl border-[#EDE1D1] dark:border-[#332317] bg-white dark:bg-[#1C130C] font-black text-xs self-start md:self-auto flex items-center gap-2 shadow-xs hover:bg-[#F6EFE6]"
            >
              Explore Full Menu ({products.length > 0 ? products.length : "50+"} items)
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Horizontal Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {["all", "coffee", "tea", "iced", "pastries", "snacks"].map((cat) => {
              const label =
                cat === "all"
                  ? "All Brews & Bites"
                  : cat === "coffee"
                  ? "Espresso & Coffee"
                  : cat === "tea"
                  ? "Handcrafted Tea"
                  : cat === "iced"
                  ? "Cold Brews & Iced"
                  : cat === "pastries"
                  ? "Artisanal Bakery"
                  : "Savory Snacks";

              const isSelected = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 ${
                    isSelected
                      ? "bg-[#C86D3B] text-white shadow-md shadow-[#C86D3B]/20"
                      : "bg-white dark:bg-[#1C130C] border border-[#EDE1D1] dark:border-[#332317] text-[#786555] dark:text-[#A69180] hover:border-[#C86D3B]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Featured Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate("/menu")}
                className="group rounded-3xl border border-[#EDE1D1] dark:border-[#332317] bg-white dark:bg-[#1C130C] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C86D3B]/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Photo */}
                <div className="relative h-48 w-full overflow-hidden bg-[#F6EFE6] dark:bg-[#261B12]">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#22150C]/75 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    {item.tag}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-black text-base text-[#22150C] dark:text-[#FCF8F2] group-hover:text-[#C86D3B] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#786555] dark:text-[#A69180] line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#EDE1D1]/60 dark:border-[#332317]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#786555] dark:text-[#A69180] block">
                        Price
                      </span>
                      <span className="text-lg font-black font-tabular text-[#C86D3B] dark:text-[#D97736]">
                        ৳{item.price}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="h-9 px-3 rounded-xl bg-[#F6EFE6] dark:bg-[#261B12] hover:bg-[#C86D3B] hover:text-white text-[#C86D3B] dark:text-[#D97736] font-bold text-xs transition-colors"
                    >
                      + Order
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SMART TABLE QR ORDERING (USP) */}
      {/* ========================================================================= */}
      <section id="qr-order" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual: Table QR Mockup & Workflow Cards */}
          <div className="lg:col-span-5 order-2 lg:order-1 relative">
            <div className="p-6 sm:p-8 rounded-3xl border-2 border-[#EDE1D1] dark:border-[#332317] bg-white dark:bg-[#1C130C] shadow-2xl space-y-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6EFE6] dark:bg-[#261B12] text-[#C86D3B] dark:text-[#D97736] text-xs font-black uppercase">
                <QrCode className="h-4 w-4" />
                Table 08 • Main Hall
              </div>

              {/* QR Stand Simulation */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-[#C86D3B]/40 bg-[#FDFBF7] dark:bg-[#120B06] inline-block shadow-inner space-y-2">
                <div className="bg-white p-3 rounded-xl inline-block shadow-md">
                  <div className="w-36 h-36 bg-[#22150C] rounded-lg p-2 flex items-center justify-center text-white text-center">
                    <div className="space-y-1">
                      <QrCode className="h-16 w-16 mx-auto text-[#C86D3B]" />
                      <span className="text-[10px] font-black uppercase tracking-widest block">
                        Scan to Order
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-black text-[#22150C] dark:text-[#FCF8F2]">
                  Point phone camera at table code
                </p>
              </div>

              <div className="space-y-1 text-xs text-[#786555] dark:text-[#A69180]">
                <p className="font-bold text-[#22150C] dark:text-[#FCF8F2]">
                  Instant Mobile Web Menu • No App Download Required
                </p>
                <p>Order is sent directly to the barista kitchen queue</p>
              </div>
            </div>
          </div>

          {/* Right Copy & 4-Step Horizontal Flow */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C86D3B]/10 text-[#C86D3B] dark:text-[#D97736] text-xs font-black uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5" />
                Touchless Dining Experience
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#22150C] dark:text-[#FCF8F2] leading-tight">
                Scan. Order. Relax.
              </h2>
              <p className="text-sm sm:text-base text-[#786555] dark:text-[#A69180] leading-relaxed">
                Take a seat at your favorite table, scan the code, customize your drinks with oat milk, extra shots, or less sugar, and relax while we brew.
              </p>
            </div>

            {/* 4-Step Workflow Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  step: "01",
                  title: "Scan Table QR",
                  desc: "Opens the mobile menu automatically bound to your table number.",
                  icon: QrCode,
                },
                {
                  step: "02",
                  title: "Customize Drink",
                  desc: "Select size, milk preferences, sweetness, and kitchen notes.",
                  icon: Sliders,
                },
                {
                  step: "03",
                  title: "Place & Receive Token",
                  desc: "Get your instant order serial like #A127 with prep time estimates.",
                  icon: Coffee,
                },
                {
                  step: "04",
                  title: "Track Status Live",
                  desc: "Watch your phone update live as your cup transitions from Brewing to Ready.",
                  icon: Clock,
                },
              ].map(({ step, title, desc, icon: Icon }) => (
                <div
                  key={step}
                  className="p-4 rounded-2xl border border-[#EDE1D1] dark:border-[#332317] bg-white dark:bg-[#1C130C] space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F6EFE6] dark:bg-[#261B12] text-[#C86D3B]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black font-tabular text-[#786555] dark:text-[#A69180]">
                      {step}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-[#22150C] dark:text-[#FCF8F2]">
                    {title}
                  </h4>
                  <p className="text-xs text-[#786555] dark:text-[#A69180] leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate("/menu")}
              className="h-12 px-7 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E30] text-white font-black text-xs shadow-md flex items-center gap-2"
            >
              Test Mobile QR Menu
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ORDER TRACKING & STATUS SIMULATION */}
      {/* ========================================================================= */}
      <section id="tracking" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#F6EFE6]/40 dark:bg-[#180F08] border-y border-[#EDE1D1] dark:border-[#332317]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#C86D3B] dark:text-[#D97736]">
              Real-Time Kitchen Visibility
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#22150C] dark:text-[#FCF8F2]">
              Know when your coffee is ready.
            </h2>
            <p className="text-xs sm:text-sm text-[#786555] dark:text-[#A69180]">
              No more wondering when your order is up. Keep your screen open or look at the cafe TV display.
            </p>
          </div>

          {/* Interactive Simulation Display Card */}
          <div className="max-w-xl mx-auto rounded-3xl border-2 border-[#EDE1D1] dark:border-[#332317] bg-white dark:bg-[#1C130C] p-6 sm:p-8 shadow-xl space-y-6">
            {/* Header Token */}
            <div className="flex items-center justify-between border-b border-[#EDE1D1] dark:border-[#332317] pb-4">
              <div>
                <span className="text-[10px] uppercase font-black text-[#786555] dark:text-[#A69180]">
                  Live Ticket
                </span>
                <p className="text-3xl font-black font-tabular text-[#22150C] dark:text-[#FCF8F2]">
                  Order #A127
                </p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  Table 08 • Dine-In
                </span>
                <p className="text-[11px] text-[#786555] dark:text-[#A69180] font-semibold mt-1">
                  Est. 5–7 mins
                </p>
              </div>
            </div>

            {/* Order Items Mock */}
            <div className="space-y-2 text-xs bg-[#FDFBF7] dark:bg-[#120B06] p-3.5 rounded-2xl border border-[#EDE1D1] dark:border-[#332317]">
              <div className="flex justify-between font-bold">
                <span>1 × Flat White (Oat Milk, Less Sugar)</span>
                <span className="font-tabular font-black">৳240</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>1 × Almond Butter Croissant</span>
                <span className="font-tabular font-black">৳180</span>
              </div>
            </div>

            {/* Live Step Progress Timeline */}
            <div className="space-y-3">
              <span className="text-[11px] uppercase font-black tracking-wider text-[#786555] dark:text-[#A69180] block">
                Order Preparation Steps
              </span>

              <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                  ✓ Received
                </div>
                <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                  ✓ Confirmed
                </div>
                <div className="p-2 rounded-xl bg-[#C86D3B] text-white shadow-md animate-pulse">
                  ● Brewing
                </div>
                <div className="p-2 rounded-xl bg-[#F6EFE6] dark:bg-[#261B12] text-[#786555] dark:text-[#A69180]">
                  ○ Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. LIVE CAFE DISPLAY & BARISTA KDS INTEGRATION */}
      {/* ========================================================================= */}
      <section id="display" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto rounded-3xl bg-[#1C130C] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C86D3B]/20 text-[#D97736] border border-[#C86D3B]/30 text-xs font-black uppercase">
              <Monitor className="h-4 w-4" />
              Connected Cafe Ecosystem
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Your order, always in sync.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Behind every great cup, Cafe Sync keeps the customer mobile tracker, kitchen barista queue, POS register, and cafe TV status screen seamlessly coordinated in real time.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => navigate("/display")}
                className="h-12 px-6 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E30] text-white font-black text-xs shadow-lg flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                Launch Live TV Display
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="h-12 px-6 rounded-2xl border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-2"
              >
                <ChefHat className="h-4 w-4 text-[#D97736]" />
                Kitchen Display (KDS)
              </Button>
            </div>
          </div>

          {/* Ambient Glow Graphic */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#C86D3B]/20 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. WARM CAFE EXPERIENCE BENEFITS */}
      {/* ========================================================================= */}
      <section id="experience" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] dark:bg-[#120B06]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#C86D3B] dark:text-[#D97736]">
              Our Promise
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#22150C] dark:text-[#FCF8F2]">
              More than just coffee.
            </h2>
            <p className="text-xs sm:text-sm text-[#786555] dark:text-[#A69180]">
              We believe a great cup of coffee should come with a comfortable, stress-free experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Freshly Roasted & Brewed",
                desc: "100% specialty grade Arabica beans, roasted in small batches and brewed to precision.",
                icon: Coffee,
              },
              {
                title: "Easy Table Ordering",
                desc: "Order and customize directly from your table using smart QR codes with zero wait.",
                icon: QrCode,
              },
              {
                title: "Real-Time Tracking",
                desc: "Know exactly when your drink is being poured and when it is ready at the counter.",
                icon: Clock,
              },
              {
                title: "Crafted to Your Taste",
                desc: "Oat, almond, soy milk choices, sweetness levels, and specialty syrup add-ons.",
                icon: Sliders,
              },
            ].map(({ title, desc, icon: Icon }) => (
              <div
                key={title}
                className="p-6 rounded-3xl border border-[#EDE1D1] dark:border-[#332317] bg-white dark:bg-[#1C130C] space-y-3 shadow-xs hover:border-[#C86D3B]/40 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6EFE6] dark:bg-[#261B12] text-[#C86D3B]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-black text-base text-[#22150C] dark:text-[#FCF8F2]">
                  {title}
                </h3>
                <p className="text-xs text-[#786555] dark:text-[#A69180] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. BOTTOM CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#F6EFE6]/60 dark:bg-[#180F08] border-t border-[#EDE1D1] dark:border-[#332317]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C86D3B]/10 text-[#C86D3B] dark:text-[#D97736] text-xs font-black uppercase">
            <Coffee className="h-3.5 w-3.5" />
            Your table is waiting
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#22150C] dark:text-[#FCF8F2]">
            Ready for your next cup?
          </h2>

          <p className="text-sm sm:text-base text-[#786555] dark:text-[#A69180] max-w-lg mx-auto leading-relaxed">
            Browse our freshly roasted menu, take your seat, and let our baristas craft your favorite coffee.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => navigate("/menu")}
              className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E30] text-white font-black text-sm shadow-xl shadow-[#C86D3B]/25 flex items-center justify-center gap-2"
            >
              <Coffee className="h-4 w-4" />
              Explore Menu & Order
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto h-13 px-6 rounded-2xl border-[#EDE1D1] dark:border-[#332317] bg-white dark:bg-[#1C130C] font-bold text-xs"
            >
              Staff Portal ➔
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. COMPREHENSIVE FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#120B06] text-slate-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-[#332317]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C86D3B] text-white font-black">
                <Coffee className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Cafe Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Specialty neighborhood roastery and smart cafe dining experience. Fresh coffee, freshly baked pastries, and zero waiting in line.
            </p>
            <p className="text-xs text-slate-500 font-medium">
              "Good coffee, good moments."
            </p>
          </div>

          {/* Col 2: Explore */}
          <div className="space-y-3 text-xs">
            <h4 className="font-black uppercase tracking-wider text-white">
              Explore
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Our Menu
                </a>
              </li>
              <li>
                <a href="#qr-order" className="hover:text-white transition-colors">
                  Table QR Order
                </a>
              </li>
              <li>
                <a href="#tracking" className="hover:text-white transition-colors">
                  Live Tracker
                </a>
              </li>
              <li>
                <a href="#experience" className="hover:text-white transition-colors">
                  Cafe Experience
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Visit & Hours */}
          <div className="space-y-3 text-xs">
            <h4 className="font-black uppercase tracking-wider text-white">
              Visit & Hours
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="text-white block font-semibold">Address:</span>
                {business.address || "Mirpur, Dhaka"}
              </li>
              <li>
                <span className="text-white block font-semibold">Hours:</span>
                {business.openingTime || "08:00 AM"} — {business.closingTime || "11:00 PM"}
              </li>
              <li>
                <span className="text-white block font-semibold">Phone:</span>
                {business.phone || "+880 1712-345678"}
              </li>
            </ul>
          </div>

          {/* Col 4: Staff Portals */}
          <div className="space-y-3 text-xs">
            <h4 className="font-black uppercase tracking-wider text-white">
              Staff & Operations
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => navigate("/login")}
                  className="hover:text-white transition-colors text-left"
                >
                  Staff POS Register
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/kitchen")}
                  className="hover:text-white transition-colors text-left"
                >
                  Kitchen Display (KDS)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/display")}
                  className="hover:text-white transition-colors text-left"
                >
                  Cafe TV Status Display
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Cafe Sync Specialty Coffee. All rights reserved.</p>
          <p>Designed with passion for exceptional coffee moments.</p>
        </div>
      </footer>
    </div>
  );
}
