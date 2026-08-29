import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import {
  Coffee,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Clock,
  Utensils,
  ShoppingBag,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
  scoreProfile: {
    strength: number; // 1 (mild) to 4 (very strong)
    milk: number; // 0 (none), 1 (low), 2 (medium), 3 (heavy)
    sweetness: number; // 0 (none), 1 (low), 2 (medium), 3 (high)
    temperature: "hot" | "cold" | "any";
    snackType?: "light" | "sweet" | "crispy" | "heavy" | "none";
  };
}

interface QuizQuestion {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  options: QuizOption[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: "আজ আপনার মুড কেমন?",
    subtitle: "দিনের এই মুহূর্তটার সাথে মানানসই কফি বেছে নিতে সাহায্য করুন",
    icon: "🌿",
    options: [
      {
        id: "mood_calm",
        label: "একটু শান্ত",
        sublabel: "হালকা আমেজ ও নিঃশব্দ আরাম",
        icon: "🍃",
        scoreProfile: { strength: 2, milk: 2, sweetness: 1, temperature: "hot" },
      },
      {
        id: "mood_fresh",
        label: "ফ্রেশ হতে চাই",
        sublabel: "ক্লান্তি দূর করে নতুন সতেজতা",
        icon: "🌊",
        scoreProfile: { strength: 2, milk: 1, sweetness: 1, temperature: "cold" },
      },
      {
        id: "mood_energy",
        label: "এনার্জি দরকার",
        sublabel: "বোল্ড ও জোরালো ক্যাফেইন বুস্ট",
        icon: "⚡",
        scoreProfile: { strength: 4, milk: 0, sweetness: 0, temperature: "hot" },
      },
      {
        id: "mood_adda",
        label: "আড্ডার মুড",
        sublabel: "বন্ধুদের সাথে দীর্ঘ আড্ডা ও চুমুক",
        icon: "☕",
        scoreProfile: { strength: 2, milk: 2, sweetness: 2, temperature: "any" },
      },
      {
        id: "mood_myself",
        label: "নিজের মতো একটু সময়",
        sublabel: "একান্তে কিছু মুহূর্ত ও প্রিয় স্বাদ",
        icon: "✨",
        scoreProfile: { strength: 2, milk: 2, sweetness: 1, temperature: "hot" },
      },
    ],
  },
  {
    id: 2,
    title: "কফি কেমন strong পছন্দ?",
    subtitle: "এসপ্রেসোর তীব্রতা ও গন্ধের মাত্রা ঠিক করুন",
    icon: "🔥",
    options: [
      {
        id: "str_mild",
        label: "একদম হালকা",
        sublabel: "সহজ, নরম ও মিহি ফ্লেভার",
        icon: "🌱",
        scoreProfile: { strength: 1, milk: 3, sweetness: 2, temperature: "any" },
      },
      {
        id: "str_balanced",
        label: "Balanced",
        sublabel: "কফি ও দুধের পারফেক্ট ভারসাম্য",
        icon: "⚖️",
        scoreProfile: { strength: 2, milk: 2, sweetness: 1, temperature: "any" },
      },
      {
        id: "str_medium",
        label: "মাঝারি strong",
        sublabel: "কফির মিষ্টি কড়া সুবাস",
        icon: "☕",
        scoreProfile: { strength: 3, milk: 1, sweetness: 1, temperature: "any" },
      },
      {
        id: "str_bold",
        label: "Strong & bold",
        sublabel: "তীব্র, খাঁটি ও রিচ রোস্ট",
        icon: "💥",
        scoreProfile: { strength: 4, milk: 0, sweetness: 0, temperature: "hot" },
      },
    ],
  },
  {
    id: 3,
    title: "দুধের ব্যাপারে?",
    subtitle: "টেক্সচার কেমন ক্রিমি কিংবা ব্ল্যাক পছন্দ করবেন",
    icon: "🥛",
    options: [
      {
        id: "milk_none",
        label: "দুধ ছাড়া",
        sublabel: "ব্ল্যাক কফির নিখুঁত নোটস",
        icon: "🖤",
        scoreProfile: { strength: 4, milk: 0, sweetness: 0, temperature: "any" },
      },
      {
        id: "milk_little",
        label: "অল্প দুধ",
        sublabel: "কফির কড়া স্বাদ অক্ষুণ্ণ রেখে হালকা ছোঁয়া",
        icon: "☕",
        scoreProfile: { strength: 3, milk: 1, sweetness: 1, temperature: "any" },
      },
      {
        id: "milk_creamy",
        label: "ক্রিমি দুধ",
        sublabel: "সিল্কি মাইক্রোফোম ও স্মুথ টেক্সচার",
        icon: "☁️",
        scoreProfile: { strength: 2, milk: 2, sweetness: 1, temperature: "hot" },
      },
      {
        id: "milk_heavy",
        label: "দুধ বেশি হলে ভালো",
        sublabel: "রিচ, মাখনের মতো মসৃণ ও ফোমি",
        icon: "🍶",
        scoreProfile: { strength: 1, milk: 3, sweetness: 2, temperature: "any" },
      },
    ],
  },
  {
    id: 4,
    title: "মিষ্টি কতটা?",
    subtitle: "স্বাদের মিষ্টি মাত্রা বেছে নিন",
    icon: "🍯",
    options: [
      {
        id: "sw_none",
        label: "চিনি ছাড়াই",
        sublabel: "প্রাকৃতিক কফি বিনের খাঁটি স্বাদ",
        icon: "🚫",
        scoreProfile: { strength: 3, milk: 1, sweetness: 0, temperature: "any" },
      },
      {
        id: "sw_low",
        label: "হালকা মিষ্টি",
        sublabel: "সূক্ষ্ম ক্যারামেল কিংবা মধুর সুবাস",
        icon: "✨",
        scoreProfile: { strength: 2, milk: 2, sweetness: 1, temperature: "any" },
      },
      {
        id: "sw_med",
        label: "মিষ্টি ভালোই লাগে",
        sublabel: "আনন্দদায়ক সুষম মিষ্টি আমেজ",
        icon: "🍯",
        scoreProfile: { strength: 2, milk: 2, sweetness: 2, temperature: "any" },
      },
      {
        id: "sw_high",
        label: "আজ একটু sweet চাই",
        sublabel: "চকলেট বা ভ্যানিলার মিষ্টি ডেজার্ট অনুভূতি",
        icon: "🍫",
        scoreProfile: { strength: 1, milk: 3, sweetness: 3, temperature: "any" },
      },
    ],
  },
  {
    id: 5,
    title: "কখনের জন্য কফি?",
    subtitle: "দিনের কোন সময়টিতে আপনি এই কফি উপভোগ করবেন",
    icon: "🕒",
    options: [
      {
        id: "time_morning",
        label: "সকালের শুরু",
        sublabel: "দিনের প্রথম ফ্রেশ ও চনমনে শুরু",
        icon: "🌅",
        scoreProfile: { strength: 3, milk: 1, sweetness: 1, temperature: "hot" },
      },
      {
        id: "time_work",
        label: "পড়াশোনা / কাজ",
        sublabel: "মনোযোগ ধরে রাখতে নিখুঁত সঙ্গী",
        icon: "💻",
        scoreProfile: { strength: 3, milk: 1, sweetness: 0, temperature: "hot" },
      },
      {
        id: "time_afternoon",
        label: "বিকেলের বিরতি",
        sublabel: "ক্লান্তির মাঝে আরামদায়ক ছোট্ট মুহূর্ত",
        icon: "🌇",
        scoreProfile: { strength: 2, milk: 2, sweetness: 1, temperature: "any" },
      },
      {
        id: "time_adda",
        label: "বন্ধুদের সাথে আড্ডা",
        sublabel: "গল্পগুজব আর মজার খুনসুটি",
        icon: "👥",
        scoreProfile: { strength: 2, milk: 2, sweetness: 2, temperature: "cold" },
      },
      {
        id: "time_night",
        label: "রাতের শান্ত সময়",
        sublabel: "নিস্তব্ধ রাতের উষ্ণ বা ডিক্যাফ অনুভূতি",
        icon: "🌙",
        scoreProfile: { strength: 1, milk: 2, sweetness: 1, temperature: "hot" },
      },
    ],
  },
  {
    id: 6,
    title: "আজ কফির সাথে কী চাই?",
    subtitle: "আপনার প্রিয় পেয়ারিং বা স্ন্যাক বেছে নিন",
    icon: "🥐",
    options: [
      {
        id: "snack_none",
        label: "শুধু কফি",
        sublabel: "খাঁটি কফির একচ্ছত্র স্বাদ",
        icon: "☕",
        scoreProfile: { strength: 3, milk: 1, sweetness: 1, temperature: "any", snackType: "none" },
      },
      {
        id: "snack_light",
        label: "হালকা কিছু",
        sublabel: "কুকিজ বা বাটারি কুকি ক্রাঞ্চ",
        icon: "🍪",
        scoreProfile: { strength: 2, milk: 2, sweetness: 1, temperature: "any", snackType: "light" },
      },
      {
        id: "snack_sweet",
        label: "মিষ্টি কিছু",
        sublabel: "ব্রাউনি, চিজকেক বা পেস্ট্রি",
        icon: "🍰",
        scoreProfile: { strength: 3, milk: 1, sweetness: 1, temperature: "any", snackType: "sweet" },
      },
      {
        id: "snack_crispy",
        label: "ক্রিসপি কিছু",
        sublabel: "বাটারি ক্রসোয়া বা ক্রিসপি টোস্ট",
        icon: "🥐",
        scoreProfile: { strength: 2, milk: 2, sweetness: 1, temperature: "any", snackType: "crispy" },
      },
      {
        id: "snack_heavy",
        label: "একটু heavy snack",
        sublabel: "ক্লাব স্যান্ডউইচ বা সুস্বাদু বেগল",
        icon: "🥪",
        scoreProfile: { strength: 2, milk: 1, sweetness: 0, temperature: "any", snackType: "heavy" },
      },
    ],
  },
];

