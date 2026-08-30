import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useGetPublicMenuQuery } from "@/services/publicMenuApi";
import { BanglaCoffeeQuotes } from "@/components/coffee/BanglaCoffeeQuotes";
import { CoffeeCultureLifestyle } from "@/components/coffee/CoffeeCultureLifestyle";
import { ThreeDImagePageflip, type PageFlipLeaf } from "@/components/lightswind/3d-image-pageflip";
import WorldMap, { type MapMarker, type MapArc } from "@/components/lightswind/world-map";
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
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Register GSAP plugins once at module level ────────────────────────────
gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─── Brand accent tokens ───────────────────────────────────────────────────
const A       = "#C4611B"; // WCAG AA on cream (#FDFBF7 → ~5.2:1)
const A_BTN   = "#C4611B";
const A_BTN_HVR = "#A8520F";

// ─── Shared scroll-trigger defaults ───────────────────────────────────────
const ST_DEFAULTS = {
  start: "top 85%",
  toggleActions: "play none none none" as const,
};

// ─── BornoCafe 3D Page-Flip Storybook Leaves ──────────────────────────────
const BORNOCAFE_PAGES: PageFlipLeaf[] = [
  {
    id: 1,
    frontImage: "https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&w=800&q=80",
    backImage:  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    frontTitle:    "এক কাপে দুটো মন",
    frontSubtitle: "কফির উষ্ণতায় মিলে যায় দুটো মুহূর্ত",
    frontBadge:    "BornoCafe",
    backTitle:    "বারিস্তার যত্ন",
    backSubtitle: "প্রতিটি কাপে লুকিয়ে থাকে একটু ভালোবাসা",
    backBadge:    "গল্প ০১",
  },
  {
    id: 2,
    frontImage: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=800&q=80",
    backImage:  "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
    frontTitle:    "বৃষ্টির বিকেল",
    frontSubtitle: "জানালার পাশে কফি, বাইরে ঝরছে বৃষ্টি",
    frontBadge:    "গল্প ০২",
    backTitle:    "ধোঁয়া ওঠা স্মৃতি",
    backSubtitle: "কফি ঠান্ডা হয়ে যায়, কিন্তু মুহূর্ত থেকে যায়",
    backBadge:    "গল্প ০৩",
  },
  {
    id: 3,
    frontImage: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80",
    backImage:  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    frontTitle:    "নিজের জন্য কিছু সময়",
    frontSubtitle: "এক চুমুক কফি, একটু শান্তি",
    frontBadge:    "গল্প ০৪",
    backTitle:    "গল্পের ফাঁকে",
    backSubtitle: "তুমি পাশে থাকলে, কফিই যথেষ্ট",
    backBadge:    "গল্প ০৫",
  },
  {
    id: 4,
    frontImage: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
    backImage:  "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
    frontTitle:    "সিঙ্গেল অরিজিন",
    frontSubtitle: "ইথিওপিয়ার পাহাড় থেকে আপনার কাপে",
    frontBadge:    "গল্প ০৬",
    backTitle:    "লাতে আর্ট",
    backSubtitle: "প্রতিটি ডিজাইনে লুকিয়ে থাকে একটু মন",
    backBadge:    "গল্প ০৭",
  },
  {
    id: 5,
    frontImage: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80",
    backImage:  "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
    frontTitle:    "আড্ডার আসর",
    frontSubtitle: "বন্ধুর সাথে, কফির ধোঁয়ায় মিলে যায় সব কথা",
    frontBadge:    "গল্প ০৮",
    backTitle:    "নাইট্রো মুহূর্ত",
    backSubtitle: "ব্যস্ত শহরে একটু থামার নাম — BornoCafe",
    backBadge:    "গল্প ০৯",
  },
];

