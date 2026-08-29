import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useGetPublicMenuQuery } from "@/services/publicMenuApi";
import { BanglaCoffeeQuotes } from "@/components/coffee/BanglaCoffeeQuotes";
import { CoffeeCultureLifestyle } from "@/components/coffee/CoffeeCultureLifestyle";
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
  Flame,
  Heart,
  Store,
  Sun,
  Users,
  Smile,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function App() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Dynamic navbar scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load public menu items
  const { data: menuData } = useGetPublicMenuQuery();

  const business = {
    name: "BornoCafe",
    address: "সেক্টর ১১, উত্তরা, ঢাকা • মিরপুর ১২, ঢাকা",
    phone: "+৮৮০ ১৭১১-২২৩৩৪৪",
    openingTime: "০৮:০০ সকাল",
    closingTime: "১১:০০ রাত",
  };

  const products = menuData?.data?.products || [];

  // Curated specialty categories in natural Bangla
  const categoriesList = [
    { key: "all", label: "সবগুলো" },
    { key: "coffee", label: "কফি" },
    { key: "specialty", label: "বিশেষ পানীয়" },
    { key: "cold", label: "ঠান্ডা পানীয়" },
    { key: "smoothies", label: "স্মুদি" },
    { key: "snacks", label: "স্ন্যাকস ও পেস্ট্রি" },
  ];

  const fallbackFeatured = [
    {
      _id: "f1",
      name: "ভেলভেট ফ্ল্যাট হোয়াইট",
      englishName: "Velvet Flat White",
      category: "coffee",
      description:
        "ডাবল রিস্ট্রেত্তো এসপ্রেসো শট ও নিখুঁত মাইক্রো-ফোম সিল্কি স্টিমড মিল্কের চমৎকার ব্লেন্ড।",
      price: 240,
      imageUrl:
        "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80",
      tag: "জনপ্রিয় পছন্দ",
      origin: "ইথিওপিয়া ইয়ারগাচেফ",
      size: "Regular (8oz)",
    },
    {
      _id: "f2",
      name: "ক্যারামেল মাকিয়াটো",
      englishName: "Caramel Macchiato",
      category: "specialty",
      description:
        "ফ্রেশ এসপ্রেসো, সুগন্ধি ভ্যানিলা সিরাপ এবং সমৃদ্ধ ক্যারামেল ড্রপসের লোভনীয় মেলবন্ধন।",
      price: 280,
      imageUrl:
        "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80",
      tag: "হাউস স্পেশাল",
      origin: "কলম্বিয়া সুপ্রিমো",
      size: "Large (12oz)",
    },
    {
      _id: "f3",
      name: "নাইট্রো কোল্ড ব্রিউ",
      englishName: "Nitro Cold Brew",
      category: "cold",
      description:
        "১৬ ঘণ্টা ধীর প্রক্রিয়ায় প্রস্তুত সিঙ্গেল-অরিজিন কোল্ড কফি ও তুলতুলে নাইট্রো ক্রেমার পরশ।",
      price: 260,
      imageUrl:
        "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
      tag: "ধীর প্রক্রিয়ায় প্রস্তুত",
      origin: "গুয়াতেমালা অ্যান্টিগুয়া",
      size: "Tall (10oz)",
    },
    {
      _id: "f4",
      name: "বাটার আলমন্ড ক্রসাঁ",
      englishName: "Butter Almond Croissant",
      category: "snacks",
      description:
        "খাস্তা গোল্ডেন ফ্রেঞ্চ প্যাস্ট্রি, আলমন্ড ফ্র্যাঞ্জিপেন ও কুড়মুড়ে বাদামের দারুণ স্বাদ।",
      price: 180,
      imageUrl:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
      tag: "প্রতিদিন ওভেনে ফ্রেশ",
      origin: "খাঁটি ফ্রেঞ্চ বাটার",
      size: "Fresh Baked",
    },
    {
      _id: "f5",
      name: "হ্যাজেলনাট মোকা",
      englishName: "Hazelnut Mocha",
      category: "specialty",
      description:
        "বেলজিয়ান ডার্ক চকোলেট গানাশ, ডাবল এসপ্রেসো ও হ্যাজেলনাট মিল্কের ঘন উষ্ণতা।",
      price: 290,
      imageUrl:
        "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80",
      tag: "বারিস্তার পছন্দ",
      origin: "ব্রাজিল সান্তোস",
      size: "Medium (10oz)",
    },
    {
      _id: "f6",
      name: "বাস্ক বার্নট চিজকেক",
      englishName: "Basque Burnt Cheesecake",
      category: "snacks",
      description:
        "খাস্তা ক্যারামেলাইজড ক্রাস্ট ও ভেতরে তুলতুলে মেল্টিং ক্রিম চিজের স্বর্গীয় স্বাদ।",
      price: 320,
      imageUrl:
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
      tag: "শেফ স্পেশাল",
      origin: "সান সেবাস্তিয়ান স্টাইল",
      size: "1 Slice",
    },
  ];

  const featuredItems =
    products.length >= 4
      ? products.slice(0, 6).map((p: any, i: number) => ({
          _id: p._id,
          name: p.name,
          englishName: p.name,
          category:
            p.category?.slug ||
            fallbackFeatured[i % fallbackFeatured.length].category,
          description:
            p.description ||
            "প্রতিটি অর্ডার তাজা কফি বিন ও নিখুঁত যত্নের সাথে প্রস্তুত করা হয়।",
          price: p.sizes?.small || p.sizes?.large || p.price || 220,
          imageUrl:
            p.imageUrl ||
            fallbackFeatured[i % fallbackFeatured.length].imageUrl,
          tag:
            i === 0
              ? "বারিস্তার পছন্দ"
              : i === 1
              ? "জনপ্রিয় কফি"
              : "তাজা তৈরি",
          origin: "স্পেশালিটি অ্যারাবিকা",
          size: "Regular",
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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#120B06] text-[#22150C] dark:text-[#FCF8F2] selection:bg-[#C86D3B]/20 selection:text-[#3C2415] font-bangla-sans overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. NAVBAR */}
      {/* ========================================================================= */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#FDFBF7]/95 dark:bg-[#120B06]/95 backdrop-blur-md shadow-xs border-b border-[#EDE1D1] dark:border-[#332317] py-2.5"
            : "bg-[#FDFBF7]/85 dark:bg-[#120B06]/85 backdrop-blur-xs border-b border-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo with Steam Micro-Interaction */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-[#C86D3B] text-white shadow-md shadow-[#C86D3B]/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Coffee className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
              {/* Micro Steam Sparks */}
              <span className="absolute -top-1 left-2.5 w-1 h-2 bg-amber-200/80 rounded-full animate-steam-1" />
              <span className="absolute -top-1.5 left-5 w-1 h-3 bg-amber-200/90 rounded-full animate-steam-2" />
              <span className="absolute -top-0.5 left-7 w-1 h-2 bg-amber-200/70 rounded-full animate-steam-3" />
            </div>

            <div className="flex flex-col">
              <span className="font-bangla-serif font-black text-xl tracking-tight text-[#22150C] dark:text-[#FAF4ED] group-hover:text-[#C86D3B] transition-colors leading-tight">
                {business.name}
              </span>
              <span className="text-[10px] sm:text-[11px] font-normal text-[#8C5D3D] dark:text-[#D4A373]">
                কফির সাথে ছোট্ট কিছু মুহূর্ত
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#634832] dark:text-[#D8C7B5]">
            <a
              href="#menu"
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors"
            >
              মেনু
            </a>
            <button
              onClick={() => navigate("/find-my-coffee")}
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors flex items-center gap-1.5 font-bold text-[#C86D3B]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C86D3B]" />
              <span>কফি খুঁজুন</span>
            </button>
            <a
              href="#story"
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors"
            >
              আমাদের গল্প
            </a>
            <a
              href="#bean-to-cup"
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors"
            >
              কফি প্রক্রিয়া
            </a>
            <a
              href="#atmosphere"
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors"
            >
              ক্যাফে দর্শন
            </a>
            <a
              href="#contact"
              className="hover:text-[#C86D3B] dark:hover:text-[#E8925A] transition-colors"
            >
              যোগাযোগ
            </a>
          </div>

          {/* Action CTAs: Smart QR Order & Staff Access */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="h-10 px-4 rounded-2xl border-[#D8C7B5] dark:border-[#422F22] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E] text-[#422818] dark:text-[#EFE2D3] font-bold text-xs transition-all"
            >
              স্টাফ POS →
            </Button>

            <Button
              onClick={() => navigate("/menu")}
              className="h-10 px-5 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-bold text-xs shadow-md shadow-[#C86D3B]/25 hover:shadow-lg hover:shadow-[#C86D3B]/40 active:scale-98 transition-all flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              টেবিল থেকে অর্ডার
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
              অর্ডার
            </Button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[#EDE1D1] dark:border-[#332317] text-[#22150C] dark:text-[#FCF8F2] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#EDE1D1] dark:border-[#332317] bg-[#FDFBF7] dark:bg-[#120B06] px-5 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-3 text-sm font-semibold">
              <a
                href="#menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
              >
                ☕ মেনু দেখুন
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/find-my-coffee");
                }}
                className="p-2.5 rounded-xl text-left font-bold text-[#C86D3B] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E] flex items-center gap-2"
              >
                ✨ আমার কফি খুঁজুন
              </button>
              <a
                href="#story"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
              >
                ✨ আমাদের গল্প
              </a>
              <a
                href="#bean-to-cup"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
              >
                🌱 কফি প্রক্রিয়া
              </a>
              <a
                href="#atmosphere"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
              >
                🌿 ক্যাফে দর্শন
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
              >
                📍 যোগাযোগ
              </a>
            </div>

            <div className="pt-3 border-t border-[#EDE1D1] dark:border-[#332317] grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="h-11 rounded-xl border-[#D8C7B5] dark:border-[#422F22] font-bold text-xs"
              >
                স্টাফ POS →
              </Button>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/menu");
                }}
                className="h-11 rounded-xl bg-[#C86D3B] text-white font-bold text-xs"
              >
                টেবিল থেকে অর্ডার
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#EDE1D1] dark:border-[#332317]">
        {/* Subtle Ambient Atmosphere Elements */}
        <div className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-[#EAD4BB]/35 dark:bg-[#2A180E]/35 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-[#F3DECA]/45 dark:bg-[#381F12]/25 blur-3xl -z-10 pointer-events-none" />

        {/* Slow Floating Ambient Coffee Bean Particles */}
        <div className="absolute top-20 left-10 text-xl opacity-15 pointer-events-none animate-bean-drift-1 select-none">
          ☕
        </div>
        <div className="absolute bottom-24 left-1/3 text-lg opacity-15 pointer-events-none animate-bean-drift-2 select-none">
          🌿
        </div>
        <div className="absolute top-32 right-12 text-xl opacity-15 pointer-events-none animate-bean-drift-3 select-none">
          ☕
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Editorial Copy & Direct CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE3D3] dark:bg-[#261810] border border-[#DFCBB5] dark:border-[#422B1D] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#E8925A] shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-[#C86D3B]" />
                <span>BORNOCAFE · SPECIALTY COFFEE</span>
              </div>

              {/* Display Headline in Noto Serif Bengali */}
              <h1 className="font-bangla-serif font-black text-4xl sm:text-5xl lg:text-6xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.18]">
                এক কাপ কফি, <br />
                <span className="text-[#C86D3B] dark:text-[#E8925A]">
                  একটু আপন সময়।
                </span>
              </h1>

              {/* Supporting Natural Bangla Copy */}
              <p className="text-base sm:text-lg text-[#5D422E] dark:text-[#C5B4A2] font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed">
                তাজা কফি, সুন্দর কিছু গল্প, আর আপনার জন্য একটু নিজের সময়।
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Button
                  onClick={() => {
                    const el = document.getElementById("menu");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-bold text-sm shadow-xl shadow-[#C86D3B]/25 hover:shadow-2xl hover:shadow-[#C86D3B]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coffee className="h-4 w-4" />
                  মেনু দেখুন
                </Button>

                <Button
                  onClick={() => navigate("/menu")}
                  variant="outline"
                  className="w-full sm:w-auto h-13 px-7 rounded-2xl border-[#D8C7B5] dark:border-[#422F22] bg-[#F7F0E6]/80 dark:bg-[#1E130B]/80 hover:bg-[#EFE4D6] dark:hover:bg-[#2C1C11] text-[#3A2213] dark:text-[#F3E7DC] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="h-4 w-4 text-[#C86D3B]" />
                  টেবিল থেকে অর্ডার
                </Button>
              </div>

              {/* Rotating Bangla Poetic Coffee Quote Accent */}
              <div className="pt-1 flex justify-center lg:justify-start">
                <BanglaCoffeeQuotes />
              </div>

              {/* Barista Shift Status */}
              <div className="pt-1 flex items-center justify-center lg:justify-start gap-3 text-xs font-semibold text-[#8C6446] dark:text-[#AA9380]">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  বারিস্তা কাউন্টার খোলা ({business.openingTime} – {business.closingTime})
                </span>
                <span>•</span>
                <span className="text-muted-foreground/80">মিরপুর ও উত্তরা</span>
              </div>
            </div>

            {/* Right Column: Romantic Cafe Hero Photograph */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div className="relative w-full max-w-lg lg:max-w-none group">
                {/* Subtle Warm Glow Backdrop */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#EAD4BB]/60 via-[#F3DECA]/40 to-[#E0C7AA]/50 dark:from-[#3A1E0E]/40 dark:via-[#261309]/30 dark:to-[#4A2612]/30 rounded-[32px] sm:rounded-[40px] blur-2xl -z-10 group-hover:scale-105 transition-all duration-500 pointer-events-none" />

                {/* Hero Image Container with Gentle Breathing Animation */}
                <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-[#3C2415]/15 dark:shadow-black/50 border border-[#E9DAC8]/90 dark:border-[#3A2417] bg-[#EFE4D6] dark:bg-[#1A1009] transition-all duration-500 hover:scale-[1.015] animate-hero-breathe">
                  <img
                    src="/heroimage.png"
                    alt="বর্নোক্যাফেতে কফি উপভোগরত এক জুটি"
                    className="w-full h-80 sm:h-[440px] lg:h-[480px] xl:h-[520px] object-cover object-center"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MENU SECTION ("আজকের কফি কোনটা?") */}
      {/* ========================================================================= */}
      <section
        id="menu"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
            <Flame className="h-3.5 w-3.5 text-[#C86D3B]" />
            <span>সতেজ রোস্ট ও নিখুঁত স্বাদ</span>
          </div>

          <h2 className="font-bangla-serif font-black text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
            আজকের কফি কোনটা?
          </h2>

          <p className="text-sm sm:text-base text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-relaxed">
            সতেজভাবে তৈরি, আপনার দিনের ছোট্ট আনন্দের জন্য।
          </p>

          {/* Category Filter Pills */}
          <div className="pt-3 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categoriesList.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat.key
                    ? "bg-[#C86D3B] text-white shadow-sm"
                    : "bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#C5B4A2] hover:bg-[#E6D6C2] dark:hover:bg-[#342217]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid (3 col desktop, 2 col tablet, 1 col mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate("/menu")}
              className="group relative rounded-3xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] p-5 shadow-xs hover:shadow-xl hover:border-[#C86D3B]/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {/* Product Image */}
              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-[#EFE4D6] dark:bg-[#261810] mb-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-106"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badge Tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 dark:bg-black/90 text-[#3A2213] dark:text-[#FAF4ED] backdrop-blur-xs shadow-xs">
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
                <div>
                  <h3 className="font-bangla-serif font-black text-xl text-[#22150C] dark:text-[#FAF4ED] group-hover:text-[#C86D3B] transition-colors">
                    {item.name}
                  </h3>
                  {item.englishName && (
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      {item.englishName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6E4F39] dark:text-[#BDB0A2] line-clamp-2 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-[#EDE1D1] dark:border-[#332317] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6446] dark:text-[#9F8A77] block">
                    {item.size || "শুরু মাত্র"}
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
                  className="h-9 px-4 rounded-xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  অর্ডার করুন
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Menu CTA Button */}
        <div className="text-center pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/menu")}
              className="h-12 px-8 rounded-2xl bg-[#3C2415] hover:bg-[#28160B] dark:bg-[#FAF4ED] dark:hover:bg-white dark:text-[#120B06] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>
                সম্পূর্ণ মেনু দেখুন ({products.length || 18}+ আইটেম)
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => navigate("/find-my-coffee")}
              variant="outline"
              className="h-12 px-7 rounded-2xl border-[#C86D3B] text-[#C86D3B] hover:bg-[#C86D3B] hover:text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>আপনার কফি খুঁজে নিন (কুইজ)</span>
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. COFFEE STORY SECTION ("কফির কাপে কিছু গল্প থেকে যায়") */}
      {/* ========================================================================= */}
      <section
        id="story"
        className="py-16 sm:py-24 bg-[#F5ECE0] dark:bg-[#160E08] border-y border-[#EDE1D1] dark:border-[#332317]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Story Visual Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden shadow-lg border border-[#DFCBB5] dark:border-[#382417]">
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
                  alt="Barista crafting coffee"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    আমাদের গল্প
                  </span>
                  <h4 className="font-bangla-serif font-black text-xl">
                    প্রতিটি কাপে ভালোবাসা
                  </h4>
                  <p className="text-xs text-white/80 mt-1">
                    ঢাকায় বসে বিশ্বমানের স্পেশালিটি কফির অনন্য অনুভূতি।
                  </p>
                </div>
              </div>
            </div>

            {/* Story Editorial Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
                <Heart className="h-3.5 w-3.5 text-[#C86D3B]" />
                <span>আমাদের ভাবনা</span>
              </div>

              <h2 className="font-bangla-serif font-black text-3xl sm:text-5xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.2]">
                কফির কাপে কিছু <br />
                <span className="text-[#C86D3B] dark:text-[#E8925A]">
                  গল্প থেকে যায়।
                </span>
              </h2>

              <p className="text-base text-[#5D422E] dark:text-[#C5B4A2] font-normal leading-relaxed">
                সকালের প্রথম কাপে যেমন নতুন দিনের শুরু, তেমনি বিকেলের এক কাপ কফি
                হতে পারে একটু নিজের কাছে ফিরে আসার সময়।
              </p>

              <p className="text-sm text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-relaxed">
                কখনো বন্ধুদের সাথে আড্ডা, কখনো প্রিয় মানুষের সাথে কিছুটা সময়,
                আবার কখনো শুধু নিজের সাথে নীরব একটা বিকেল। কফি হয়তো মুহূর্তটাকে
                বদলে দেয় না, তবে মুহূর্তটাকে একটু বেশি সুন্দর করে তোলে।
              </p>

              <div className="pt-2 flex items-center gap-6 text-xs font-semibold text-[#8C6446] dark:text-[#AA9380]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>১০০% সিঙ্গেল অরিজিন বিন</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>হাতে তৈরি লাতে আর্ট</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. "FROM BEAN TO CUP" SECTION ("বীজ থেকে আপনার কাপ পর্যন্ত") */}
      {/* ========================================================================= */}
      <section
        id="bean-to-cup"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8C5D3D] dark:text-[#D4A373]">
            কফি প্রক্রিয়া
          </span>
          <h2 className="font-bangla-serif font-black text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
            বীজ থেকে আপনার কাপ পর্যন্ত
          </h2>
          <p className="text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-relaxed">
            প্রতিটি ধাপে থাকে চরম সতর্কতা, নিখুঁত মাপ এবং আন্তরিক ভালোবাসা।
          </p>
        </div>

        {/* 4 Minimal Story Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "০১",
              title: "ভালো কফি বাছাই",
              desc: "সেরা সিঙ্গেল অরিজিন ও স্পেশালিটি অ্যারাবিকা কফি বিনের সতেজ সংগ্রহ।",
              icon: Coffee,
            },
            {
              step: "০২",
              title: "সতেজভাবে গ্রাইন্ড",
              desc: "প্রতিটি অর্ডারের সময় অন-ডিমান্ড প্রিসিশন গ্রাইন্ডিং।",
              icon: Sliders,
            },
            {
              step: "০৩",
              title: "যত্নে ব্রু করা",
              desc: "৯৩°C ক্যালিব্রেটেড তাপমাত্রা ও নিখুঁত ৯-বার প্রেসার এক্সট্রাকশন।",
              icon: ChefHat,
            },
            {
              step: "০৪",
              title: "আপনার হাতে পৌঁছে দেওয়া",
              desc: "টেবিলে গরম কফি, মন জুড়ানো সুবাস ও সিল্কি লাতে আর্ট।",
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
                <span className="font-bangla-serif font-black text-2xl text-[#D8C7B5] dark:text-[#422F22]">
                  {stepItem.step}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bangla-serif font-black text-lg text-[#22150C] dark:text-[#FAF4ED]">
                  {stepItem.title}
                </h3>
                <p className="text-xs text-[#6E4F39] dark:text-[#BDB0A2] leading-relaxed font-normal">
                  {stepItem.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TABLE QR ORDERING SECTION ("আপনার টেবিল থেকেই অর্ডার করুন") */}
      {/* ========================================================================= */}
      <section
        id="qr-order"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="rounded-3xl bg-gradient-to-br from-[#FAF5EE] via-[#F4E9DC] to-[#E9D6C3] dark:from-[#24170F] dark:via-[#1D120A] dark:to-[#140C07] border border-[#DFCBB5] dark:border-[#382417] p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden">
          {/* Background Decorative SVG */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 opacity-10 pointer-events-none">
            <QrCode className="w-full h-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
                <Sparkles className="h-3.5 w-3.5 text-[#C86D3B]" />
                <span>স্মার্ট ক্যাফে সার্ভিস</span>
              </div>

              <h2 className="font-bangla-serif font-black text-3xl sm:text-5xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.2]">
                আপনার টেবিল থেকেই <br />
                <span className="text-[#C86D3B] dark:text-[#E8925A]">
                  অর্ডার করুন।
                </span>
              </h2>

              <p className="text-sm sm:text-base text-[#5D422E] dark:text-[#C5B4A2] font-normal leading-relaxed max-w-xl">
                QR স্ক্যান করুন, পছন্দের কফি বেছে নিন, আর অপেক্ষা করুন আপনার
                অর্ডারের জন্য।
              </p>

              {/* Visual Flow Indicator */}
              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/30 border border-[#DFCBB5]/70 dark:border-[#382417] max-w-md">
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold uppercase tracking-wider">
                  <div className="p-1.5 rounded-lg bg-[#C86D3B] text-white">
                    ১. স্ক্যান
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">
                    ২. অর্ডার
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">
                    ৩. প্রস্তুত
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">
                    ৪. পরিবেশন
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate("/menu")}
                  className="h-12 px-7 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-bold text-xs shadow-lg shadow-[#C86D3B]/25 flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  অর্ডার শুরু করুন
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/display")}
                  className="h-12 px-6 rounded-2xl border-[#DFCBB5] dark:border-[#422F22] font-bold text-xs flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4 text-blue-600" />
                  লাইভ টিভি ডিসপ্লে
                </Button>
              </div>
            </div>

            {/* Right: Real-Time Order Tracking Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm p-6 rounded-3xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] shadow-2xl space-y-4">
                {/* Ticket Header */}
                <div className="flex items-center justify-between border-b border-[#EDE1D1] dark:border-[#332317] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
                      আপনার অর্ডার এখন কোথায়?
                    </span>
                    <h4 className="font-bangla-serif font-black text-2xl text-[#22150C] dark:text-[#FAF4ED]">
                      অর্ডার #A1025
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                    ● কফি তৈরি হচ্ছে
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#5D422E] dark:text-[#C5B4A2]">
                    <span className="font-bold text-[#22150C] dark:text-[#FAF4ED]">
                      ১× ভেলভেট ফ্ল্যাট হোয়াইট (ওট মিল্ক)
                    </span>
                    <span className="font-tabular font-bold">৳২৪০</span>
                  </div>
                  <div className="flex justify-between items-center text-[#5D422E] dark:text-[#C5B4A2]">
                    <span className="font-bold text-[#22150C] dark:text-[#FAF4ED]">
                      ১× বাটার আলমন্ড ক্রসাঁ
                    </span>
                    <span className="font-tabular font-bold">৳১৮০</span>
                  </div>
                </div>

                {/* Live Preparation Steps */}
                <div className="space-y-2 pt-2 border-t border-[#EDE1D1] dark:border-[#332317]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6446] dark:text-[#9F8A77] block">
                    প্রস্তুতি অগ্রগতি (আনুমানিক ৫–৭ মিনিট)
                  </span>
                  <div className="space-y-1.5 text-xs font-medium">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>অর্ডার নেওয়া হয়েছে ও নিশ্চিত</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#C86D3B] font-bold">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-[#C86D3B] border-t-transparent animate-spin" />
                      <span>কফি তৈরি হচ্ছে</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#9F8A77] opacity-60">
                      <span className="h-3.5 w-3.5 rounded-full border border-[#9F8A77]" />
                      <span>পরিবেশন করা হচ্ছে</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CAFE ATMOSPHERE SECTION ("কফির চেয়েও বেশি কিছু") */}
      {/* ========================================================================= */}
      <section
        id="atmosphere"
        className="py-16 sm:py-24 bg-[#F7F0E6] dark:bg-[#160E08] border-t border-[#EDE1D1] dark:border-[#332317]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8C5D3D] dark:text-[#D4A373]">
              ক্যাফে অনুভূতি
            </span>
            <h2 className="font-bangla-serif font-black text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
              কফির চেয়েও বেশি কিছু
            </h2>
            <p className="text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-relaxed">
              একটি শান্ত, নান্দনিক, আধুনিক কফি শপ — যেখানে কফি শুধু পানীয় নয়,
              ছোট্ট একটি অনুভূতি।
            </p>
          </div>

          {/* 4 Atmospheric Emotion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-7 rounded-3xl bg-[#FAF6F0] dark:bg-[#1F140D] border border-[#E9DAC8] dark:border-[#382417] space-y-3 shadow-xs hover:shadow-md transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Sun className="h-6 w-6" />
              </div>
              <h3 className="font-bangla-serif font-black text-lg text-[#22150C] dark:text-[#FAF4ED]">
                সকালের নীরবতা
              </h3>
              <p className="text-xs text-[#6E4F39] dark:text-[#BDB0A2] leading-relaxed font-normal">
                শান্ত সুর ও মিষ্টি রোদের উষ্ণতায় বই পড়ার কিংবা দিনের শুরু করার
                একান্ত অবসর।
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF6F0] dark:bg-[#1F140D] border border-[#E9DAC8] dark:border-[#382417] space-y-3 shadow-xs hover:shadow-md transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bangla-serif font-black text-lg text-[#22150C] dark:text-[#FAF4ED]">
                বন্ধুর সাথে দীর্ঘ আড্ডা
              </h3>
              <p className="text-xs text-[#6E4F39] dark:text-[#BDB0A2] leading-relaxed font-normal">
                হাসিমুখের খুনসুটি, স্মৃতিচারণ আর ধোঁয়া ওঠা প্রিয় কফির সাথে গল্প।
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF6F0] dark:bg-[#1F140D] border border-[#E9DAC8] dark:border-[#382417] space-y-3 shadow-xs hover:shadow-md transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Smile className="h-6 w-6" />
              </div>
              <h3 className="font-bangla-serif font-black text-lg text-[#22150C] dark:text-[#FAF4ED]">
                একটু নিজের সময়
              </h3>
              <p className="text-xs text-[#6E4F39] dark:text-[#BDB0A2] leading-relaxed font-normal">
                ব্যস্ত শহরের ক্লান্তি ভুলে নিজের সাথে একান্তে কয়েক চুমুক কফি
                উপভোগ করা।
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF6F0] dark:bg-[#1F140D] border border-[#E9DAC8] dark:border-[#382417] space-y-3 shadow-xs hover:shadow-md transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Laptop className="h-6 w-6" />
              </div>
              <h3 className="font-bangla-serif font-black text-lg text-[#22150C] dark:text-[#FAF4ED]">
                কাজের ফাঁকে ছোট্ট বিরতি
              </h3>
              <p className="text-xs text-[#6E4F39] dark:text-[#BDB0A2] leading-relaxed font-normal">
                ফ্রেশ এনার্জি নিয়ে কাজে ফেরার মিষ্টি রিফ্রেশমেন্ট ও অনুপ্রেরণা।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. COFFEE & CULTURE LIFESTYLE RECOMMENDATIONS */}
      {/* ========================================================================= */}
      <CoffeeCultureLifestyle />

      {/* ========================================================================= */}
      {/* 9. FINAL CTA SECTION ("আজকের কাপটা আপনার জন্য অপেক্ষায়।") */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#2A180E] via-[#201108] to-[#140A04] text-white text-center border-t border-[#4E311F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>বর্নক্যাফে অভিজ্ঞতা</span>
          </div>

          <h2 className="font-bangla-serif font-black text-3xl sm:text-5xl text-[#FAF4ED] tracking-tight leading-[1.2]">
            আজকের কাপটা <br />
            <span className="text-[#E8925A]">আপনার জন্য অপেক্ষায়।</span>
          </h2>

          <p className="text-sm sm:text-base text-[#D8C7B5] max-w-xl mx-auto font-normal leading-relaxed">
            পছন্দের কফি বেছে নিন, আর শুরু হোক আপনার ছোট্ট বিরতি।
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              onClick={() => {
                const el = document.getElementById("menu");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
            >
              <Coffee className="h-4 w-4" />
              মেনু দেখুন
            </Button>

            <Button
              onClick={() => navigate("/menu")}
              variant="outline"
              className="w-full sm:w-auto h-12 px-7 rounded-2xl border-[#68462F] bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <QrCode className="h-4 w-4 text-[#E8925A]" />
              টেবিল থেকে অর্ডার করুন
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOOTER */}
      {/* ========================================================================= */}
      <footer
        id="contact"
        className="bg-[#EDE1D1] dark:bg-[#120B06] border-t border-[#DFCBB5] dark:border-[#332317] py-14 text-xs font-normal text-[#6E4F39] dark:text-[#A89684]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#DFCBB5]/80 dark:border-[#332317]">
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C86D3B] text-white">
                  <Coffee className="h-5 w-5" />
                </div>
                <span className="font-bangla-serif font-black text-lg text-[#22150C] dark:text-[#FAF4ED]">
                  {business.name}
                </span>
              </div>
              <p className="text-xs text-[#6E4F39] dark:text-[#A89684] leading-relaxed">
                কফির সাথে ছোট্ট কিছু মুহূর্ত। স্পেশালিটি কফি রোস্টারি ও আধুনিক ক্যাফে অভিজ্ঞতা।
              </p>
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#22150C] dark:text-[#FAF4ED] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#C86D3B]" />
                খোলা থাকার সময়সূচি
              </h5>
              <p>প্রতিদিন (সোমবার – রবিবার)</p>
              <p className="font-bold text-[#22150C] dark:text-[#FAF4ED]">
                {business.openingTime} – {business.closingTime}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                ● তাজা রোস্ট কফি পরিবেশিত হচ্ছে
              </p>
            </div>

            {/* Location & Contact */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#22150C] dark:text-[#FAF4ED] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#C86D3B]" />
                আমাদের অবস্থান
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
                দ্রুত লিংকসমূহ
              </h5>
              <div className="flex flex-col space-y-1.5 font-semibold">
                <button
                  onClick={() => navigate("/menu")}
                  className="text-left hover:text-[#C86D3B] transition-colors"
                >
                  📱 মেনু ও টেবিল থেকে অর্ডার
                </button>
                <a
                  href="#story"
                  className="text-left hover:text-[#C86D3B] transition-colors"
                >
                  ✨ আমাদের গল্প
                </a>
                <button
                  onClick={() => navigate("/display")}
                  className="text-left hover:text-[#C86D3B] transition-colors"
                >
                  📺 লাইভ অর্ডার টিভি ডিসপ্লে
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="text-left hover:text-[#C86D3B] transition-colors"
                >
                  🔐 স্টাফ POS রেজিস্টার
                </button>
              </div>
            </div>
          </div>

          {/* Developer Credit & Brand Philosophy Signature */}
          <div className="pt-10 pb-4 text-center space-y-4 max-w-2xl mx-auto px-4">
            <div className="space-y-1.5">
              <p className="font-bangla-serif font-bold text-sm sm:text-base text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
                “নিজের হাতে যত্নে বানানো।”
              </p>
              <p className="font-bangla-sans text-xs sm:text-[13px] text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-relaxed">
                “এক কাপ কফির মতোই—ছোট ছোট ভাবনা আর ভালোবাসা দিয়ে তৈরি।”
              </p>
            </div>

            <p className="font-bangla-serif text-xs sm:text-[13px] text-[#8C5D3D] dark:text-[#D4A373] font-medium">
              ☕ “Bornocafe” — যেখানে প্রতিটি কাপের সাথে থাকে একটি গল্প।
            </p>

            <div className="pt-2 space-y-1 text-center">
              <p className="text-[11px] sm:text-xs text-[#6E4F39] dark:text-[#A89684] font-medium tracking-wide">
                “Crafted with care by Bornosoft”
              </p>
              <div>
                <a
                  href="https://bornosoft.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#C86D3B] hover:text-[#B35E2F] dark:hover:text-[#E8925A] hover:underline transition-colors inline-block"
                >
                  bornosoft.bd
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DFCBB5]/50 dark:border-[#332317]/60 text-[10px] sm:text-[11px] text-[#8C6446]/80 dark:text-[#887463]">
              © {new Date().getFullYear()} {business.name}। সর্বস্বত্ব সংরক্ষিত।
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