// Fallback curated drink profiles
interface RecommendationModel {
  slug: string;
  name: string;
  banglaName: string;
  category: string;
  price: number;
  matchScore: number;
  description: string;
  moodTag: string;
  tasteTag: string;
  styleTag: string;
  imageUrl: string;
  pairedSnack: {
    name: string;
    banglaName: string;
    description: string;
    price: number;
    imageUrl: string;
  };
}

const PRESET_RECOMMENDATIONS: Record<string, RecommendationModel> = {
  espresso: {
    slug: "espresso",
    name: "Classic Single/Double Espresso",
    banglaName: "এক কাপ এসপ্রেসো",
    category: "Coffee",
    price: 180,
    matchScore: 96,
    description:
      "আপনি বোল্ড, ইনটেন্স ও খাঁটি কফির শক্তি পছন্দ করেন। ৯ বার প্রেসারে বের করা ঘন সোনালী ক্রেমার এসপ্রেসো আপনার জন্য সেরা।",
    moodTag: "High Energy & Focus",
    tasteTag: "Bold & Intense",
    styleTag: "Pure Espresso",
    imageUrl:
      "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80",
    pairedSnack: {
      name: "Butter Croissant",
      banglaName: "বাটার ক্রসওয়া",
      description: "কড়া এসপ্রেসোর তীব্রতার সাথে ফ্রেঞ্চ বাটারি ক্রসোয়ার নরম ক্রাঞ্চ এক অনন্য মেলবন্ধন।",
      price: 160,
      imageUrl:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80",
    },
  },
  americano: {
    slug: "americano",
    name: "Specialty Americano",
    banglaName: "এক কাপ আমেরিকান",
    category: "Coffee",
    price: 200,
    matchScore: 94,
    description:
      "আপনি কোনো দুধ বা অতিরিক্ত চিনি ছাড়া দীর্ঘক্ষণ উপভোগ্য রিফ্রেশিং ব্ল্যাক কফি পছন্দ করেন।",
    moodTag: "Calm & Deep Focus",
    tasteTag: "Clean & Aromatic",
    styleTag: "Black Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    pairedSnack: {
      name: "Artisan Chocolate Cookie",
      banglaName: "চকলেট কুকি",
      description: "ক্লিন আমেরিকানোর স্বাদের সাথে ডার্ক চকলেটের হালকা মিষ্টি কামড় দারুণ জুড়ি।",
      price: 120,
      imageUrl:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=80",
    },
  },
  cappuccino: {
    slug: "cappuccino",
    name: "Velvet Cappuccino",
    banglaName: "এক কাপ ক্যাপুচিনো",
    category: "Coffee",
    price: 240,
    matchScore: 95,
    description:
      "আপনি balanced, creamy আর একটু শান্ত ধরনের কফি পছন্দ করেন। তাই আজকের জন্য নরম ফেনা ও গাঢ় এসপ্রেসোর ক্যাপুচিনো একদম মানাবে।",
    moodTag: "Relax & Balance",
    tasteTag: "Smooth & Foamy",
    styleTag: "Balanced Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80",
    pairedSnack: {
      name: "Fresh Baked Croissant",
      banglaName: "বাটার ক্রসওয়া",
      description: "নরম ক্যাপুচিনো আর বাটারি ক্রসওয়া — বিকেলের জন্য সুন্দর একটা জুটি।",
      price: 160,
      imageUrl:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80",
    },
  },
  latte: {
    slug: "latte",
    name: "Artisan Cafe Latte",
    banglaName: "এক কাপ ক্যাফে লাতে",
    category: "Coffee",
    price: 260,
    matchScore: 93,
    description:
      "সিল্কি মাইক্রোফোম দুধ ও মোলায়েম এসপ্রেসোর মিষ্টি স্পর্শ। আপনার শান্ত সময় ও আড্ডার মুহূর্তের জন্য অতুলনীয়।",
    moodTag: "Cozy & Sociable",
    tasteTag: "Silky & Milky",
    styleTag: "Milk Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80",
    pairedSnack: {
      name: "Blueberry Cheesecake Slice",
      banglaName: "ব্লুবেরি চিজকেক",
      description: "লাতের মসৃণ ক্রিমের সাথে ব্লুবেরির মিষ্টি ট্যাঙ্গি স্বাদ এক অসাধারণ উৎসব।",
      price: 280,
      imageUrl:
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80",
    },
  },
  mocha: {
    slug: "mocha",
    name: "Dark Chocolate Mocha",
    banglaName: "এক কাপ ডার্ক মোকা",
    category: "Coffee",
    price: 290,
    matchScore: 92,
    description:
      "চকলেট ও কফির ঐশ্বরিক মেলবন্ধন। মিষ্টি, সমৃদ্ধ ও মন ভালো করে দেওয়ার মতো অনন্য ডেজার্ট কফি।",
    moodTag: "Sweet Indulgence",
    tasteTag: "Rich & Chocolatey",
    styleTag: "Sweet Specialty",
    imageUrl:
      "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80",
    pairedSnack: {
      name: "Fudge Brownie",
      banglaName: "চকোলেট ফাজ ব্রাউনি",
      description: "মোকার ডার্ক চকোলেটের গভীরতার সাথে ওয়ার্ম ব্রাউনি আপনাকে এক স্বর্গীয় স্বাদ দেবে।",
      price: 190,
      imageUrl:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80",
    },
  },
  iced_coffee: {
    slug: "iced_coffee",
    name: "Iced Caramel Macchiato",
    banglaName: "আইসড ক্যারামেল ম্যাকিয়াতো",
    category: "Cold Beverage",
    price: 280,
    matchScore: 97,
    description:
      "বরফ শীতল রিফ্রেশমেন্ট ও মিষ্টি ক্যারামেলের স্তর। ক্লান্তি দূর করে মনকে একদম চনমনে ও সতেজ করতে এটি অতুলনীয়।",
    moodTag: "Fresh & Refreshing",
    tasteTag: "Chilled & Sweet Caramel",
    styleTag: "Cold Brew / Iced Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
    pairedSnack: {
      name: "Smoked Chicken Sandwich",
      banglaName: "স্মোকড চিকেন স্যান্ডউইচ",
      description: "ঠান্ডা কফির সতেজতার সাথে হালকা মশলাদার চিকেন স্যান্ডউইচ এক পরিপূর্ণ রিফ্রেশমেন্ট।",
      price: 260,
      imageUrl:
        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80",
    },
  },
  smoothie: {
    slug: "smoothie",
    name: "Mango Passion Smoothie",
    banglaName: "ম্যাঙ্গো প্যাসন স্মুদি",
    category: "Smoothies",
    price: 270,
    matchScore: 91,
    description:
      "ক্যাফেইন ছাড়া সম্পূর্ণ প্রাকৃতিক তাজা ফলের স্বাস্থ্যকর ও প্রাণবন্ত ব্লেন্ড। দারুণ রিফ্রেশিং ও হালকা।",
    moodTag: "Pure Vitality & Health",
    tasteTag: "Fruity & Vibrant",
    styleTag: "Fruit Smoothie",
    imageUrl:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80",
    pairedSnack: {
      name: "Almond Granola Cup",
      banglaName: "গ্র্যানোলা কাপ",
      description: "ফ্রুট স্মুদির সাথে ক্রাঞ্চি বাদাম ও ওটসের স্বাস্থ্যকর জুটি।",
      price: 150,
      imageUrl:
        "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=400&q=80",
    },
  },
};