// ─── Global Coffee Culture Map Data ───────────────────────────────────────
const COFFEE_WORLD_MARKERS: MapMarker[] = [
  {
    id: "finland",
    lat: 60.1699,
    lng: 24.9384,
    label: "ফিনল্যান্ড 🇫🇮",
    country: "Finland",
    fact: "বিশ্বে ১নং কফি ভোক্তা — গড়ে মাথাপিছু বছরে প্রায় ১২ কেজি কফি উপভোগ করেন!",
    timeZone: "Europe/Helsinki",
    ping: "১ম ভোক্তা দেশ",
    pulse: true,
  },
  {
    id: "norway",
    lat: 59.9139,
    lng: 10.7522,
    label: "নরওয়ে 🇳🇴",
    country: "Norway",
    fact: "বিশ্বে ২নং কফিপ্রেমী জাতি — গড়ে মাথাপিছু বছরে ৯.৯ কেজি কফি পান করেন।",
    timeZone: "Europe/Oslo",
    ping: "২য় ভোক্তা দেশ",
    pulse: true,
  },
  {
    id: "iceland",
    lat: 64.1466,
    lng: -21.9426,
    label: "আইসল্যান্ড 🇮🇸",
    country: "Iceland",
    fact: "ক্যাফে সংস্কৃতির স্বর্গ — যেখানে প্রতি কোণায় থাকে চমৎকার স্থানীয় রোস্টারি।",
    timeZone: "Atlantic/Reykjavik",
    ping: "৩য় ভোক্তা দেশ",
    pulse: true,
  },
  {
    id: "denmark",
    lat: 55.6761,
    lng: 12.5683,
    label: "ডেনমার্ক 🇩🇰",
    country: "Denmark",
    fact: "ডেনিশ 'হাইজ' (Hygge) সংস্কৃতির প্রাণ হলো প্রিয়জনের সাথে গরম কফির কাপ।",
    timeZone: "Europe/Copenhagen",
    ping: "৪র্থ স্থান",
    pulse: true,
  },
  {
    id: "netherlands",
    lat: 52.3676,
    lng: 4.9041,
    label: "নেদারল্যান্ডস 🇳🇱",
    country: "Netherlands",
    fact: "বিশ্বজুড়ে কফি বাণিজ্যের প্রাচীন ঐতিহ্যবাহী কেন্দ্র ও দারুণ ফিল্টার কফি।",
    timeZone: "Europe/Amsterdam",
    ping: "৫ম স্থান",
    pulse: true,
  },
  {
    id: "sweden",
    lat: 59.3293,
    lng: 18.0686,
    label: "সুইডেন 🇸🇪",
    country: "Sweden",
    fact: "বিশ্ববিখ্যাত 'ফিকা' (Fika) — কাজের ফাঁকে কফি ও সিনামন বানের চমৎকার বিরতি।",
    timeZone: "Europe/Stockholm",
    ping: "৬ষ্ঠ স্থান",
    pulse: true,
  },
  {
    id: "switzerland",
    lat: 46.9480,
    lng: 7.4474,
    label: "সুইজারল্যান্ড 🇨🇭",
    country: "Switzerland",
    fact: "উন্নত রোস্টিং ও প্রিমিয়াম ব্লেন্ডিং টেকনোলজির জন্য বিশ্বখ্যাত।",
    timeZone: "Europe/Zurich",
    ping: "৭ম স্থান",
    pulse: true,
  },
  {
    id: "brazil",
    lat: -15.7975,
    lng: -47.8919,
    label: "ব্রাজিল 🇧🇷",
    country: "Brazil",
    fact: "বিশ্বের বৃহত্তম কফি উৎপাদক — প্রায় ১৫০ বছর ধরে শীর্ষ কফি সরবরাহকারী।",
    timeZone: "America/Sao_Paulo",
    ping: "১ম উৎপাদক",
    pulse: true,
  },
  {
    id: "italy",
    lat: 41.9028,
    lng: 12.4964,
    label: "ইতালি 🇮🇹",
    country: "Italy",
    fact: "ক্লাসিক এসপ্রেসো, ক্যাপুচিনো ও বারিস্তা সংস্কৃতির আঁতুড়ঘর।",
    timeZone: "Europe/Rome",
    ping: "এসপ্রেসো সংস্কৃতি",
    pulse: true,
  },
  {
    id: "ethiopia",
    lat: 9.0320,
    lng: 38.7480,
    label: "ইথিওপিয়া 🇪🇹",
    country: "Ethiopia",
    fact: "কফির ঐতিহাসিক আদি জন্মভূমি — যেখান থেকে শুরু হয় কফির বিশ্বজয়।",
    timeZone: "Africa/Addis_Ababa",
    ping: "কফির জন্মভূমি",
    pulse: true,
  },
  {
    id: "bd",
    lat: 23.8103,
    lng: 90.4125,
    label: "বাংলাদেশ — BornoCafe ❤️ 🇧🇩",
    country: "Bangladesh",
    fact: "আমাদের ঠিকানা — মিরপুর ও উত্তরা, ঢাকা। বিশ্বমানের স্বাদ এবার আপনার কাপে।",
    timeZone: "Asia/Dhaka",
    color: "#C4611B",
    size: 6,
    pulse: true,
    ping: "আমাদের ঠিকানা ❤️",
  },
];

const COFFEE_WORLD_ARCS: MapArc[] = [
  { start: { lat: 23.8103, lng: 90.4125 }, end: { lat: -15.7975, lng: -47.8919 }, color: "#C4611B", strokeWidth: 1.5 }, // BD -> Brazil (beans)
  { start: { lat: 23.8103, lng: 90.4125 }, end: { lat: 41.9028, lng: 12.4964 }, color: "#C4611B", strokeWidth: 1.5 },   // BD -> Italy (espresso)
  { start: { lat: 23.8103, lng: 90.4125 }, end: { lat: 9.0320, lng: 38.7480 }, color: "#C4611B", strokeWidth: 1.5 },    // BD -> Ethiopia (origin)
  { start: { lat: 23.8103, lng: 90.4125 }, end: { lat: 60.1699, lng: 24.9384 }, color: "#C4611B", strokeWidth: 1.5 },   // BD -> Finland (top consumer)
];

