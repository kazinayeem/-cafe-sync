import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetPublicMenuQuery } from "@/services/publicMenuApi";
import { InteractiveCoffeeHero } from "@/components/coffee/InteractiveCoffeeHero";
import {
  Coffee,
  QrCode,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Monitor,
  ChefHat,
  Menu as MenuIcon,
  X,
  Sliders,
  Zap,
  Flame,
  Heart,
  Store,
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

  // Curated specialty items for menu preview
  const categoriesList = [
    { key: "all", label: "All Drinks" },
    { key: "coffee", label: "Espresso & Brews" },
    { key: "specialty", label: "Specialty Drinks" },
    { key: "cold", label: "Cold / Refreshing" },
    { key: "bakery", label: "Artisanal Bakery" },
    { key: "desserts", label: "Desserts" },
  ];

  const fallbackFeatured = [
    {
      _id: "f1",
      name: "Velvet Flat White",
      category: "coffee",
      description: "Double ristretto shot with micro-foamed silky steamed whole milk.",
      price: 240,
      imageUrl:
        "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80",
      tag: "Customer Favorite",
      origin: "Ethiopia Yirgacheffe",
    },
    {
      _id: "f2",
      name: "Caramel Macchiato",
      category: "specialty",
      description: "Freshly pulled espresso layered over vanilla syrup, milk, and rich caramel drizzle.",
      price: 280,
      imageUrl:
        "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80",
      tag: "House Special",
      origin: "Colombia Supremo",
    },
    {
      _id: "f3",
      name: "Nitro Cold Brew",
      category: "cold",
      description: "16-hour slow steeped single-origin coffee infused with nitrogen for a cascading crema.",
      price: 260,
      imageUrl:
        "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
      tag: "Slow Steeped",
      origin: "Guatemala Antigua",
    },
    {
      _id: "f4",
      name: "Butter Almond Croissant",
      category: "bakery",
      description: "Flaky golden French pastry layered with rich almond frangipane and toasted flakes.",
      price: 180,
      imageUrl:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
      tag: "Baked Fresh Daily",
      origin: "Pure French Butter",
    },
    {
      _id: "f5",
      name: "Hazelnut Mocha",
      category: "specialty",
      description: "Rich dark Belgian chocolate ganache blended with double espresso and hazelnut milk.",
      price: 290,
      imageUrl:
        "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80",
      tag: "Barista Pick",
      origin: "Brazil Santos",
    },
    {
      _id: "f6",
      name: "Basque Burnt Cheesecake",
      category: "desserts",
      description: "Caramelized crust with an ultra-creamy, molten cream cheese center.",
      price: 320,
      imageUrl:
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
      tag: "Chef Special",
      origin: "San Sebastián Style",
    },
  ];

  const featuredItems =
    products.length >= 4
      ? products.slice(0, 6).map((p: any, i: number) => ({
          _id: p._id,
          name: p.name,
          category: p.category?.slug || fallbackFeatured[i % fallbackFeatured.length].category,
          description: p.description || "Crafted fresh upon order with specialty roasted beans.",
          price: p.sizes?.small || p.sizes?.large || p.price || 220,
          imageUrl: p.imageUrl || fallbackFeatured[i % fallbackFeatured.length].imageUrl,
          tag: i === 0 ? "Barista Pick" : i === 1 ? "Customer Favorite" : "Freshly Made",
          origin: "Specialty Grade Arabica",
        }))
      : fallbackFeatured;

  const filteredItems =
    activeCategory === "all"
      ? featuredItems
      : featuredItems.filter(
          (item) =>
            item.category?.toLowerCase() === activeCategory.toLowerCase() ||
            activeCategory === "all"
        );

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
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C86D3B] text-white shadow-md shadow-[#C86D3B]/30 group-hover:scale-105 transition-transform duration-300">
              <Coffee className="h-6 w-6 relative z-10" />
              {/* Micro Steam Sparks */}
              <span className="absolute -top-1 left-2.5 w-1 h-2 bg-amber-200/80 rounded-full animate-steam-1" />
              <span className="absolute -top-1.5 left-5 w-1 h-3 bg-amber-200/90 rounded-full animate-steam-2" />
              <span className="absolute -top-0.5 left-7 w-1 h-2 bg-amber-200/70 rounded-full animate-steam-3" />
            </div>

            <div className="flex flex-col">
              <span className="font-serif font-black text-xl tracking-tight text-[#22150C] dark:text-[#FAF4ED] group-hover:text-[#C86D3B] transition-colors">
                {business.name}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8C5D3D] dark:text-[#D4A373]">
                Specialty Coffee Roasters
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#634832] dark:text-[#D8C7B5]">
            <a
              href="#menu-preview"
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors"
            >
              Menu
            </a>
            <a
              href="#story"
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors"
            >
              Our Coffee
            </a>
            <a
              href="#qr-order"
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors flex items-center gap-1.5"
            >
              <QrCode className="h-3.5 w-3.5 text-[#C86D3B]" />
              Table QR Order
            </a>
            <a
              href="#experience"
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors"
            >
              Experience
            </a>
            <button
              onClick={() => navigate("/display")}
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors flex items-center gap-1"
            >
              <Monitor className="h-3.5 w-3.5 text-blue-500" />
              Live Display
            </button>
          </div>

          {/* Action CTAs: Smart QR Order & Staff Access */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              onClick={() => navigate("/menu")}
              className="h-11 px-5 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-black text-xs shadow-md shadow-[#C86D3B]/25 hover:shadow-lg hover:shadow-[#C86D3B]/40 active:scale-98 transition-all flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              Order From Table
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="h-11 px-4 rounded-2xl border-[#D8C7B5] dark:border-[#422F22] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E] text-[#422818] dark:text-[#EFE2D3] font-bold text-xs transition-all"
            >
              Staff POS →
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              onClick={() => navigate("/menu")}
              size="sm"
              className="h-9 px-3 rounded-xl bg-[#C86D3B] text-white font-bold text-xs shadow-xs flex items-center gap-1"
            >
              <QrCode className="h-3.5 w-3.5" />
              Order
            </Button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[#EDE1D1] dark:border-[#332317] text-[#22150C] dark:text-[#FCF8F2] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#EDE1D1] dark:border-[#332317] bg-[#FDFBF7] dark:bg-[#120B06] px-5 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-3 text-sm font-bold">
              <a
                href="#menu-preview"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
              >
                ☕ Our Menu
              </a>
              <a
                href="#story"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
              >
                ✨ How It Works
              </a>
              <a
                href="#qr-order"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
              >
                📱 Smart QR Ordering
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/display");
                }}
                className="text-left p-2.5 rounded-xl hover:bg-[#F2E8DC] dark:hover:bg-[#20150E] flex items-center gap-2"
              >
                <Monitor className="h-4 w-4 text-blue-500" />
                Live Order TV Display
              </button>
            </div>

            <div className="pt-3 border-t border-[#EDE1D1] dark:border-[#332317] grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/menu");
                }}
                className="h-11 rounded-xl bg-[#C86D3B] text-white font-black text-xs"
              >
                Explore Menu
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="h-11 rounded-xl border-[#D8C7B5] dark:border-[#422F22] font-bold text-xs"
              >
                Staff POS →
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION — CINEMATIC INTERACTIVE COFFEE MAKING */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#EDE1D1] dark:border-[#332317]">
        {/* Subtle Warm Background Glow */}
        <div className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-[#EAD4BB]/40 dark:bg-[#2A180E]/40 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-[#F3DECA]/50 dark:bg-[#381F12]/30 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Editorial Copy & Direct CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE3D3] dark:bg-[#261810] border border-[#DFCBB5] dark:border-[#422B1D] text-xs font-black uppercase tracking-widest text-[#8C5D3D] dark:text-[#E8925A] shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-[#C86D3B]" />
                <span>CAFE SYNC · SPECIALTY COFFEE</span>
              </div>

              {/* Display Headline */}
              <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.08]">
                Good coffee. <br />
                <span className="text-[#C86D3B] dark:text-[#E8925A]">
                  Made for good moments.
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-[#5D422E] dark:text-[#C5B4A2] font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Freshly brewed coffee, handcrafted drinks, and a smarter way to
                order from your table.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Button
                  onClick={() => {
                    const el = document.getElementById("menu-preview");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-black text-sm shadow-xl shadow-[#C86D3B]/25 hover:shadow-2xl hover:shadow-[#C86D3B]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Coffee className="h-4 w-4" />
                  Explore Menu
                </Button>

                <Button
                  onClick={() => navigate("/menu")}
                  variant="outline"
                  className="w-full sm:w-auto h-13 px-7 rounded-2xl border-[#D8C7B5] dark:border-[#422F22] bg-[#F7F0E6]/80 dark:bg-[#1E130B]/80 hover:bg-[#EFE4D6] dark:hover:bg-[#2C1C11] text-[#3A2213] dark:text-[#F3E7DC] font-black text-sm transition-all flex items-center justify-center gap-2"
                >
                  <QrCode className="h-4 w-4 text-[#C86D3B]" />
                  Order From Table
                </Button>
              </div>

              {/* Staff POS Secondary Link & Shift Status */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs font-bold text-[#8C6446] dark:text-[#AA9380]">
                <button
                  onClick={() => navigate("/login")}
                  className="hover:text-[#C86D3B] underline underline-offset-4 decoration-amber-500/40 hover:decoration-[#C86D3B] transition-colors"
                >
                  Staff POS →
                </button>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Barista Counter Open ({business.openingTime} – {business.closingTime})
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Coffee Pouring & Cup Animation */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <InteractiveCoffeeHero />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. COFFEE CATEGORIES BAR */}
      {/* ========================================================================= */}
      <section className="bg-[#F7F0E6] dark:bg-[#180F08] border-b border-[#EDE1D1] dark:border-[#332317] py-4 sticky top-20 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categoriesList.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat.key
                    ? "bg-[#C86D3B] text-white shadow-md shadow-[#C86D3B]/25"
                    : "bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#C5B4A2] hover:bg-[#E6D6C2] dark:hover:bg-[#342217]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. COFFEE MENU PREVIEW ("Made fresh, just for you") */}
      {/* ========================================================================= */}
      <section id="menu-preview" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-black uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
            <Flame className="h-3.5 w-3.5 text-[#C86D3B]" />
            <span>Roasted With Purpose</span>
          </div>

          <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
            Made fresh, just for you
          </h2>

          <p className="text-sm sm:text-base text-[#6E4F39] dark:text-[#BDB0A2] font-medium">
            From bold espresso to creamy lattes, find your favorite.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate("/menu")}
              className="group relative rounded-3xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] p-5 shadow-xs hover:shadow-xl hover:border-[#C86D3B]/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {/* Product Visual Banner */}
              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-[#EFE4D6] dark:bg-[#261810] mb-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badge Tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 dark:bg-black/90 text-[#3A2213] dark:text-[#FAF4ED] backdrop-blur-xs shadow-xs">
                    {item.tag}
                  </span>
                </div>

                {/* Origin Pill */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-white/90">
                  <Coffee className="h-3 w-3 text-amber-300" />
                  <span>{item.origin}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-4">
                <h3 className="font-serif font-black text-xl text-[#22150C] dark:text-[#FAF4ED] group-hover:text-[#C86D3B] transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-[#6E4F39] dark:text-[#BDB0A2] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-[#EDE1D1] dark:border-[#332317] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6446] dark:text-[#9F8A77] block">
                    Starting From
                  </span>
                  <span className="text-xl font-black font-tabular text-[#C86D3B] dark:text-[#E8925A]">
                    ৳{item.price}
                  </span>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/menu");
                  }}
                  className="h-9 px-4 rounded-xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  Order
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Menu CTA Button */}
        <div className="text-center pt-4">
          <Button
            onClick={() => navigate("/menu")}
            className="h-12 px-8 rounded-2xl bg-[#3C2415] hover:bg-[#28160B] dark:bg-[#FAF4ED] dark:hover:bg-white dark:text-[#120B06] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 mx-auto"
          >
            <span>View Complete Specialty Menu ({products.length || 18}+ items)</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. "FROM OUR COUNTER TO YOUR TABLE" (Storytelling Step Flow) */}
      {/* ========================================================================= */}
      <section id="story" className="py-16 sm:py-24 bg-[#F5ECE0] dark:bg-[#160E08] border-y border-[#EDE1D1] dark:border-[#332317]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-[#8C5D3D] dark:text-[#D4A373]">
              The Cafe Experience
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
              From our counter to your table.
            </h2>
            <p className="text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2] font-medium">
              A seamless coffee journey crafted for peaceful mornings and great conversations.
            </p>
          </div>

          {/* 4 Interactive Story Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Choose your coffee",
                desc: "Explore single-origin beans, house roasts, and seasonal specialty brews.",
                icon: Coffee,
              },
              {
                step: "02",
                title: "Customize your drink",
                desc: "Select your roast, oat/almond milk, sweet balance, or add extra espresso shots.",
                icon: Sliders,
              },
              {
                step: "03",
                title: "We prepare it fresh",
                desc: "Our baristas grind to order, pull precision shots, and craft smooth latte art.",
                icon: ChefHat,
              },
              {
                step: "04",
                title: "Pick it up and enjoy",
                desc: "Track live ticket updates on your phone or cafe TV display, then savor every sip.",
                icon: Heart,
              },
            ].map((stepItem, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#FAF6F0] dark:bg-[#1F140D] border border-[#E9DAC8] dark:border-[#382417] space-y-4 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C86D3B]/15 text-[#C86D3B]">
                    <stepItem.icon className="h-6 w-6" />
                  </div>
                  <span className="font-serif font-black text-3xl text-[#D8C7B5] dark:text-[#422F22]">
                    {stepItem.step}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif font-black text-lg text-[#22150C] dark:text-[#FAF4ED]">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-[#6E4F39] dark:text-[#BDB0A2] leading-relaxed">
                    {stepItem.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SMART QR ORDERING ("Skip the queue. Keep the coffee.") */}
      {/* ========================================================================= */}
      <section id="qr-order" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#FAF5EE] via-[#F4E9DC] to-[#E9D6C3] dark:from-[#24170F] dark:via-[#1D120A] dark:to-[#140C07] border border-[#DFCBB5] dark:border-[#382417] p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden">
          {/* Background Decorative SVG */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 opacity-10 pointer-events-none">
            <QrCode className="w-full h-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-black uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
                <Zap className="h-3.5 w-3.5 text-[#C86D3B]" />
                <span>Contactless Table Experience</span>
              </div>

              <h2 className="font-serif font-black text-3xl sm:text-5xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.12]">
                Skip the queue. <br />
                <span className="text-[#C86D3B] dark:text-[#E8925A]">
                  Keep the coffee.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-[#5D422E] dark:text-[#C5B4A2] font-medium leading-relaxed max-w-xl">
                Scan the QR code at your table, explore the menu, place your order, and
                follow it in real time without waiting in line.
              </p>

              {/* Visual Flow Indicator: SCAN -> ORDER -> PREPARING -> READY */}
              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/30 border border-[#DFCBB5]/70 dark:border-[#382417] max-w-md">
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-black uppercase tracking-wider">
                  <div className="p-1.5 rounded-lg bg-[#C86D3B] text-white">1. SCAN</div>
                  <div className="p-1.5 rounded-lg bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">
                    2. ORDER
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">
                    3. BREWING
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">
                    4. READY
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate("/menu")}
                  className="h-12 px-7 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-black text-xs shadow-lg shadow-[#C86D3B]/25 flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Order From Table
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/display")}
                  className="h-12 px-6 rounded-2xl border-[#DFCBB5] dark:border-[#422F22] font-bold text-xs flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4 text-blue-600" />
                  Open Live TV Display
                </Button>
              </div>
            </div>

            {/* Right: Real-Time Order Tracking Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm p-6 rounded-3xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] shadow-2xl space-y-4">
                {/* Ticket Header */}
                <div className="flex items-center justify-between border-b border-[#EDE1D1] dark:border-[#332317] pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
                      LIVE ORDER SIMULATION
                    </span>
                    <h4 className="font-serif font-black text-2xl text-[#22150C] dark:text-[#FAF4ED]">
                      ORDER #A1025
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                    ● Preparing
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#5D422E] dark:text-[#C5B4A2]">
                    <span className="font-bold text-[#22150C] dark:text-[#FAF4ED]">
                      1× Velvet Flat White (Oat Milk)
                    </span>
                    <span className="font-tabular font-bold">৳240</span>
                  </div>
                  <div className="flex justify-between items-center text-[#5D422E] dark:text-[#C5B4A2]">
                    <span className="font-bold text-[#22150C] dark:text-[#FAF4ED]">
                      1× Butter Almond Croissant
                    </span>
                    <span className="font-tabular font-bold">৳180</span>
                  </div>
                </div>

                {/* Live Preparation Steps */}
                <div className="space-y-2 pt-2 border-t border-[#EDE1D1] dark:border-[#332317]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8C6446] dark:text-[#9F8A77] block">
                    Preparation Progress (Est. 5–7 mins)
                  </span>
                  <div className="space-y-1.5 text-xs font-semibold">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Order received & recorded</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#C86D3B] font-black">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-[#C86D3B] border-t-transparent animate-spin" />
                      <span>Barista is brewing your espresso</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#9F8A77] opacity-60">
                      <span className="h-3.5 w-3.5 rounded-full border border-[#9F8A77]" />
                      <span>Ready to serve at pickup counter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CAFE ATMOSPHERE SECTION ("More than just a cup.") */}
      {/* ========================================================================= */}
      <section id="experience" className="py-16 sm:py-24 bg-[#F7F0E6] dark:bg-[#160E08] border-t border-[#EDE1D1] dark:border-[#332317]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-[#8C5D3D] dark:text-[#D4A373]">
              The Atmosphere
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
              More than just a cup.
            </h2>
            <p className="text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2] font-medium">
              Freshly brewed coffee • Warm pastries • Quiet mornings • Good conversations.
            </p>
          </div>

          {/* Lifestyle Visuals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative h-72 rounded-3xl overflow-hidden shadow-md group">
              <img
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80"
                alt="Cafe ambiance"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Ambiance
                </span>
                <h4 className="font-serif font-black text-xl">Quiet Mornings</h4>
                <p className="text-xs text-white/80 mt-1">
                  Cozy warm lighting and slow jazz for your reading or remote work.
                </p>
              </div>
            </div>

            <div className="relative h-72 rounded-3xl overflow-hidden shadow-md group">
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
                alt="Barista brewing"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Craftsmanship
                </span>
                <h4 className="font-serif font-black text-xl">Freshly Pulled Shots</h4>
                <p className="text-xs text-white/80 mt-1">
                  100% Arabica beans calibrated and tamped with meticulous care.
                </p>
              </div>
            </div>

            <div className="relative h-72 rounded-3xl overflow-hidden shadow-md group">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
                alt="Artisanal bakery"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Bakery
                </span>
                <h4 className="font-serif font-black text-xl">Warm Pastries</h4>
                <p className="text-xs text-white/80 mt-1">
                  Baked in-house every morning with real butter and pure chocolate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#EDE1D1] dark:bg-[#120B06] border-t border-[#DFCBB5] dark:border-[#332317] py-14 text-xs font-medium text-[#6E4F39] dark:text-[#A89684]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#DFCBB5]/80 dark:border-[#332317]">
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C86D3B] text-white">
                  <Coffee className="h-5 w-5" />
                </div>
                <span className="font-serif font-black text-lg text-[#22150C] dark:text-[#FAF4ED]">
                  {business.name}
                </span>
              </div>
              <p className="text-xs text-[#6E4F39] dark:text-[#A89684] leading-relaxed">
                Specialty coffee roastery, artisanal brews, and smart dining experience.
              </p>
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#22150C] dark:text-[#FAF4ED] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#C86D3B]" />
                Operating Hours
              </h5>
              <p>Monday – Sunday</p>
              <p className="font-black text-[#22150C] dark:text-[#FAF4ED]">
                {business.openingTime} – {business.closingTime}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                ● Fresh Roasts Served Daily
              </p>
            </div>

            {/* Location & Contact */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#22150C] dark:text-[#FAF4ED] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#C86D3B]" />
                Find Our Cafe
              </h5>
              <p>{business.address}</p>
              <p className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-[#C86D3B]" />
                {business.phone}
              </p>
            </div>

            {/* System Quick Links */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#22150C] dark:text-[#FAF4ED] flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-[#C86D3B]" />
                Quick Navigation
              </h5>
              <div className="flex flex-col space-y-1.5 font-bold">
                <button
                  onClick={() => navigate("/menu")}
                  className="text-left hover:text-[#C86D3B] transition-colors"
                >
                  📱 Public QR Menu
                </button>
                <button
                  onClick={() => navigate("/display")}
                  className="text-left hover:text-[#C86D3B] transition-colors"
                >
                  📺 Live Order TV Display
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="text-left hover:text-[#C86D3B] transition-colors"
                >
                  🔐 Staff POS Register
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8C6446] dark:text-[#887463]">
            <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
            <p>Freshly brewed with passion & precision.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
