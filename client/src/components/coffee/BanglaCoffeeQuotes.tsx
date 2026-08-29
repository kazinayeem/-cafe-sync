import React, { useState, useEffect } from "react";

interface BanglaQuote {
  text: string;
  tag: string;
}

const BANGLA_QUOTES: BanglaQuote[] = [
  {
    text: "এক কাপ কফি, আর পাশে প্রিয় একজন— এর চেয়ে সুন্দর বিকেল আর কী হতে পারে?",
    tag: "সুন্দর বিকেল",
  },
  {
    text: "কিছু গল্প বলা হয় না, কফির কাপে চুপচাপ থেকে যায়।",
    tag: "না বলা গল্প",
  },
  {
    text: "ব্যস্ত শহরটা একটু থেমে যাক, আজ কফির সাথে একটু গল্প হোক।",
    tag: "শহরের আড্ডা",
  },
  {
    text: "তুমি পাশে থাকলে, এক কাপ কফিই যথেষ্ট।",
    tag: "প্রিয় মানুষ",
  },
  {
    text: "কফি ঠান্ডা হয়ে যায়, কিন্তু কিছু মুহূর্ত থেকে যায়।",
    tag: "মধুর স্মৃতি",
  },
  {
    text: "এক চুমুক কফি, একটু শান্তি, আর নিজের জন্য কিছু সময়।",
    tag: "আপন মুহূর্ত",
  },
  {
    text: "এক কাপ কফি, একটু আপন সময়।",
    tag: "নিজের সময়",
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
    <div className="relative inline-flex items-start gap-2.5 py-2 px-3 sm:px-3.5 rounded-xl bg-[#FAF6F0]/75 dark:bg-[#1A1009]/75 border border-[#EADCCB]/70 dark:border-[#382417]/70 border-l-2 border-l-[#C86D3B] shadow-2xs backdrop-blur-xs max-w-md transition-all duration-300">
      {/* Rotating Bangla Poetic Line */}
      <div className="flex flex-col min-w-0 text-left">
        <div
          className={`transition-all duration-400 ease-out transform ${
            isTransitioning
              ? "opacity-0 -translate-y-1 scale-[0.98]"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          <p className="font-bangla-serif text-xs sm:text-[13px] font-medium text-[#3A2213] dark:text-[#EFE2D3] leading-relaxed italic">
            “{currentQuote.text}”
          </p>
        </div>

        {/* Small Cafe Signature */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px] font-bold text-[#8C5D3D] dark:text-[#D4A373] uppercase tracking-wider">
            — BornoCafe
          </span>
          <span className="text-[8px] text-muted-foreground/50">•</span>
          <span className="text-[9px] font-normal text-[#8C6446]/80 dark:text-[#A89684]">
            {currentQuote.tag}
          </span>
        </div>
      </div>
    </div>
  );
};