export function App() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scope ref for all GSAP selectors
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect prefers-reduced-motion once
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // ─── Navbar scroll state ─────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Public menu data ─────────────────────────────────────────────────────
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

  // =========================================================================
  // GSAP: HERO ANIMATIONS (run once on mount)
  // =========================================================================
  useGSAP(
    () => {
      if (prefersReducedMotion.current) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from('[data-hero="eyebrow"]', { y: 24, opacity: 0, duration: 0.65 })
        .from('[data-hero="line"]',    { y: 40, opacity: 0, duration: 0.82, stagger: 0.09 }, "-=0.35")
        .from('[data-hero="para"]',    { y: 22, opacity: 0, duration: 0.7 }, "-=0.45")
        .from('[data-hero="cta"]',     { y: 20, opacity: 0, duration: 0.6, stagger: 0.12, ease: "back.out(1.4)" }, "-=0.4")
        .from('[data-hero="quote"]',   { y: 12, opacity: 0, duration: 0.5 }, "-=0.35")
        .from('[data-hero="status"]',  { y: 10, opacity: 0, duration: 0.45 }, "-=0.3")
        .from('[data-hero="image"]',   { scale: 0.95, opacity: 0, duration: 1.0, ease: "power2.out" }, 0.18);
    },
    { scope: containerRef, dependencies: [] }
  );

  // =========================================================================
  // GSAP: SCROLL-TRIGGERED ANIMATIONS (re-scoped when filteredItems changes)
  // =========================================================================
  useGSAP(
    () => {
      if (prefersReducedMotion.current) return;

      const ease = "power3.out";

      // ── Menu section header ──────────────────────────────────────────────
      gsap.from('[data-gsap="menu-header"]', {
        y: 44, opacity: 0, duration: 0.85, ease,
        scrollTrigger: { trigger: "#menu", ...ST_DEFAULTS },
      });

      // ── Product cards: stagger in ────────────────────────────────────────
      const productCards = gsap.utils.toArray<HTMLElement>('[data-gsap="product-card"]');
      if (productCards.length) {
        gsap.from(productCards, {
          y: 55, opacity: 0, duration: 0.75, ease, stagger: 0.1,
          scrollTrigger: { trigger: '[data-gsap="product-grid"]', ...ST_DEFAULTS },
        });

        // GSAP hover micro-interaction (scale + lift, owns full transform)
        productCards.forEach((card) => {
          card.addEventListener("mouseenter", () =>
            gsap.to(card, { scale: 1.03, y: -6, duration: 0.3, ease: "power2.out",
              boxShadow: "0 16px 40px 0 rgba(34,21,12,0.16)" })
          );
          card.addEventListener("mouseleave", () =>
            gsap.to(card, { scale: 1, y: 0, duration: 0.25, ease: "power2.out",
              boxShadow: "0 2px 16px 0 rgba(34,21,12,0.07)",
              onComplete: () => gsap.set(card, { clearProps: "transform,box-shadow" }) })
          );
        });
      }

      // ── Menu section bottom CTA ──────────────────────────────────────────
      gsap.from('[data-gsap="menu-cta"]', {
        y: 28, opacity: 0, duration: 0.7, ease,
        scrollTrigger: { trigger: '[data-gsap="menu-cta"]', start: "top 90%", toggleActions: "play none none none" },
      });

      // ── Story section: image slides from left, text from right ───────────
      gsap.from('[data-gsap="story-image"]', {
        x: -50, opacity: 0, duration: 0.95, ease,
        scrollTrigger: { trigger: "#story", ...ST_DEFAULTS },
      });
      gsap.from('[data-gsap="story-content"]', {
        x: 50, opacity: 0, duration: 0.95, ease,
        scrollTrigger: { trigger: "#story", ...ST_DEFAULTS },
      });

      // ── Bean-to-cup: header, then staggered cards + icon settle ─────────
      gsap.from('[data-gsap="bean-header"]', {
        y: 40, opacity: 0, duration: 0.8, ease,
        scrollTrigger: { trigger: "#bean-to-cup", ...ST_DEFAULTS },
      });

      const beanCards = gsap.utils.toArray<HTMLElement>('[data-gsap="bean-card"]');
      if (beanCards.length) {
        gsap.from(beanCards, {
          y: 50, opacity: 0, duration: 0.75, ease, stagger: 0.13,
          scrollTrigger: { trigger: '[data-gsap="bean-grid"]', ...ST_DEFAULTS },
        });
        // Icons: scale 0.8 → 1 with rotation settle
        gsap.from('[data-gsap="bean-icon"]', {
          scale: 0.8, rotation: -5, opacity: 0, duration: 0.65, ease: "back.out(1.7)", stagger: 0.13,
          scrollTrigger: { trigger: '[data-gsap="bean-grid"]', start: "top 82%", toggleActions: "play none none none" },
          delay: 0.2,
        });
        // Hover on bean cards
        beanCards.forEach((card) => {
          card.addEventListener("mouseenter", () =>
            gsap.to(card, { scale: 1.03, y: -5, duration: 0.28, ease: "power2.out" })
          );
          card.addEventListener("mouseleave", () =>
            gsap.to(card, { scale: 1, y: 0, duration: 0.22, ease: "power2.out",
              onComplete: () => gsap.set(card, { clearProps: "transform" }) })
          );
        });
      }

      // ── QR / Ordering section ────────────────────────────────────────────
      gsap.from('[data-gsap="qr-content"]', {
        y: 44, opacity: 0, duration: 0.9, ease,
        scrollTrigger: { trigger: "#qr-order", ...ST_DEFAULTS },
      });
      gsap.from('[data-gsap="qr-preview"]', {
        y: 44, opacity: 0, duration: 0.9, ease, delay: 0.18,
        scrollTrigger: { trigger: "#qr-order", ...ST_DEFAULTS },
      });

      // ── Atmosphere section: header + staggered cards ──────────────────────
      gsap.from('[data-gsap="atm-header"]', {
        y: 40, opacity: 0, duration: 0.8, ease,
        scrollTrigger: { trigger: "#atmosphere", ...ST_DEFAULTS },
      });

      const atmCards = gsap.utils.toArray<HTMLElement>('[data-gsap="atm-card"]');
      if (atmCards.length) {
        gsap.from(atmCards, {
          y: 50, opacity: 0, duration: 0.75, ease, stagger: 0.1,
          scrollTrigger: { trigger: '[data-gsap="atm-grid"]', ...ST_DEFAULTS },
        });
        gsap.from('[data-gsap="atm-icon"]', {
          scale: 0.8, rotation: -5, opacity: 0, duration: 0.6, ease: "back.out(1.7)", stagger: 0.1,
          scrollTrigger: { trigger: '[data-gsap="atm-grid"]', start: "top 82%", toggleActions: "play none none none" },
          delay: 0.18,
        });
        atmCards.forEach((card) => {
          card.addEventListener("mouseenter", () =>
            gsap.to(card, { scale: 1.03, y: -5, duration: 0.28, ease: "power2.out" })
          );
          card.addEventListener("mouseleave", () =>
            gsap.to(card, { scale: 1, y: 0, duration: 0.22, ease: "power2.out",
              onComplete: () => gsap.set(card, { clearProps: "transform" }) })
          );
        });
      }

      // ── World map section ────────────────────────────────────────────────
      gsap.from('[data-gsap="world-header"]', {
        y: 40, opacity: 0, duration: 0.8, ease,
        scrollTrigger: { trigger: "#world-coffee", ...ST_DEFAULTS },
      });
      gsap.from('[data-gsap="world-map-box"]', {
        y: 45, opacity: 0, duration: 0.9, ease, delay: 0.15,
        scrollTrigger: { trigger: "#world-coffee", ...ST_DEFAULTS },
      });

      // ── Final CTA — dramatic, slower entrance ────────────────────────────
      gsap.from('[data-gsap="final-badge"]', {
        y: 16, opacity: 0, duration: 0.8, ease,
        scrollTrigger: { trigger: '[data-gsap="final-cta"]', ...ST_DEFAULTS },
      });
      gsap.from('[data-gsap="final-line"]', {
        scale: 0.96, y: 32, opacity: 0, duration: 1.2, ease: "power3.out", stagger: 0.1,
        scrollTrigger: { trigger: '[data-gsap="final-cta"]', ...ST_DEFAULTS },
      });
      gsap.from('[data-gsap="final-para"]', {
        y: 20, opacity: 0, duration: 0.85, ease, delay: 0.3,
        scrollTrigger: { trigger: '[data-gsap="final-cta"]', ...ST_DEFAULTS },
      });
      gsap.from('[data-gsap="final-buttons"]', {
        y: 20, opacity: 0, duration: 0.75, ease: "back.out(1.4)", delay: 0.5,
        scrollTrigger: { trigger: '[data-gsap="final-cta"]', ...ST_DEFAULTS },
      });

      // ── Footer columns: stagger left to right ────────────────────────────
      gsap.from('[data-gsap="footer-col"]', {
        y: 28, opacity: 0, duration: 0.7, ease, stagger: 0.1,
        scrollTrigger: { trigger: "#contact", start: "top 90%", toggleActions: "play none none none" },
      });
      gsap.from('[data-gsap="footer-credit"]', {
        y: 20, opacity: 0, duration: 0.65, ease,
        scrollTrigger: { trigger: '[data-gsap="footer-credit"]', start: "top 95%", toggleActions: "play none none none" },
      });

      // Refresh after all triggers are registered
      ScrollTrigger.refresh();
    },
    { scope: containerRef, dependencies: [filteredItems] }
  );

  // =========================================================================
  // JSX
  // =========================================================================
  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#120B06] text-[#22150C] dark:text-[#FCF8F2] selection:bg-[#C4611B]/20 selection:text-[#3C2415] font-bangla-sans overflow-x-hidden"
    >

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

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#634832] dark:text-[#D8C7B5]">
            <a href="#menu" className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors">মেনু</a>
            <button
              onClick={() => navigate("/find-my-coffee")}
              className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors flex items-center gap-1.5 font-bold"
              style={{ color: A }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: A }} />
              <span>কফি খুঁজুন</span>
            </button>
            <a href="#story" className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors">আমাদের গল্প</a>
            <a href="#bean-to-cup" className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors">কফি প্রক্রিয়া</a>
            <a href="#atmosphere" className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors">ক্যাফে দর্শন</a>
            <a href="#contact" className="hover:text-[#C4611B] dark:hover:text-[#E8925A] transition-colors">যোগাযোগ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="h-10 px-4 rounded-[12px] border border-[#D8C7B5] dark:border-[#422F22] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E] text-[#422818] dark:text-[#EFE2D3] font-semibold text-xs transition-all"
            >
              স্টাফ POS →
            </Button>
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

        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#EDE1D1] dark:border-[#332317] bg-[#FDFBF7] dark:bg-[#120B06] px-5 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-3 text-sm font-semibold">
              <a href="#menu" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-[12px] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]">☕ মেনু দেখুন</a>
              <button onClick={() => { setMobileMenuOpen(false); navigate("/find-my-coffee"); }} className="p-2.5 rounded-[12px] text-left font-bold hover:bg-[#F2E8DC] dark:hover:bg-[#20150E] flex items-center gap-2" style={{ color: A }}>
                ✨ আমার কফি খুঁজুন
              </button>
              <a href="#story" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-[12px] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]">✨ আমাদের গল্প</a>
              <a href="#bean-to-cup" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-[12px] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]">🌱 কফি প্রক্রিয়া</a>
              <a href="#atmosphere" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-[12px] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]">🌿 ক্যাফে দর্শন</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-[12px] hover:bg-[#F2E8DC] dark:hover:bg-[#20150E]">📍 যোগাযোগ</a>
            </div>
            <div className="pt-3 border-t border-[#EDE1D1] dark:border-[#332317] grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="h-11 rounded-[12px] border-[#D8C7B5] dark:border-[#422F22] font-semibold text-xs">স্টাফ POS →</Button>
              <Button onClick={() => { setMobileMenuOpen(false); navigate("/menu"); }} className="h-11 rounded-[12px] text-white font-bold text-xs" style={{ background: A_BTN }}>টেবিল থেকে অর্ডার</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ================================================================= */}
      {/* 2. HERO SECTION                                                    */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden pt-4 sm:pt-6 lg:pt-8 pb-10 lg:pb-16 border-b border-[#EDE1D1] dark:border-[#332317]">
        <div className="absolute top-8 left-1/4 w-96 h-96 rounded-full bg-[#EAD4BB]/30 dark:bg-[#2A180E]/30 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-6 right-10 w-[450px] h-[450px] rounded-full bg-[#F3DECA]/40 dark:bg-[#381F12]/20 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-16 left-8 text-lg opacity-10 pointer-events-none animate-bean-drift-1 select-none">☕</div>
        <div className="absolute bottom-20 left-1/3 text-base opacity-10 pointer-events-none animate-bean-drift-2 select-none">🌿</div>
        <div className="absolute top-24 right-10 text-lg opacity-10 pointer-events-none animate-bean-drift-3 select-none">☕</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left: Hero Copy */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">

              {/* Eyebrow — GSAP: fade + slide up */}
              <div
                data-hero="eyebrow"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] border border-[#DFCBB5] dark:border-[#422B1D] text-[11px] font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#E8925A] shadow-sm"
              >
                <Sparkles className="h-3 w-3" style={{ color: A }} />
                <span>BORNOCAFE · SPECIALTY COFFEE</span>
              </div>

              {/* Headline — GSAP: staggered line-by-line reveal */}
              <h1 className="font-bangla-serif font-bold text-3xl sm:text-5xl lg:text-[52px] xl:text-6xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.15]">
                <span data-hero="line" className="block">এক কাপ কফি,</span>
                <span data-hero="line" className="block" style={{ color: A }}>একটু আপন সময়।</span>
              </h1>

              {/* Para — GSAP: fade + slide */}
              <p
                data-hero="para"
                className="font-bangla-sans text-sm sm:text-base lg:text-[17px] text-[#5D422E] dark:text-[#C5B4A2] font-normal max-w-[520px] mx-auto lg:mx-0 leading-[1.75]"
              >
                বৃষ্টিভেজা বিকেলে জানালার পাশে বসে এক কাপ কফির উষ্ণতা যেন
                জীবনের সব না পাওয়া আক্ষেপগুলোকে মুহূর্তেই ভুলিয়ে দিতে জানে। 🖤
              </p>

              {/* CTAs — GSAP: back.out bounce stagger */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Button
                  data-hero="cta"
                  onClick={() => { const el = document.getElementById("menu"); el?.scrollIntoView({ behavior: "smooth" }); }}
                  className="w-full sm:w-auto h-12 sm:h-13 px-8 rounded-[12px] text-white font-bold text-sm shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: A_BTN, boxShadow: `0 4px 20px 0 ${A_BTN}35` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = A_BTN_HVR; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = A_BTN; }}
                >
                  <Coffee className="h-4 w-4" />
                  মেনু দেখুন
                </Button>
                <Button
                  data-hero="cta"
                  onClick={() => navigate("/menu")}
                  variant="outline"
                  className="w-full sm:w-auto h-12 sm:h-13 px-7 rounded-[12px] border border-[#D8C7B5] dark:border-[#422F22] bg-[#FAF6F0]/80 dark:bg-[#1E130B]/80 hover:bg-[#F2E8DC] dark:hover:bg-[#281810] text-[#3A2213] dark:text-[#F3E7DC] font-semibold text-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="h-4 w-4" style={{ color: A }} />
                  টেবিল থেকে অর্ডার
                </Button>
              </div>

              {/* Quote — GSAP: delayed fade */}
              <div data-hero="quote" className="pt-1 flex justify-center lg:justify-start">
                <BanglaCoffeeQuotes />
              </div>

              {/* Barista status — GSAP: last to appear */}
              <div data-hero="status" className="pt-1 flex items-center justify-center lg:justify-start gap-2.5 text-xs font-medium text-[#8C6446] dark:text-[#AA9380]">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  বারিস্টা কাউন্টার খোলা · আজ {business.openingTime} — {business.closingTime}
                </span>
                <span>•</span>
                <span className="text-muted-foreground/75">মিরপুর ও উত্তরা শাখা</span>
              </div>
            </div>

            {/* Right: 3D Page-Flip Book — GSAP: scale 0.95→1 + fade (data-hero="image") */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div
                data-hero="image"
                className="relative w-full max-w-lg lg:max-w-none will-change-transform"
              >
                {/* Warm ambient glow backdrop */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#EAD4BB]/50 via-[#F3DECA]/30 to-[#E0C7AA]/40 dark:from-[#3A1E0E]/30 dark:via-[#261309]/20 dark:to-[#4A2612]/20 rounded-[36px] blur-2xl -z-10 pointer-events-none" />

                {/* Responsive wrapper: clamps book width on mobile */}
                <div className="w-full overflow-hidden flex items-center justify-center">
                  <ThreeDImagePageflip
                    pages={BORNOCAFE_PAGES}
                    /* ── Dimensions: portrait aspect, matches old image height ── */
                    pageWidth={210}
                    pageHeight={310}
                    /* ── Brand styling ── */
                    accentColor="#C4611B"
                    radius="16px"
                    shadowIntensity={0.3}
                    /* ── Spine ── */
                    showSpineBinding={true}
                    spineShift={true}
                    /* ── Interaction ── */
                    autoplay={true}
                    autoplayInterval={4000}
                    pauseOnHover={true}
                    interactive={true}
                    showControls={true}
                    showPageNumbers={false}
                    /* ── Animation ── */
                    duration={0.7}
                    easing="cubic-bezier(0.4, 0, 0.2, 1)"
                    peekAngle={12}
                    /* ── Container ── */
                    className="font-bangla-sans"
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
      <section id="menu" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Header — GSAP: single block fade+slide */}
        <div data-gsap="menu-header" className="text-center space-y-3 max-w-2xl mx-auto">
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
          {/* Category filter pills */}
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

        {/* Product Cards Grid — GSAP: stagger + hover micro-interaction */}
        <div data-gsap="product-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              data-gsap="product-card"
              onClick={() => navigate("/menu")}
              className="card-lift group relative rounded-[16px] bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] p-5 flex flex-col justify-between cursor-pointer hover:border-[#C4611B]/50 will-change-transform"
              style={{ boxShadow: "0 2px 16px 0 rgba(34,21,12,0.07), 0 1px 4px 0 rgba(34,21,12,0.04)" }}
            >
              <div className="relative h-48 w-full rounded-[16px] overflow-hidden bg-[#EFE4D6] dark:bg-[#261810] mb-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 dark:bg-black/90 text-[#3A2213] dark:text-[#FAF4ED] backdrop-blur-xs shadow-sm">
                    {item.tag}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-white/90">
                  <Coffee className="h-3 w-3 text-amber-300" />
                  <span>{item.origin}</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div>
                  <h3 className="font-bangla-serif font-bold text-xl text-[#22150C] dark:text-[#FAF4ED] group-hover:text-[#C4611B] transition-colors">
                    {item.name}
                  </h3>
                  {item.englishName && (
                    <span className="text-[11px] font-semibold text-muted-foreground block">{item.englishName}</span>
                  )}
                </div>
                <p className="font-bangla-sans text-xs text-[#6E4F39] dark:text-[#BDB0A2] line-clamp-2 leading-[1.75] font-normal">
                  {item.description}
                </p>
              </div>
              <div className="pt-3 border-t border-[#EDE1D1] dark:border-[#332317] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6446] dark:text-[#9F8A77] block">
                    {item.size || "শুরু মাত্র"}
                  </span>
                  <span className="text-xl font-black font-tabular" style={{ color: A }}>৳{item.price}</span>
                </div>
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

        {/* CTA row — GSAP: fade+slide as single block */}
        <div data-gsap="menu-cta" className="text-center pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/menu")}
              className="h-12 px-8 rounded-[12px] bg-[#3C2415] hover:bg-[#28160B] dark:bg-[#FAF4ED] dark:hover:bg-white dark:text-[#120B06] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>সম্পূর্ণ মেনু দেখুন ({products.length || 18}+ আইটেম)</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
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
      <section id="story" className="py-12 sm:py-16 bg-[#F5ECE0] dark:bg-[#160E08] border-y border-[#EDE1D1] dark:border-[#332317]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Image — GSAP: slides from left */}
            <div data-gsap="story-image" className="lg:col-span-5 relative">
              <div
                className="relative h-80 sm:h-96 w-full rounded-[16px] overflow-hidden border border-[#DFCBB5] dark:border-[#382417] will-change-transform"
                style={{ boxShadow: "0 4px 32px 0 rgba(34,21,12,0.12), 0 1px 6px 0 rgba(34,21,12,0.06)" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
                  alt="Barista crafting coffee"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">আমাদের গল্প</span>
                  <h4 className="font-bangla-serif font-bold text-xl">প্রতিটি কাপে ভালোবাসা</h4>
                  <p className="font-bangla-sans text-xs text-white/80 mt-1 leading-[1.75]">
                    ঢাকায় বসে বিশ্বমানের স্পেশালিটি কফির অনন্য অনুভূতি।
                  </p>
                </div>
              </div>
            </div>

            {/* Text — GSAP: slides from right */}
            <div data-gsap="story-content" className="lg:col-span-7 space-y-6 will-change-transform">
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
      <section id="bean-to-cup" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Header — GSAP: fade+slide */}
        <div data-gsap="bean-header" className="text-center space-y-3 max-w-xl mx-auto">
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

        {/* Process Cards — GSAP: stagger + icon rotation settle */}
        <div data-gsap="bean-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "০১", title: "ভালো কফি বাছাই",        desc: "সেরা সিঙ্গেল অরিজিন ও স্পেশালিটি অ্যারাবিকা কফি বিনের সতেজ সংগ্রহ।",               Icon: Leaf },
            { step: "০২", title: "সতেজভাবে গ্রাইন্ড",    desc: "প্রতিটি অর্ডারের সময় অন-ডিমান্ড প্রিসিশন গ্রাইন্ডিং।",                              Icon: Sliders },
            { step: "০৩", title: "যত্নে ব্রু করা",        desc: "৯৩°C ক্যালিব্রেটেড তাপমাত্রা ও নিখুঁত ৯-বার প্রেসার এক্সট্রাকশন।",                   Icon: ChefHat },
            { step: "০৪", title: "আপনার হাতে পৌঁছে দেওয়া", desc: "টেবিলে গরম কফি, মন জুড়ানো সুবাস ও সিল্কি লাতে আর্ট।",                           Icon: Heart },
          ].map((stepItem, idx) => (
            <div
              key={idx}
              data-gsap="bean-card"
              className="card-lift p-6 rounded-[16px] bg-[#FAF6F0] dark:bg-[#1F140D] border border-[#E9DAC8] dark:border-[#382417] space-y-4 relative overflow-hidden will-change-transform"
              style={{ boxShadow: "0 2px 16px 0 rgba(34,21,12,0.07)" }}
            >
              <div className="flex items-center justify-between">
                {/* Icon — GSAP: scale + rotation settle */}
                <div
                  data-gsap="bean-icon"
                  className="flex h-11 w-11 items-center justify-center rounded-[12px] will-change-transform"
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
      <section id="qr-order" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-[16px] bg-gradient-to-br from-[#FAF5EE] via-[#F4E9DC] to-[#E9D6C3] dark:from-[#24170F] dark:via-[#1D120A] dark:to-[#140C07] border border-[#DFCBB5] dark:border-[#382417] p-8 sm:p-12 lg:p-16 relative overflow-hidden"
          style={{ boxShadow: "0 8px 48px 0 rgba(34,21,12,0.10), 0 2px 8px 0 rgba(34,21,12,0.05)" }}
        >
          <div className="absolute -right-16 -bottom-16 w-80 h-80 opacity-[0.07] pointer-events-none">
            <QrCode className="w-full h-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left — GSAP: fade+slide */}
            <div data-gsap="qr-content" className="lg:col-span-7 space-y-6 will-change-transform">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
                <Sparkles className="h-3.5 w-3.5" style={{ color: A }} />
                <span>স্মার্ট ক্যাফে সার্ভিস</span>
              </div>
              <h2 className="font-bangla-serif font-bold text-3xl sm:text-5xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.2]">
                আপনার টেবিল থেকেই <br />
                <span style={{ color: A }}>অর্ডার করুন।</span>
              </h2>
              <p className="font-bangla-sans text-sm sm:text-base text-[#5D422E] dark:text-[#C5B4A2] font-normal leading-[1.75] max-w-xl">
                QR স্ক্যান করুন, পছন্দের কফি বেছে নিন, আর অপেক্ষা করুন আপনার অর্ডারের জন্য।
              </p>
              <div className="p-3.5 rounded-[12px] bg-white/70 dark:bg-black/30 border border-[#DFCBB5]/70 dark:border-[#382417] max-w-md">
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold uppercase tracking-wider">
                  <div className="p-1.5 rounded-[8px] text-white" style={{ background: A }}>১. স্ক্যান</div>
                  <div className="p-1.5 rounded-[8px] bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">২. অর্ডার</div>
                  <div className="p-1.5 rounded-[8px] bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">৩. প্রস্তুত</div>
                  <div className="p-1.5 rounded-[8px] bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D4A373]">৪. পরিবেশন</div>
                </div>
              </div>
              <div className="pt-2 flex flex-wrap gap-3">
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
                <Button variant="outline" onClick={() => navigate("/display")} className="h-12 px-6 rounded-[12px] border-[#DFCBB5] dark:border-[#422F22] font-semibold text-sm flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-blue-600" />
                  লাইভ টিভি ডিসপ্লে
                </Button>
              </div>
            </div>

            {/* Right preview card — GSAP: delayed fade+slide */}
            <div data-gsap="qr-preview" className="lg:col-span-5 flex justify-center will-change-transform">
              <div
                className="w-full max-w-sm p-6 rounded-[16px] bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] space-y-4"
                style={{ boxShadow: "0 8px 40px 0 rgba(34,21,12,0.12)" }}
              >
                <div className="flex items-center justify-between border-b border-[#EDE1D1] dark:border-[#332317] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">আপনার অর্ডার এখন কোথায়?</span>
                    <h4 className="font-bangla-serif font-bold text-2xl text-[#22150C] dark:text-[#FAF4ED]">অর্ডার #A1025</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 animate-pulse">● কফি তৈরি হচ্ছে</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#5D422E] dark:text-[#C5B4A2]">
                    <span className="font-bold text-[#22150C] dark:text-[#FAF4ED]">১× ভেলভেট ফ্ল্যাট হোয়াইট (ওট মিল্ক)</span>
                    <span className="font-tabular font-bold">৳২৪০</span>
                  </div>
                  <div className="flex justify-between items-center text-[#5D422E] dark:text-[#C5B4A2]">
                    <span className="font-bold text-[#22150C] dark:text-[#FAF4ED]">১× বাটার আলমন্ড ক্রসাঁ</span>
                    <span className="font-tabular font-bold">৳১৮০</span>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-[#EDE1D1] dark:border-[#332317]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6446] dark:text-[#9F8A77] block">প্রস্তুতি অগ্রগতি (আনুমানিক ৫–৭ মিনিট)</span>
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
      <section id="atmosphere" className="py-12 sm:py-16 bg-[#F7F0E6] dark:bg-[#160E08] border-t border-[#EDE1D1] dark:border-[#332317]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* Header — GSAP: fade+slide */}
          <div data-gsap="atm-header" className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8C5D3D] dark:text-[#D4A373]">ক্যাফে অনুভূতি</span>
            <h2 className="font-bangla-serif font-bold text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
              কফির চেয়েও বেশি কিছু
            </h2>
            <p className="font-bangla-sans text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-[1.75]">
              একটি শান্ত, নান্দনিক, আধুনিক কফি শপ — যেখানে কফি শুধু পানীয় নয়, ছোট্ট একটি অনুভূতি।
            </p>
          </div>

          {/* Atmosphere Cards — GSAP: stagger + icon settle */}
          <div data-gsap="atm-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: Sun,    title: "সকালের নীরবতা",          desc: "শান্ত সুর ও মিষ্টি রোদের উষ্ণতায় বই পড়ার কিংবা দিনের শুরু করার একান্ত অবসর।" },
              { Icon: Users,  title: "বন্ধুর সাথে দীর্ঘ আড্ডা", desc: "হাসিমুখের খুনসুটি, স্মৃতিচারণ আর ধোঁয়া ওঠা প্রিয় কফির সাথে গল্প।" },
              { Icon: Smile,  title: "একটু নিজের সময়",         desc: "ব্যস্ত শহরের ক্লান্তি ভুলে নিজের সাথে একান্তে কয়েক চুমুক কফি উপভোগ করা।" },
              { Icon: Laptop, title: "কাজের ফাঁকে ছোট্ট বিরতি", desc: "ফ্রেশ এনার্জি নিয়ে কাজে ফেরার মিষ্টি রিফ্রেশমেন্ট ও অনুপ্রেরণা।" },
            ].map(({ Icon, title, desc }, idx) => (
              <div
                key={idx}
                data-gsap="atm-card"
                className="card-lift p-7 rounded-[16px] bg-[#FAF6F0] dark:bg-[#1F140D] border border-[#E9DAC8] dark:border-[#382417] space-y-3 group will-change-transform"
                style={{ boxShadow: "0 2px 16px 0 rgba(34,21,12,0.07)" }}
              >
                <div
                  data-gsap="atm-icon"
                  className="flex h-11 w-11 items-center justify-center rounded-[12px] will-change-transform"
                  style={{ background: `${A}15`, color: A }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-bangla-serif font-bold text-lg text-[#22150C] dark:text-[#FAF4ED]">{title}</h3>
                <p className="font-bangla-sans text-xs text-[#6E4F39] dark:text-[#BDB0A2] leading-[1.75] font-normal">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 7.5 GLOBAL COFFEE CULTURE / WORLD MAP SECTION                    */}
      {/* ================================================================= */}
      <section id="world-coffee" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div data-gsap="world-header" className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373]">
            <Globe className="h-3.5 w-3.5" style={{ color: A }} />
            <span>গ্লোবাল কফি সংস্কৃতি</span>
          </div>
          <h2 className="font-bangla-serif font-bold text-3xl sm:text-4xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
            বিশ্বজুড়ে কফির নেশা
          </h2>
          <p className="font-bangla-sans text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-[1.75]">
            পৃথিবীর যেসব দেশ কফিকে ভালোবাসে সবচেয়ে বেশি — এবং যেখানকার ঐতিহ্য অনুপ্রাণিত করে BornoCafe-কে।
          </p>
        </div>

        {/* Interactive Map Box */}
        <div
          data-gsap="world-map-box"
          className="relative rounded-[16px] sm:rounded-[20px] bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] p-4 sm:p-7 overflow-hidden will-change-transform"
          style={{ boxShadow: "0 4px 32px 0 rgba(34,21,12,0.08), 0 1px 4px 0 rgba(34,21,12,0.04)" }}
        >
          {/* Map container with responsive height */}
          <div className="w-full h-[320px] sm:h-[440px] lg:h-[490px] relative">
            <WorldMap
              markers={COFFEE_WORLD_MARKERS}
              arcs={COFFEE_WORLD_ARCS}
              markerColor={A}
              pulse={true}
              enableTooltips={true}
              interactive={true}
              dotRadius={1.7}
              className="w-full h-full"
            />
          </div>

          {/* Map footer info / Key Highlights */}
          <div className="mt-4 pt-4 border-t border-[#EDE1D1] dark:border-[#332317] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#6E4F39] dark:text-[#BDB0A2]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C4611B] animate-pulse" />
              <span className="font-bold text-[#22150C] dark:text-[#FAF4ED]">বাংলাদেশ (BornoCafe)</span>
              <span className="opacity-60 hidden sm:inline">•</span>
              <span className="hidden sm:inline">সারা বিশ্বের সেরা কফি সংস্কৃতি থেকে অনুপ্রাণিত</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#8C6446] dark:text-[#9F8A77]">
              <Sparkles className="h-3 w-3 text-[#C4611B]" />
              <span>যেকোনো মার্কারের উপর হোভার করে তথ্য দেখুন</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 8. COFFEE & CULTURE LIFESTYLE                                      */}
      {/* ================================================================= */}
      <CoffeeCultureLifestyle />

      {/* ================================================================= */}
      {/* 9. FINAL CTA — dramatic entrance                                   */}
      {/* ================================================================= */}
      <section
        data-gsap="final-cta"
        className="py-14 sm:py-20 bg-gradient-to-br from-[#2A180E] via-[#201108] to-[#140A04] text-white text-center border-t border-[#4E311F]"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div data-gsap="final-badge" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>বর্নক্যাফে অভিজ্ঞতা</span>
          </div>

          {/* Heading — GSAP: scale-up entrance, staggered lines */}
          <h2 className="font-bangla-serif font-bold text-3xl sm:text-5xl text-[#FAF4ED] tracking-tight leading-[1.2]">
            <span data-gsap="final-line" className="block will-change-transform">আজকের কাপটা</span>
            <span data-gsap="final-line" className="block text-[#E8925A] will-change-transform">আপনার জন্য অপেক্ষায়।</span>
          </h2>

          <p data-gsap="final-para" className="font-bangla-sans text-sm sm:text-base text-[#D8C7B5] max-w-xl mx-auto font-normal leading-[1.75] will-change-transform">
            পছন্দের কফি বেছে নিন, আর শুরু হোক আপনার ছোট্ট বিরতি।
          </p>

          <div data-gsap="final-buttons" className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 will-change-transform">
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
          {/* Footer columns — GSAP: stagger left→right */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#DFCBB5]/80 dark:border-[#332317]">
            <div data-gsap="footer-col" className="space-y-3 will-change-transform">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] text-white" style={{ background: A_BTN }}>
                  <Coffee className="h-5 w-5" />
                </div>
                <span className="font-bangla-serif font-bold text-lg text-[#22150C] dark:text-[#FAF4ED]">{business.name}</span>
              </div>
              <p className="font-bangla-sans text-xs text-[#6E4F39] dark:text-[#A89684] leading-[1.75]">
                কফির সাথে ছোট্ট কিছু মুহূর্ত। স্পেশালিটি কফি রোস্টারি ও আধুনিক ক্যাফে অভিজ্ঞতা।
              </p>
            </div>

            <div data-gsap="footer-col" className="space-y-2 will-change-transform">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#22150C] dark:text-[#FAF4ED] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" style={{ color: A }} />
                খোলা থাকার সময়সূচি
              </h5>
              <p>প্রতিদিন (সোমবার – রবিবার)</p>
              <p className="font-bold text-[#22150C] dark:text-[#FAF4ED]">{business.openingTime} – {business.closingTime}</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">● তাজা রোস্ট কফি পরিবেশিত হচ্ছে</p>
            </div>

            <div data-gsap="footer-col" className="space-y-2 will-change-transform">
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

            <div data-gsap="footer-col" className="space-y-2 will-change-transform">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#22150C] dark:text-[#FAF4ED] flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" style={{ color: A }} />
                দ্রুত লিংকসমূহ
              </h5>
              <div className="flex flex-col space-y-1.5 font-semibold">
                <button onClick={() => navigate("/menu")} className="text-left hover:text-[#C4611B] transition-colors">📱 মেনু ও টেবিল থেকে অর্ডার</button>
                <a href="#story" className="text-left hover:text-[#C4611B] transition-colors">✨ আমাদের গল্প</a>
                <button onClick={() => navigate("/display")} className="text-left hover:text-[#C4611B] transition-colors">📺 লাইভ অর্ডার টিভি ডিসপ্লে</button>
                <button onClick={() => navigate("/login")} className="text-left hover:text-[#C4611B] transition-colors">🔐 স্টাফ POS রেজিস্টার</button>
              </div>
            </div>
          </div>

          {/* Footer credit — GSAP: fade in last */}
          <div data-gsap="footer-credit" className="pt-10 pb-4 text-center space-y-4 max-w-2xl mx-auto px-4 will-change-transform">
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
              <p className="text-[11px] sm:text-xs text-[#6E4F39] dark:text-[#A89684] font-medium tracking-wide">"Crafted with care by Bornosoft"</p>
              <div>
                <a href="https://bornosoft.bd" target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold hover:underline transition-colors inline-block" style={{ color: A }}>
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
