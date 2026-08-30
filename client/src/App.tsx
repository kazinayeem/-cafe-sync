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
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Accent color tokens (WCAG AA: ~5.2:1 on cream #FDFBF7) ───
const A = "#C4611B";       // primary accent — WCAG AA headline
const A_BTN = "#C4611B";   // button fill (same; on white/cream cards it's fine)
const A_BTN_HVR = "#A8520F"; // hover state

export function App() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ─── Navbar scroll state ──────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Scroll-reveal IntersectionObserver ──────────────────
  useEffect(() => {
    const els = document.querySelectorAll(".reveal-section");
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ─── Public menu ─────────────────────────────────────────
  const { data: menuData } = useGetPublicMenuQuery();

  const business = {
    name: "BornoCafe",
    address: "সেক্টর ১১, উত্তরা, ঢাকা • মিরপুর ১২, ঢাকা",
    phone: "+৮৮০ ১৭১১-২২৩৩৪৪",
    openingTime: "০৮:০০ সকাল",
    closingTime: "১১:০০ রাত",
  };

  const products = menuData?.data?.products || [];

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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#120B06] text-[#22150C] dark:text-[#FCF8F2] selection:bg-[#C4611B]/20 selection:text-[#3C2415] font-bangla-sans overflow-x-hidden">

      {/* ================================================================= */}
      {/* 1. NAVBAR                                                          */}
      {/* ================================================================= */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#FDFBF7]/95 dark:bg-[#120B06]/95 backdrop-blur-md shadow-sm border-b border-[#EDE1D1] dark:border-[#332317] py-2.5"
            : "bg-[#FDFBF7]/85 dark:bg-[#120B06]/85 backdrop-blur-xs border-b border-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl text-white shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300"
              style={{ background: A_BTN, boxShadow: `0 4px 14px 0 ${A_BTN}40` }}
            >
              <Coffee className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
              <span className="absolute -top-1 left-2.5 w-1 h-2 bg-amber-200/80 rounded-full animate-steam-1" />
              <span className="absolute -top-1.5 left-5 w-1 h-3 bg-amber-200/90 rounded-full animate-steam-2" />
              <span className="absolute -top-0.5 left-7 w-1 h-2 bg-amber-200/70 rounded-full animate-steam-3" />
            </div>

            <div className="flex flex-col">
              <span className="font-bangla-serif font-bold text-xl tracking-tight text-[#22150C] dark:text-[#FAF4ED] group-hover:text-[#C4611B] transition-colors leading-tight">
                {business.name}
              </span>
              <span className="text-[10px] sm:text-[11px] font-normal text-[#8C5D3D] dark:text-[#D4A373]">
                কফির সাথে ছোট্ট কিছু মুহূর্ত
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#634832] dark:text-[#D8C7B5]">
            <a href="#menu" className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors">
              মেনু
            </a>
            <button
              onClick={() => navigate("/find-my-coffee")}
              className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors flex items-center gap-1.5 font-bold"
              style={{ color: A }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: A }} />
              <span>কফি খুঁজুন</span>
            </button>
            <a href="#story" className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors">
              আমাদের গল্প
            </a>
            <a href="#bean-to-cup" className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors">
              কফি প্রক্রিয়া
            </a>
            <a href="#atmosphere" className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors">
              ক্যাফে দর্শন
            </a>
            <a href="#contact" className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors">
              যোগাযোগ
            </a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {/* Secondary CTA — ghost/outline */}
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="h-10 px-4 rounded-[12px] border border-[#D8C7B5] dark:border-[#422F22] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E] text-[#422818] dark:text-[#EFE2D3] font-semibold text-xs transition-all"
            >
              স্টাফ POS →
            </Button>
            {/* Primary CTA — solid fill, larger padding */}
            <Button
              onClick={() => navigate("/menu")}
              className="h-10 px-6 rounded-[12px] text-white font-bold text-xs shadow-md active:scale-[0.98] transition-all flex items-center gap-2"
              style={{ background: A_BTN, boxShadow: `0 4px 14px 0 ${A_BTN}30` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = A_BTN_HVR)}
              onMouseLeave={(e) => (e.currentTarget.style.background = A_BTN)}
            >
              <QrCode className="h-4 w-4" />
              টেবিল থেকে অর্ডার
            </Button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              onClick={() => navigate("/menu")}
              size="sm"
              className="h-9 px-3 rounded-[12px] text-white font-bold text-xs shadow-sm flex items-center gap-1"
              style={{ background: A_BTN }}
            >
              <QrCode className="h-3.5 w-3.5" />
              অর্ডার
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[12px] border border-[#EDE1D1] dark:border-[#332317] text-[#22150C] dark:text-[#FCF8F2] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#EDE1D1] dark:border-[#332317] bg-[#FDFBF7] dark:bg-[#120B06] px-5 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-3 text-sm font-semibold">
              <a href="#menu" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-[12px] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]">
                ☕ মেনু দেখুন
              </a>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/find-my-coffee"); }}
                className="p-2.5 rounded-[12px] text-left font-bold hover:bg-[#F2E8DC] dark:hover:bg-[#20150E] flex items-center gap-2"
                style={{ color: A }}
              >
                ✨ আমার কফি খুঁজুন
              </button>
              <a href="#story" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-[12px] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]">
                ✨ আমাদের গল্প
              </a>
              <a href="#bean-to-cup" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-[12px] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]">
                🌱 কফি প্রক্রিয়া
              </a>
              <a href="#atmosphere" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-[12px] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]">
                🌿 ক্যাফে দর্শন
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-[12px] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]">
                📍 যোগাযোগ
              </a>
            </div>
            <div className="pt-3 border-t border-[#EDE1D1] dark:border-[#332317] grid grid-cols-2 gap-2">
              {/* Secondary */}
              <Button
                variant="outline"
                onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}
                className="h-11 rounded-[12px] border-[#D8C7B5] dark:border-[#422F22] font-semibold text-xs"
              >
                স্টাফ POS →
              </Button>
              {/* Primary */}
              <Button
                onClick={() => { setMobileMenuOpen(false); navigate("/menu"); }}
                className="h-11 rounded-[12px] text-white font-bold text-xs"
                style={{ background: A_BTN }}
              >
                টেবিল থেকে অর্ডার
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ================================================================= */}
      {/* 2. HERO SECTION                                                    */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden pt-4 sm:pt-6 lg:pt-8 pb-10 lg:pb-16 border-b border-[#EDE1D1] dark:border-[#332317]">
        {/* Ambient Glows */}
        <div className="absolute top-8 left-1/4 w-96 h-96 rounded-full bg-[#EAD4BB]/30 dark:bg-[#2A180E]/30 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-6 right-10 w-[450px] h-[450px] rounded-full bg-[#F3DECA]/40 dark:bg-[#381F12]/20 blur-3xl -z-10 pointer-events-none" />

        {/* Floating Ambient Decorations */}
        <div className="absolute top-16 left-8 text-lg opacity-10 pointer-events-none animate-bean-drift-1 select-none">☕</div>
        <div className="absolute bottom-20 left-1/3 text-base opacity-10 pointer-events-none animate-bean-drift-2 select-none">🌿</div>
        <div className="absolute top-24 right-10 text-lg opacity-10 pointer-events-none animate-bean-drift-3 select-none">☕</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left: Hero Copy */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] border border-[#DFCBB5] dark:border-[#422B1D] text-[11px] font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#E8925A] shadow-sm">
                <Sparkles className="h-3 w-3" style={{ color: A }} />
                <span>BORNOCAFE · SPECIALTY COFFEE</span>
              </div>

              {/* Headline — Hind Siliguri 700, WCAG AA accent */}
              <h1 className="font-bangla-serif font-bold text-3xl sm:text-5xl lg:text-[52px] xl:text-6xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.15]">
                এক কাপ কফি, <br />
                <span style={{ color: A }}>একটু আপন সময়।</span>
              </h1>

              {/* Supporting Copy — Noto Sans Bengali 400, line-height 1.75 */}
              <p className="font-bangla-sans text-sm sm:text-base lg:text-[17px] text-[#5D422E] dark:text-[#C5B4A2] font-normal max-w-[520px] mx-auto lg:mx-0 leading-[1.75]">
                তাজা কফি, সুন্দর কিছু গল্প, আর আপনার জন্য একটু নিজের সময়।
              </p>

              {/* CTAs — Primary dominant, Secondary ghost */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                {/* PRIMARY CTA */}
                <Button
                  onClick={() => { const el = document.getElementById("menu"); el?.scrollIntoView({ behavior: "smooth" }); }}
                  className="w-full sm:w-auto h-12 sm:h-13 px-8 rounded-[12px] text-white font-bold text-sm shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: A_BTN, boxShadow: `0 4px 20px 0 ${A_BTN}35` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = A_BTN_HVR; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = A_BTN; }}
                >
                  <Coffee className="h-4 w-4" />
                  মেনু দেখুন
                </Button>

                {/* SECONDARY CTA — ghost outline */}
                <Button
                  onClick={() => navigate("/menu")}
                  variant="outline"
                  className="w-full sm:w-auto h-12 sm:h-13 px-7 rounded-[12px] border border-[#D8C7B5] dark:border-[#422F22] bg-[#FAF6F0]/80 dark:bg-[#1E130B]/80 hover:bg-[#F2E8DC] dark:hover:bg-[#281810] text-[#3A2213] dark:text-[#F3E7DC] font-semibold text-sm hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="h-4 w-4" style={{ color: A }} />
                  টেবিল থেকে অর্ডার
                </Button>
              </div>

              {/* Rotating Coffee Quote */}
              <div className="pt-1 flex justify-center lg:justify-start">
                <BanglaCoffeeQuotes />
              </div>

              {/* Barista Status */}
              <div className="pt-1 flex items-center justify-center lg:justify-start gap-2.5 text-xs font-medium text-[#8C6446] dark:text-[#AA9380]">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  বারিস্টা কাউন্টার খোলা · আজ {business.openingTime} — {business.closingTime}
                </span>
                <span>•</span>
                <span className="text-muted-foreground/75">মিরপুর ও উত্তরা শাখা</span>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div className="relative w-full max-w-lg lg:max-w-none group">
                {/* Warm Glow Backdrop */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-[#EAD4BB]/60 via-[#F3DECA]/40 to-[#E0C7AA]/50 dark:from-[#3A1E0E]/40 dark:via-[#261309]/30 dark:to-[#4A2612]/30 rounded-[36px] blur-2xl -z-10 group-hover:scale-105 transition-all duration-700 pointer-events-none" />
                {/* Hero image — 16px corner radius per spec */}
                <div className="relative rounded-[16px] overflow-hidden border border-[#EDE1D1]/90 dark:border-[#3A2417] bg-[#EFE4D6] dark:bg-[#1A1009] transition-all duration-700 hover:scale-[1.015] animate-hero-breathe" style={{ boxShadow: "0 8px 48px 0 rgba(34,21,12,0.13), 0 2px 8px 0 rgba(34,21,12,0.06)" }}>
                  <img
                    src="/heroimage.png"
                    alt="বর্নোক্যাফেতে কফি উপভোগরত এক জুটি"
                    className="w-full h-80 sm:h-[430px] lg:h-[480px] xl:h-[510px] object-cover object-center"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. MENU SECTION                                                    */}
      {/* ================================================================= */}
      <section
        id="menu"
        className="reveal-section py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
            <Flame className="h-3.5 w-3.5" style={{ color: A }} />
            <span>সতেজ রোস্ট ও নিখুঁত স্বাদ</span>
          </div>

          <h2 className="font-bangla-serif font-bold text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
            আজকের কফি কোনটা?
          </h2>

          <p className="font-bangla-sans text-sm sm:text-base text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-[1.75]">
            সতেজভাবে তৈরি, আপনার দিনের ছোট্ট আনন্দের জন্য।
          </p>

          {/* Category Filter Pills — radius-pill (12px) */}
          <div className="pt-3 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categoriesList.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-[12px] text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat.key
                    ? "text-white shadow-sm"
                    : "bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#C5B4A2] hover:bg-[#E6D6C2] dark:hover:bg-[#342217]"
                }`}
                style={activeCategory === cat.key ? { background: A } : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid — 1col/2col/3col, 24px gap, 16px radius, card-lift hover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate("/menu")}
              className="card-lift group relative rounded-[16px] bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] p-5 flex flex-col justify-between cursor-pointer hover:border-[#C4611B]/50"
              style={{ boxShadow: "0 2px 16px 0 rgba(34,21,12,0.07), 0 1px 4px 0 rgba(34,21,12,0.04)" }}
            >
              {/* Product Image — 16px radius */}
              <div className="relative h-48 w-full rounded-[16px] overflow-hidden bg-[#EFE4D6] dark:bg-[#261810] mb-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 dark:bg-black/90 text-[#3A2213] dark:text-[#FAF4ED] backdrop-blur-xs shadow-sm">
                    {item.tag}
                  </span>
                </div>
                {/* Origin */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-white/90">
                  <Coffee className="h-3 w-3 text-amber-300" />
                  <span>{item.origin}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-4">
                <div>
                  <h3 className="font-bangla-serif font-bold text-xl text-[#22150C] dark:text-[#FAF4ED] group-hover:text-[#C4611B] transition-colors">
                    {item.name}
                  </h3>
                  {item.englishName && (
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      {item.englishName}
                    </span>
                  )}
                </div>
                <p className="font-bangla-sans text-xs text-[#6E4F39] dark:text-[#BDB0A2] line-clamp-2 leading-[1.75] font-normal">
                  {item.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-[#EDE1D1] dark:border-[#332317] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6446] dark:text-[#9F8A77] block">
                    {item.size || "শুরু মাত্র"}
                  </span>
                  <span className="text-xl font-black font-tabular" style={{ color: A }}>
                    ৳{item.price}
                  </span>
                </div>
                {/* Primary action button on card */}
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); navigate("/menu"); }}
                  className="h-9 px-4 rounded-[12px] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  style={{ background: A_BTN }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = A_BTN_HVR)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = A_BTN)}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  অর্ডার করুন
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Section CTA — clear hierarchy */}
        <div className="text-center pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* PRIMARY — solid espresso fill */}
            <Button
              onClick={() => navigate("/menu")}
              className="h-12 px-8 rounded-[12px] bg-[#3C2415] hover:bg-[#28160B] dark:bg-[#FAF4ED] dark:hover:bg-white dark:text-[#120B06] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>সম্পূর্ণ মেনু দেখুন ({products.length || 18}+ আইটেম)</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            {/* SECONDARY — ghost orange outline */}
            <Button
              onClick={() => navigate("/find-my-coffee")}
              variant="outline"
              className="h-12 px-7 rounded-[12px] font-semibold text-sm shadow-sm transition-all flex items-center gap-2 hover:text-white"
              style={{ borderColor: A, color: A }}
              onMouseEnter={(e) => { e.currentTarget.style.background = A; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = A; }}
            >
              <Sparkles className="h-4 w-4" />
              <span>আপনার কফি খুঁজে নিন (কুইজ)</span>
            </Button>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. COFFEE STORY SECTION                                            */}
      {/* ================================================================= */}
      <section
        id="story"
        className="reveal-section py-12 sm:py-16 bg-[#F5ECE0] dark:bg-[#160E08] border-y border-[#EDE1D1] dark:border-[#332317]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Story Visual — 16px radius, consistent shadow */}
            <div className="lg:col-span-5 relative">
              <div
                className="relative h-80 sm:h-96 w-full rounded-[16px] overflow-hidden border border-[#DFCBB5] dark:border-[#382417]"
                style={{ boxShadow: "0 4px 32px 0 rgba(34,21,12,0.12), 0 1px 6px 0 rgba(34,21,12,0.06)" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
                  alt="Barista crafting coffee"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    আমাদের গল্প
                  </span>
                  <h4 className="font-bangla-serif font-bold text-xl">
                    প্রতিটি কাপে ভালোবাসা
                  </h4>
                  <p className="font-bangla-sans text-xs text-white/80 mt-1 leading-[1.75]">
                    ঢাকায় বসে বিশ্বমানের স্পেশালিটি কফির অনন্য অনুভূতি।
                  </p>
                </div>
              </div>
            </div>

            {/* Story Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
                <Heart className="h-3.5 w-3.5" style={{ color: A }} />
                <span>আমাদের ভাবনা</span>
              </div>

              <h2 className="font-bangla-serif font-bold text-3xl sm:text-5xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.2]">
                কফির কাপে কিছু <br />
                <span style={{ color: A }}>গল্প থেকে যায়।</span>
              </h2>

              <p className="font-bangla-sans text-base text-[#5D422E] dark:text-[#C5B4A2] font-normal leading-[1.75]">
                সকালের প্রথম কাপে যেমন নতুন দিনের শুরু, তেমনি বিকেলের এক কাপ কফি
                হতে পারে একটু নিজের কাছে ফিরে আসার সময়।
              </p>

              <p className="font-bangla-sans text-sm text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-[1.75]">
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

      {/* ================================================================= */}
      {/* 5. BEAN TO CUP SECTION                                             */}
      {/* ================================================================= */}
      <section
        id="bean-to-cup"
        className="reveal-section py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
      >
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8C5D3D] dark:text-[#D4A373]">
            কফি প্রক্রিয়া
          </span>
          <h2 className="font-bangla-serif font-bold text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
            বীজ থেকে আপনার কাপ পর্যন্ত
          </h2>
          <p className="font-bangla-sans text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-[1.75]">
            প্রতিটি ধাপে থাকে চরম সতর্কতা, নিখুঁত মাপ এবং আন্তরিক ভালোবাসা।
          </p>
        </div>

        {/* 4 Process Cards — consistent icons h-5 w-5, wrapper h-11 w-11 rounded-[12px] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "০১",
              title: "ভালো কফি বাছাই",
              desc: "সেরা সিঙ্গেল অরিজিন ও স্পেশালিটি অ্যারাবিকা কফি বিনের সতেজ সংগ্রহ।",
              Icon: Leaf,
            },
            {
              step: "০২",
              title: "সতেজভাবে গ্রাইন্ড",
              desc: "প্রতিটি অর্ডারের সময় অন-ডিমান্ড প্রিসিশন গ্রাইন্ডিং।",
              Icon: Sliders,
            },
            {
              step: "০৩",
              title: "যত্নে ব্রু করা",
              desc: "৯৩°C ক্যালিব্রেটেড তাপমাত্রা ও নিখুঁত ৯-বার প্রেসার এক্সট্রাকশন।",
              Icon: ChefHat,
            },
            {
              step: "০৪",
              title: "আপনার হাতে পৌঁছে দেওয়া",
              desc: "টেবিলে গরম কফি, মন জুড়ানো সুবাস ও সিল্কি লাতে আর্ট।",
              Icon: Heart,
            },
          ].map((stepItem, idx) => (
            <div
              key={idx}
              className={`card-lift p-6 rounded-[16px] bg-[#FAF6F0] dark:bg-[#1F140D] border border-[#E9DAC8] dark:border-[#382417] space-y-4 relative overflow-hidden stagger-${idx + 1}`}
              style={{ boxShadow: "0 2px 16px 0 rgba(34,21,12,0.07)" }}
            >
              <div className="flex items-center justify-between">
                {/* Consistent icon wrapper — h-11 w-11, rounded-[12px], same color */}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-[12px]"
                  style={{ background: `${A}18`, color: A }}
                >
                  <stepItem.Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <span className="font-bangla-serif font-bold text-2xl text-[#D8C7B5] dark:text-[#422F22]">
                  {stepItem.step}
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bangla-serif font-bold text-lg text-[#22150C] dark:text-[#FAF4ED]">
                  {stepItem.title}
                </h3>
                <p className="font-bangla-sans text-xs text-[#6E4F39] dark:text-[#BDB0A2] leading-[1.75] font-normal">
                  {stepItem.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. TABLE QR ORDERING SECTION                                       */}
      {/* ================================================================= */}
      <section
        id="qr-order"
        className="reveal-section py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div
          className="rounded-[16px] bg-gradient-to-br from-[#FAF5EE] via-[#F4E9DC] to-[#E9D6C3] dark:from-[#24170F] dark:via-[#1D120A] dark:to-[#140C07] border border-[#DFCBB5] dark:border-[#382417] p-8 sm:p-12 lg:p-16 relative overflow-hidden"
          style={{ boxShadow: "0 8px 48px 0 rgba(34,21,12,0.10), 0 2px 8px 0 rgba(34,21,12,0.05)" }}
        >
          {/* Background Decorative QR */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 opacity-[0.07] pointer-events-none">
            <QrCode className="w-full h-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
                <Sparkles className="h-3.5 w-3.5" style={{ color: A }} />
                <span>স্মার্ট ক্যাফে সার্ভিস</span>
              </div>

              <h2 className="font-bangla-serif font-bold text-3xl sm:text-5xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.2]">
                আপনার টেবিল থেকেই <br />
                <span style={{ color: A }}>অর্ডার করুন।</span>
              </h2>

              <p className="font-bangla-sans text-sm sm:text-base text-[#5D422E] dark:text-[#C5B4A2] font-normal leading-[1.75] max-w-xl">
                QR স্ক্যান করুন, পছন্দের কফি বেছে নিন, আর অপেক্ষা করুন আপনার
                অর্ডারের জন্য।
              </p>

              {/* Visual Flow Indicator */}
              <div className="p-3.5 rounded-[12px] bg-white/70 dark:bg-black/30 border border-[#DFCBB5]/70 dark:border-[#382417] max-w-md">
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold uppercase tracking-wider">
                  <div className="p-1.5 rounded-[8px] text-white" style={{ background: A }}>
                    ১. স্ক্যান
                  </div>
                  <div className="p-1.5 rounded-[8px] bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">
                    ২. অর্ডার
                  </div>
                  <div className="p-1.5 rounded-[8px] bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">
                    ৩. প্রস্তুত
                  </div>
                  <div className="p-1.5 rounded-[8px] bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">
                    ৪. পরিবেশন
                  </div>
                </div>
              </div>

              {/* CTAs — PRIMARY dominant, one per section */}
              <div className="pt-2 flex flex-wrap gap-3">
                {/* PRIMARY */}
                <Button
                  onClick={() => navigate("/menu")}
                  className="h-12 px-7 rounded-[12px] text-white font-bold text-sm shadow-md flex items-center gap-2"
                  style={{ background: A_BTN, boxShadow: `0 4px 20px 0 ${A_BTN}30` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = A_BTN_HVR)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = A_BTN)}
                >
                  <QrCode className="h-4 w-4" />
                  অর্ডার শুরু করুন
                </Button>
                {/* SECONDARY — ghost */}
                <Button
                  variant="outline"
                  onClick={() => navigate("/display")}
                  className="h-12 px-6 rounded-[12px] border-[#DFCBB5] dark:border-[#422F22] font-semibold text-sm flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4 text-blue-600" />
                  লাইভ টিভি ডিসপ্লে
                </Button>
              </div>
            </div>

            {/* Right: Order Tracking Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="w-full max-w-sm p-6 rounded-[16px] bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] space-y-4"
                style={{ boxShadow: "0 8px 40px 0 rgba(34,21,12,0.12)" }}
              >
                <div className="flex items-center justify-between border-b border-[#EDE1D1] dark:border-[#332317] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
                      আপনার অর্ডার এখন কোথায়?
                    </span>
                    <h4 className="font-bangla-serif font-bold text-2xl text-[#22150C] dark:text-[#FAF4ED]">
                      অর্ডার #A1025
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                    ● কফি তৈরি হচ্ছে
                  </span>
                </div>

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

                <div className="space-y-2 pt-2 border-t border-[#EDE1D1] dark:border-[#332317]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6446] dark:text-[#9F8A77] block">
                    প্রস্তুতি অগ্রগতি (আনুমানিক ৫–৭ মিনিট)
                  </span>
                  <div className="space-y-1.5 text-xs font-medium">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>অর্ডার নেওয়া হয়েছে ও নিশ্চিত</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold" style={{ color: A }}>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: A, borderTopColor: "transparent" }} />
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

      {/* ================================================================= */}
      {/* 7. CAFE ATMOSPHERE SECTION                                         */}
      {/* ================================================================= */}
      <section
        id="atmosphere"
        className="reveal-section py-12 sm:py-16 bg-[#F7F0E6] dark:bg-[#160E08] border-t border-[#EDE1D1] dark:border-[#332317]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8C5D3D] dark:text-[#D4A373]">
              ক্যাফে অনুভূতি
            </span>
            <h2 className="font-bangla-serif font-bold text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
              কফির চেয়েও বেশি কিছু
            </h2>
            <p className="font-bangla-sans text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-[1.75]">
              একটি শান্ত, নান্দনিক, আধুনিক কফি শপ — যেখানে কফি শুধু পানীয় নয়,
              ছোট্ট একটি অনুভূতি।
            </p>
          </div>

          {/* 4 Atmosphere Cards — consistent icons + 16px radius + card-lift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                Icon: Sun,
                title: "সকালের নীরবতা",
                desc: "শান্ত সুর ও মিষ্টি রোদের উষ্ণতায় বই পড়ার কিংবা দিনের শুরু করার একান্ত অবসর।",
                idx: 1,
              },
              {
                Icon: Users,
                title: "বন্ধুর সাথে দীর্ঘ আড্ডা",
                desc: "হাসিমুখের খুনসুটি, স্মৃতিচারণ আর ধোঁয়া ওঠা প্রিয় কফির সাথে গল্প।",
                idx: 2,
              },
              {
                Icon: Smile,
                title: "একটু নিজের সময়",
                desc: "ব্যস্ত শহরের ক্লান্তি ভুলে নিজের সাথে একান্তে কয়েক চুমুক কফি উপভোগ করা।",
                idx: 3,
              },
              {
                Icon: Laptop,
                title: "কাজের ফাঁকে ছোট্ট বিরতি",
                desc: "ফ্রেশ এনার্জি নিয়ে কাজে ফেরার মিষ্টি রিফ্রেশমেন্ট ও অনুপ্রেরণা।",
                idx: 4,
              },
            ].map(({ Icon, title, desc, idx }) => (
              <div
                key={idx}
                className={`card-lift p-7 rounded-[16px] bg-[#FAF6F0] dark:bg-[#1F140D] border border-[#E9DAC8] dark:border-[#382417] space-y-3 group stagger-${idx}`}
                style={{ boxShadow: "0 2px 16px 0 rgba(34,21,12,0.07)" }}
              >
                {/* Consistent icon wrapper */}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-[12px] group-hover:scale-110 transition-transform duration-200"
                  style={{ background: `${A}15`, color: A }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-bangla-serif font-bold text-lg text-[#22150C] dark:text-[#FAF4ED]">
                  {title}
                </h3>
                <p className="font-bangla-sans text-xs text-[#6E4F39] dark:text-[#BDB0A2] leading-[1.75] font-normal">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 8. COFFEE & CULTURE LIFESTYLE RECOMMENDATIONS                      */}
      {/* ================================================================= */}
      <CoffeeCultureLifestyle />

      {/* ================================================================= */}
      {/* 9. FINAL CTA SECTION                                               */}
      {/* ================================================================= */}
      <section className="reveal-section py-14 sm:py-20 bg-gradient-to-br from-[#2A180E] via-[#201108] to-[#140A04] text-white text-center border-t border-[#4E311F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>বর্নক্যাফে অভিজ্ঞতা</span>
          </div>

          <h2 className="font-bangla-serif font-bold text-3xl sm:text-5xl text-[#FAF4ED] tracking-tight leading-[1.2]">
            আজকের কাপটা <br />
            <span className="text-[#E8925A]">আপনার জন্য অপেক্ষায়।</span>
          </h2>

          <p className="font-bangla-sans text-sm sm:text-base text-[#D8C7B5] max-w-xl mx-auto font-normal leading-[1.75]">
            পছন্দের কফি বেছে নিন, আর শুরু হোক আপনার ছোট্ট বিরতি।
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {/* PRIMARY — solid orange */}
            <Button
              onClick={() => { const el = document.getElementById("menu"); el?.scrollIntoView({ behavior: "smooth" }); }}
              className="w-full sm:w-auto h-12 px-9 rounded-[12px] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              style={{ background: A_BTN, boxShadow: `0 4px 24px 0 ${A_BTN}40` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = A_BTN_HVR)}
              onMouseLeave={(e) => (e.currentTarget.style.background = A_BTN)}
            >
              <Coffee className="h-4 w-4" />
              মেনু দেখুন
            </Button>
            {/* SECONDARY — ghost white border on dark bg */}
            <Button
              onClick={() => navigate("/menu")}
              variant="outline"
              className="w-full sm:w-auto h-12 px-7 rounded-[12px] border border-[#68462F] bg-white/8 hover:bg-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <QrCode className="h-4 w-4 text-[#E8925A]" />
              টেবিল থেকে অর্ডার করুন
            </Button>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 10. FOOTER                                                          */}
      {/* ================================================================= */}
      <footer
        id="contact"
        className="bg-[#EDE1D1] dark:bg-[#120B06] border-t border-[#DFCBB5] dark:border-[#332317] py-14 text-xs font-normal text-[#6E4F39] dark:text-[#A89684]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#DFCBB5]/80 dark:border-[#332317]">
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[12px] text-white"
                  style={{ background: A_BTN }}
                >
                  <Coffee className="h-5 w-5" />
                </div>
                <span className="font-bangla-serif font-bold text-lg text-[#22150C] dark:text-[#FAF4ED]">
                  {business.name}
                </span>
              </div>
              <p className="font-bangla-sans text-xs text-[#6E4F39] dark:text-[#A89684] leading-[1.75]">
                কফির সাথে ছোট্ট কিছু মুহূর্ত। স্পেশালিটি কফি রোস্টারি ও আধুনিক ক্যাফে অভিজ্ঞতা।
              </p>
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#22150C] dark:text-[#FAF4ED] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" style={{ color: A }} />
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
                <MapPin className="h-3.5 w-3.5" style={{ color: A }} />
                আমাদের অবস্থান
              </h5>
              <p>{business.address}</p>
              <p className="flex items-center gap-1">
                <Phone className="h-3 w-3" style={{ color: A }} />
                {business.phone}
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#22150C] dark:text-[#FAF4ED] flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" style={{ color: A }} />
                দ্রুত লিংকসমূহ
              </h5>
              <div className="flex flex-col space-y-1.5 font-semibold">
                <button onClick={() => navigate("/menu")} className="text-left hover:text-[#C4611B] transition-colors">
                  📱 মেনু ও টেবিল থেকে অর্ডার
                </button>
                <a href="#story" className="text-left hover:text-[#C4611B] transition-colors">
                  ✨ আমাদের গল্প
                </a>
                <button onClick={() => navigate("/display")} className="text-left hover:text-[#C4611B] transition-colors">
                  📺 লাইভ অর্ডার টিভি ডিসপ্লে
                </button>
                <button onClick={() => navigate("/login")} className="text-left hover:text-[#C4611B] transition-colors">
                  🔐 স্টাফ POS রেজিস্টার
                </button>
              </div>
            </div>
          </div>

          {/* Footer Credit */}
          <div className="pt-10 pb-4 text-center space-y-4 max-w-2xl mx-auto px-4">
            <div className="space-y-1.5">
              <p className="font-bangla-serif font-bold text-sm sm:text-base text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
                "নিজের হাতে যত্নে বানানো।"
              </p>
              <p className="font-bangla-sans text-xs sm:text-[13px] text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-[1.75]">
                "এক কাপ কফির মতোই—ছোট ছোট ভাবনা আর ভালোবাসা দিয়ে তৈরি।"
              </p>
            </div>

            <p className="font-bangla-serif text-xs sm:text-[13px] text-[#8C5D3D] dark:text-[#D4A373] font-medium">
              ☕ "Bornocafe" — যেখানে প্রতিটি কাপের সাথে থাকে একটি গল্প।
            </p>

            <div className="pt-2 space-y-1 text-center">
              <p className="text-[11px] sm:text-xs text-[#6E4F39] dark:text-[#A89684] font-medium tracking-wide">
                "Crafted with care by Bornosoft"
              </p>
              <div>
                <a
                  href="https://bornosoft.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold hover:underline transition-colors inline-block"
                  style={{ color: A }}
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