export default function FindMyCoffee() {
  const navigate = useNavigate();

  // Wizard state: 0 = Hero, 1-6 = Questions, 7 = Analyzing/Brewing, 8 = Result
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, QuizOption>>({});
  const [isBrewing, setIsBrewing] = useState<boolean>(false);

  const totalQuestions = QUIZ_QUESTIONS.length;

  const handleStartQuiz = () => {
    setCurrentStep(1);
  };

  const handleSelectOption = (questionId: number, option: QuizOption) => {
    const nextAnswers = { ...answers, [questionId]: option };
    setAnswers(nextAnswers);

    // Auto advance smoothly after brief selection feedback
    setTimeout(() => {
      if (questionId < totalQuestions) {
        setCurrentStep(questionId + 1);
      } else {
        // Complete quiz -> start brewing screen
        setCurrentStep(7);
        setIsBrewing(true);
        setTimeout(() => {
          setIsBrewing(false);
          setCurrentStep(8);
        }, 1200);
      }
    }, 280);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentStep(0);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
  };

  // Deterministic Recommendation Scoring
  const recommendation = useMemo((): RecommendationModel => {
    const q1 = answers[1]?.scoreProfile; // mood
    const q2 = answers[2]?.scoreProfile; // strength
    const q3 = answers[3]?.scoreProfile; // milk
    const q4 = answers[4]?.scoreProfile; // sweetness
    const q5 = answers[5]?.scoreProfile; // time

    const avgStrength = q2 ? q2.strength : 2;
    const avgMilk = q3 ? q3.milk : 2;
    const avgSweetness = q4 ? q4.sweetness : 1;
    const wantsCold = q1?.temperature === "cold" || q5?.temperature === "cold";

    if (wantsCold) {
      return PRESET_RECOMMENDATIONS.iced_coffee;
    }

    if (avgStrength >= 4 && avgMilk === 0) {
      return PRESET_RECOMMENDATIONS.espresso;
    }

    if (avgMilk === 0 && avgStrength >= 2) {
      return PRESET_RECOMMENDATIONS.americano;
    }

    if (avgSweetness >= 2 && avgMilk >= 2) {
      return PRESET_RECOMMENDATIONS.mocha;
    }

    if (avgMilk >= 3) {
      return PRESET_RECOMMENDATIONS.latte;
    }

    if (avgStrength >= 3 && avgMilk <= 1) {
      return PRESET_RECOMMENDATIONS.cappuccino;
    }

    // Default balanced champion
    return PRESET_RECOMMENDATIONS.cappuccino;
  }, [answers]);

  const currentQuestion = QUIZ_QUESTIONS[currentStep - 1];

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#120B06] text-[#22150C] dark:text-[#FAF4ED] font-['Hind_Siliguri',sans-serif] selection:bg-[#C86D3B]/20">
      {/* Top Floating Navbar */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 dark:bg-[#120B06]/90 backdrop-blur-md border-b border-[#EDE1D1] dark:border-[#2C1A10]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C86D3B] text-white shadow-md shadow-[#C86D3B]/25 group-hover:scale-105 transition-transform">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bangla-serif font-black text-lg tracking-tight block leading-tight text-[#22150C] dark:text-[#FAF4ED]">
                BornoCafe
              </span>
              <span className="text-[9px] font-semibold text-[#8C5D3D] dark:text-[#D4A373] tracking-wider uppercase block">
                কফির সাথে ছোট্ট কিছু মুহূর্ত
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/menu")}
              className="text-xs font-bold text-[#5D422E] dark:text-[#D8C7B5] hover:bg-[#EFE3D3] dark:hover:bg-[#261810] rounded-xl"
            >
              পুরো মেনু
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/")}
              className="rounded-xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white text-xs font-bold shadow-sm"
            >
              হোমপেজ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ========================================================================= */}
        {/* STEP 0: HERO INTRO SCREEN */}
        {/* ========================================================================= */}
        {currentStep === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center py-6 sm:py-12">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE3D3] dark:bg-[#261810] border border-[#DFCBB5] dark:border-[#422B1D] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#E8925A] shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-[#C86D3B]" />
                <span>BORNOCAFE · COFFEE FINDER</span>
              </div>

              <h1 className="font-bangla-serif font-black text-4xl sm:text-5xl lg:text-6xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.18]">
                আপনার মুডের সাথে <br />
                <span className="text-[#C86D3B] dark:text-[#E8925A]">
                  কোন কফি?
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#5D422E] dark:text-[#C5B4A2] font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed">
                কয়েকটা ছোট প্রশ্নের উত্তর দিন। BornoCafe আপনার জন্য খুঁজে দেবে
                একদম মানানসই এক কাপ।
              </p>

              <div className="pt-2 space-y-3">
                <Button
                  onClick={handleStartQuiz}
                  className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-bold text-base shadow-xl shadow-[#C86D3B]/25 hover:shadow-2xl hover:shadow-[#C86D3B]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mx-auto lg:mx-0"
                >
                  <Coffee className="h-5 w-5" />
                  <span>আমার কফি খুঁজে দিন</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-[#8C5D3D] dark:text-[#C5B4A2] font-medium">
                  <Clock className="h-3.5 w-3.5 text-[#C86D3B]" />
                  <span>সময় লাগবে মাত্র ৩০ সেকেন্ড • কোনো লগইন প্রয়োজন নেই</span>
                </div>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#EDE1D1] dark:border-[#2C1A10]">
                <div className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] text-center space-y-1">
                  <span className="text-xl block">🌿</span>
                  <span className="text-xs font-bold text-[#22150C] dark:text-[#FAF4ED] block">
                    মুড ম্যাচিং
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    দিনের অনুভূতির সাথে
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] text-center space-y-1">
                  <span className="text-xl block">☕</span>
                  <span className="text-xs font-bold text-[#22150C] dark:text-[#FAF4ED] block">
                    পারফেক্ট রোস্ট
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    কফি ও দুধের অনুপাত
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] text-center space-y-1">
                  <span className="text-xl block">🥐</span>
                  <span className="text-xs font-bold text-[#22150C] dark:text-[#FAF4ED] block">
                    স্ন্যাক পেয়ারিং
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    মানানসই মিষ্টি কামড়
                  </span>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Glow Backdrop */}
                <div className="absolute inset-0 bg-[#EAD4BB]/50 dark:bg-[#381F12]/30 rounded-3xl blur-2xl -z-10" />

                <div className="p-7 rounded-3xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] shadow-xl space-y-6 text-center">
                  <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-inner bg-[#EFE4D6]">
                    <img
                      src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80"
                      alt="BornoCafe Fresh Coffee"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                      <div className="text-left text-white space-y-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C86D3B] uppercase tracking-wider">
                          স্পেশালিটি রোস্ট
                        </span>
                        <h4 className="font-bangla-serif font-bold text-sm text-white">
                          হাতে তৈরি তাজা কফির সুবাস
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <h4 className="font-bangla-serif font-black text-base text-[#22150C] dark:text-[#FAF4ED]">
                      "এক কাপ কফি, আর একটু আপন সময়।"
                    </h4>
                    <p className="text-xs text-[#6E4F39] dark:text-[#BDB0A2] leading-relaxed">
                      প্রতিটি মানুষের কফির পছন্দ আলাদা। কেউ ভালোবাসেন গাঢ় ব্ল্যাক
                      আমেরিকানো, আবার কেউ সিল্কি স্মুথ ক্যারামেল লাতে। আজ আপনার কাপটি
                      খুঁজে নিন।
                    </p>
                  </div>

                  <Button
                    onClick={handleStartQuiz}
                    variant="outline"
                    className="w-full h-11 rounded-xl border-[#DFCBB5] dark:border-[#422B1D] text-xs font-bold hover:bg-[#EFE3D3] dark:hover:bg-[#261810]"
                  >
                    কুইজ শুরু করুন →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1 TO 6: INTERACTIVE QUESTIONNAIRE */}
        {/* ========================================================================= */}
        {currentStep >= 1 && currentStep <= totalQuestions && currentQuestion && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in-50 duration-300">
            {/* Progress Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#8C5D3D] dark:text-[#D4A373]">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 hover:text-[#C86D3B] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>পেছনে</span>
                </button>

                <span>
                  প্রশ্ন ০{currentStep} / ০{totalQuestions}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-[#EFE3D3] dark:bg-[#261810] overflow-hidden">
                <div
                  className="h-full bg-[#C86D3B] transition-all duration-300 rounded-full"
                  style={{
                    width: `${(currentStep / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Heading Card */}
            <div className="text-center space-y-2 py-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE3D3] dark:bg-[#261810] text-2xl shadow-inner mx-auto mb-1">
                {currentQuestion.icon}
              </div>

              <h2 className="font-bangla-serif font-black text-2xl sm:text-3xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
                {currentQuestion.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2] max-w-md mx-auto">
                {currentQuestion.subtitle}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentStep]?.id === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(currentStep, option)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-4 group ${
                      isSelected
                        ? "bg-[#C86D3B] text-white border-[#C86D3B] shadow-lg shadow-[#C86D3B]/25 scale-[1.01]"
                        : "bg-[#FAF6F0] dark:bg-[#1A1009] border-[#E9DAC8] dark:border-[#382417] text-[#22150C] dark:text-[#FAF4ED] hover:border-[#C86D3B]/60 hover:bg-[#F7EFE4] dark:hover:bg-[#22150C] shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-xs transition-colors ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-[#EFE3D3] dark:bg-[#261810]"
                        }`}
                      >
                        {option.icon}
                      </div>

                      <div className="min-w-0">
                        <h3
                          className={`font-bangla-serif font-bold text-base sm:text-lg leading-tight ${
                            isSelected
                              ? "text-white"
                              : "text-[#22150C] dark:text-[#FAF4ED]"
                          }`}
                        >
                          {option.label}
                        </h3>
                        {option.sublabel && (
                          <p
                            className={`text-xs mt-0.5 font-normal truncate ${
                              isSelected
                                ? "text-white/80"
                                : "text-[#6E4F39] dark:text-[#BDB0A2]"
                            }`}
                          >
                            {option.sublabel}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? "bg-white text-[#C86D3B] border-white"
                          : "border-[#DFCBB5] dark:border-[#422B1D] text-transparent group-hover:border-[#C86D3B]"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Helper footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4">
              <span>যেকোনো একটি অপশনে ক্লিক করুন</span>
              <button
                type="button"
                onClick={handleReset}
                className="hover:text-[#C86D3B] transition-colors"
              >
                শুরু থেকে করুন
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: BREWING / ANALYZING SCREEN */}
        {/* ========================================================================= */}
        {currentStep === 7 && isBrewing && (
          <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in fade-in-50 duration-300">
            <div className="relative inline-flex items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#EFE3D3] dark:bg-[#261810] text-[#C86D3B] shadow-xl animate-pulse">
                <Coffee className="h-12 w-12" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-500 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="font-bangla-serif font-black text-2xl text-[#22150C] dark:text-[#FAF4ED]">
                আপনার কফি তৈরি হচ্ছে...
              </h3>
              <p className="text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2]">
                আপনার পছন্দ ও টেস্ট প্রোফাইল মিলিয়ে সেরা কাপটি বাছাই করা হচ্ছে।
              </p>
            </div>

            <div className="h-1.5 w-48 mx-auto rounded-full bg-[#EFE3D3] dark:bg-[#261810] overflow-hidden">
              <div className="h-full bg-[#C86D3B] animate-indeterminate rounded-full" />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 8: RESULT RECOMMENDATION SCREEN */}
        {/* ========================================================================= */}
        {currentStep === 8 && recommendation && (
          <div className="space-y-12 animate-in fade-in-50 duration-500">
            {/* Header Badge */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                <Award className="h-3.5 w-3.5 text-emerald-600" />
                <span>{recommendation.matchScore}% আপনার সাথে মিলে গেছে</span>
              </div>

              <h2 className="font-bangla-serif font-black text-3xl sm:text-4xl lg:text-5xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight">
                আপনার জন্য আজকের পছন্দ
              </h2>

              <p className="text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2]">
                আপনার উত্তরের ভিত্তিতে বর্নক্যাফের কিউরেটেড রিকমেন্ডেশন
              </p>
            </div>

            {/* Main Result Hero Card */}
            <div className="p-6 sm:p-10 rounded-3xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Product Image */}
                <div className="lg:col-span-5">
                  <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-[#EFE4D6] shadow-md group">
                    <img
                      src={recommendation.imageUrl}
                      alt={recommendation.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-[#C86D3B] text-white shadow-sm uppercase tracking-wider">
                        {recommendation.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details & Ordering Actions */}
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#8C5D3D] dark:text-[#D4A373] uppercase tracking-wider">
                      সেরা কাপ
                    </span>
                    <h3 className="font-bangla-serif font-black text-2xl sm:text-3xl lg:text-4xl text-[#22150C] dark:text-[#FAF4ED]">
                      {recommendation.banglaName}
                    </h3>
                    <span className="text-xs text-muted-foreground font-semibold block">
                      {recommendation.name} • আনুমানিক মূল্য: ৳{recommendation.price}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-[#5D422E] dark:text-[#C5B4A2] leading-relaxed font-normal">
                    {recommendation.description}
                  </p>

                  {/* Size options preview */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-muted-foreground">
                      উপলব্ধ সাইজ:
                    </span>
                    {["Regular", "Medium", "Large"].map((size) => (
                      <span
                        key={size}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#D8C7B5] border border-[#DFCBB5] dark:border-[#422B1D]"
                      >
                        {size}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      onClick={() => navigate("/menu")}
                      className="w-full sm:w-auto h-13 px-7 rounded-2xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-bold text-sm shadow-lg shadow-[#C86D3B]/25 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      এখনই অর্ডার করুন
                    </Button>

                    <Button
                      onClick={() => navigate("/menu")}
                      variant="outline"
                      className="w-full sm:w-auto h-13 px-6 rounded-2xl border-[#DFCBB5] dark:border-[#422B1D] text-xs font-bold hover:bg-[#EFE3D3] dark:hover:bg-[#261810] flex items-center justify-center gap-2"
                    >
                      মেনু দেখুন
                    </Button>

                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      className="w-full sm:w-auto h-13 px-5 rounded-2xl text-xs font-semibold text-[#8C5D3D] dark:text-[#D4A373] hover:bg-[#EFE3D3] dark:hover:bg-[#261810] flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      আবার চেষ্টা করুন
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 5. WHY THIS COFFEE? (3 Personality Cards) */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-bangla-serif font-black text-xl text-[#22150C] dark:text-[#FAF4ED]">
                  কেন এই কফি আপনার জন্য?
                </h4>
                <p className="text-xs text-[#6E4F39] dark:text-[#BDB0A2]">
                  আপনার উত্তরগুলোর নিখুঁত সমন্বয়
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] text-center space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#E8925A] block">
                    আপনার মুড
                  </span>
                  <h5 className="font-bangla-serif font-bold text-lg text-[#22150C] dark:text-[#FAF4ED]">
                    {recommendation.moodTag}
                  </h5>
                  <p className="text-[11px] text-muted-foreground">
                    আপনার নির্বাচিত মনস্তাত্ত্বিক আমেজ
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] text-center space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#E8925A] block">
                    আপনার Taste
                  </span>
                  <h5 className="font-bangla-serif font-bold text-lg text-[#22150C] dark:text-[#FAF4ED]">
                    {recommendation.tasteTag}
                  </h5>
                  <p className="text-[11px] text-muted-foreground">
                    দুধ, মিষ্টি ও ঘনত্বের নিখুঁত ব্যালেন্স
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] text-center space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#E8925A] block">
                    আপনার Style
                  </span>
                  <h5 className="font-bangla-serif font-bold text-lg text-[#22150C] dark:text-[#FAF4ED]">
                    {recommendation.styleTag}
                  </h5>
                  <p className="text-[11px] text-muted-foreground">
                    স্পেশালিটি ব্রিউইং স্ট্যান্ডার্ড
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 6. COFFEE + SNACK PAIRING */}
            {/* ========================================================================= */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF6F0] dark:bg-[#1A1009] border border-[#E9DAC8] dark:border-[#382417] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="h-5 w-5 text-[#C86D3B]" />
                <h4 className="font-bangla-serif font-black text-xl text-[#22150C] dark:text-[#FAF4ED]">
                  এর সাথে এটা কেমন হয়?
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Snack Image */}
                <div className="md:col-span-4">
                  <div className="h-44 w-full rounded-2xl overflow-hidden bg-[#EFE4D6]">
                    <img
                      src={recommendation.pairedSnack.imageUrl}
                      alt={recommendation.pairedSnack.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Snack details */}
                <div className="md:col-span-8 space-y-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFE3D3] dark:bg-[#261810] text-[#8C5D3D] dark:text-[#E8925A] uppercase tracking-wider">
                      পারফেক্ট পেয়ারিং
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      ৳{recommendation.pairedSnack.price}
                    </span>
                  </div>

                  <h5 className="font-bangla-serif font-bold text-lg sm:text-xl text-[#22150C] dark:text-[#FAF4ED]">
                    {recommendation.banglaName} + {recommendation.pairedSnack.banglaName}
                  </h5>

                  <p className="text-xs sm:text-sm text-[#6E4F39] dark:text-[#BDB0A2] leading-relaxed">
                    {recommendation.pairedSnack.description}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <Button
                      onClick={() => navigate("/menu")}
                      className="h-11 px-6 rounded-xl bg-[#C86D3B] hover:bg-[#B35E2F] text-white font-bold text-xs shadow-md"
                    >
                      দুটোই অর্ডার করুন
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 7. SMALL COFFEE QUOTE */}
            {/* ========================================================================= */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#2A180E] to-[#140A04] text-white text-center space-y-2 shadow-lg">
              <span className="text-2xl block">☕</span>
              <p className="font-bangla-serif font-bold text-lg sm:text-xl text-[#FAF4ED] max-w-xl mx-auto leading-relaxed">
                "কখনো কখনো ভালো একটা দিনের জন্য <br />
                এক কাপ কফিই যথেষ্ট।"
              </p>
              <span className="text-xs text-amber-300/80 font-medium block">
                — বর্নক্যাফে স্পেশালিটি রোস্টারি
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
