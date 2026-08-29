import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface BanglaQuote {
  text: string;
  tag: string;
}

const BANGLA_QUOTES: BanglaQuote[] = [
  {
    text: "এক কাপ কফি, আর একটু আপন সময়।",
    tag: "আপন সময়",
  },
  {
    text: "কফির কাপে জমুক কিছু না বলা গল্প।",
    tag: "না বলা গল্প",
  },
  {
    text: "তুমি, আমি আর এক কাপ গরম কফি।",
    tag: "প্রিয় অনুভূতি",
  },
  {
    text: "কিছু মুহূর্ত কফির মতো— ধীরে ধীরে উপভোগ করলেই সুন্দর।",
    tag: "ধীর মুহূর্ত",
  },
  {
    text: "এক চুমুক কফি, এক মুঠো ভালো লাগা।",
    tag: "ভালো লাগা",
  },
  {
    text: "কফির ঘ্রাণে শুরু হোক সুন্দর একটা গল্প।",
    tag: "নতুন শুরু",
  },
  {
    text: "ব্যস্ত শহরে একটু থামি, এক কাপ কফির সাথে।",
    tag: "একটু বিরতি",
  },
  {
    text: "কিছু গল্প বলা হয় না, কফির কাপে থেকে যায়।",
    tag: "কফির স্মারক",
  },
  {
    text: "সকালটা হোক কফির মতোই সুন্দর।",
    tag: "সকালের সুর",
  },
  {
    text: "এক কাপ কফি— আর পাশে প্রিয় একজন।",
    tag: "সঙ্গী ও কফি",
  },
];

export const BanglaCoffeeQuotes: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % BANGLA_QUOTES.length);
        setIsTransitioning(false);
      }, 400); // 400ms fade-out before swapping text
    }, 4500); // Change quote every 4.5s

    return () => clearInterval(timer);
  }, []);

  const currentQuote = BANGLA_QUOTES[currentIndex];

  return (
    <div className="relative inline-flex items-center gap-3 py-2 px-3.5 sm:px-4 rounded-2xl bg-[#F7F0E6]/90 dark:bg-[#1E130B]/90 border border-[#EDE1D1] dark:border-[#332317] shadow-2xs backdrop-blur-xs max-w-lg transition-all duration-300">
      {/* Decorative Warm Accent Icon */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
        <Sparkles className="h-3.5 w-3.5" />
      </div>

      {/* Rotating Bangla Poetic Line */}
      <div className="flex flex-col min-w-0 text-left">
        <div
          className={`transition-all duration-400 ease-out transform ${
            isTransitioning
              ? "opacity-0 -translate-y-1 scale-[0.98]"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          <p className="font-['Noto_Serif_Bengali','Hind_Siliguri',serif] text-xs sm:text-[13px] font-semibold text-[#422919] dark:text-[#EFE2D3] tracking-wide leading-relaxed">
            "{currentQuote.text}"
          </p>
        </div>

        {/* Small Cafe Signature */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-bold text-amber-700/80 dark:text-amber-400/80 uppercase tracking-wider">
            — Cafe Sync
          </span>
          <span className="text-[9px] text-muted-foreground/60">•</span>
          <span className="text-[10px] font-medium text-muted-foreground/75 font-['Hind_Siliguri',sans-serif]">
            {currentQuote.tag}
          </span>
        </div>
      </div>
    </div>
  );
};
