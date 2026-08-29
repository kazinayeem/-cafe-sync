import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Flame, Droplets, Heart } from "lucide-react";

interface CoffeeCraftTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  notes: string;
}

const COFFEE_CRAFT_TABS: CoffeeCraftTab[] = [
  {
    id: "brewing",
    label: "ব্রু করা",
    icon: Flame,
    title: "ধীর রোস্টিং ও পারফেক্ট এক্সট্রাকশন",
    desc: "৯৩°C নিয়ন্ত্রিত তাপমাত্রায় তাজা অ্যারাবিকা বিন থেকে এক্সট্রাক্ট করা নিখুঁত ফ্লেভার।",
    notes: "অন-ডিমান্ড গ্রাইন্ড · ৯ বার প্রেসার",
  },
  {
    id: "espresso",
    label: "এসপ্রেসো",
    icon: Sparkles,
    title: "ঘন সোনালী ক্রেমার সমৃদ্ধ শট",
    desc: "প্রতিটি শটে থাকে মিষ্টি ক্যারামেল সুবাস ও গাঢ় চকলেট ফ্লেভারের সুন্দর মেলবন্ধন।",
    notes: "ডাবল রিস্ট্রেত্তো · ৩০ সেকেন্ড এক্সট্রাক্ট",
  },
  {
    id: "milk",
    label: "মিল্ক কফি",
    icon: Droplets,
    title: "সিল্কি মাইক্রোফোম স্টিমড মিল্ক",
    desc: "৬৫°C তাপমাত্রায় স্টিম করা মসৃণ দুধ যা কফির মিষ্টতাকে দ্বিগুণ করে তোলে।",
    notes: "হোল মিল্ক / ওট মিল্ক অপশন",
  },
  {
    id: "latteart",
    label: "লাতে আর্ট",
    icon: Heart,
    title: "বারিস্তার হাতের ভালোবাসার ছোঁয়া",
    desc: "প্রতিটি কাপে নিখুঁত টিউলিপ ও হার্ট প্যাটার্নের মিষ্টি শিল্পকর্ম।",
    notes: "১০০% হ্যান্ডক্রাফটেড প্রেজেন্টেশন",
  },
];

export const PremiumCoffeeHero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("brewing");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle Mouse Parallax on Desktop (2-3px max for understated luxury feel)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 768) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 3.5, y: -y * 3.5 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const activeCraft =
    COFFEE_CRAFT_TABS.find((t) => t.id === activeTab) || COFFEE_CRAFT_TABS[0];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[480px] lg:max-w-[520px] flex flex-col items-center justify-center p-2 sm:p-4 select-none"
    >
      {/* Ambient Warm Coffee Glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-600/15 via-amber-500/15 to-orange-400/10 blur-3xl -z-10 pointer-events-none" />

      {/* Decorative Roasted Coffee Beans (Subtle Accents) */}
      {/* Bean 1: Upper Left */}
      <div
        className="absolute top-4 left-4 sm:left-6 transition-transform duration-500 ease-out pointer-events-none z-10 hidden sm:block"
        style={{
          transform: `translate(${tilt.x * -0.7}px, ${tilt.y * -0.7}px)`,
        }}
      >
        <div className="w-5.5 h-4 rounded-[44%] bg-gradient-to-br from-[#4a2f1d] via-[#2f1b0e] to-[#1a0e07] shadow-md border-t border-amber-800/40 rotate-[18deg] flex items-center justify-center opacity-85">
          <div className="w-[1px] h-2.6 bg-[#110803] rounded-full rotate-6" />
        </div>
      </div>

      {/* Bean 2: Upper Right */}
      <div
        className="absolute top-6 right-4 sm:right-6 transition-transform duration-500 ease-out pointer-events-none z-10 hidden sm:block"
        style={{
          transform: `translate(${tilt.x * 0.7}px, ${tilt.y * 0.7}px)`,
        }}
      >
        <div className="w-5 h-3.8 rounded-[42%] bg-gradient-to-br from-[#543420] via-[#351d10] to-[#1c0f08] shadow-md border-t border-amber-700/40 -rotate-[28deg] flex items-center justify-center opacity-80">
          <div className="w-[1px] h-2.4 bg-[#110803] rounded-full -rotate-3" />
        </div>
      </div>

      {/* Central Realistic Coffee Visual Container */}
      <div
        className="relative w-full max-w-[380px] sm:max-w-[400px] aspect-square flex items-center justify-center transition-all duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${
            isHovered ? 1.015 : 1
          })`,
        }}
      >
        {/* Soft Saucer Shadow */}
        <div className="absolute -bottom-2 w-[85%] h-10 rounded-full bg-amber-950/20 dark:bg-black/40 blur-xl -z-10" />

        {/* Ceramic Rim Frame */}
        <div className="relative w-full h-full rounded-full p-2.5 sm:p-3 bg-gradient-to-b from-[#fcf9f5] via-[#ede2d4] to-[#caa78b] dark:from-[#35271d] dark:via-[#261a12] dark:to-[#170f0a] shadow-[0_16px_36px_rgba(45,22,10,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)] border-t border-white/80 dark:border-white/10 flex items-center justify-center overflow-hidden">
          {/* Inner Liquid Container */}
          <div className="relative w-full h-full rounded-full overflow-hidden bg-[#1f1008] shadow-[inset_0_8px_20px_rgba(0,0,0,0.85)] flex items-center justify-center">
            {!isLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a160c] via-[#3d2012] to-[#1a0c06] flex items-center justify-center animate-pulse">
                <div className="w-10 h-10 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
              </div>
            )}

            {/* Realistic Coffee Animation Video / GIF Fallback */}
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setIsLoaded(true)}
              className={`w-full h-full object-cover rounded-full transition-opacity duration-700 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              <source src="/images/coffee-latte.mp4" type="video/mp4" />
              <img
                src="/images/coffee-latte.gif"
                alt="Fresh Barista Specialty Coffee Latte Art Pour"
                onLoad={() => setIsLoaded(true)}
                className="w-full h-full object-cover rounded-full"
              />
            </video>

            {/* Specular Porcelain Arc Reflection */}
            <div className="absolute top-2 left-6 right-6 h-8 rounded-t-full bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

            {/* Crema Ring */}
            <div className="absolute inset-0 rounded-full border border-amber-500/20 shadow-[inset_0_0_18px_rgba(20,10,5,0.6)] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Interactive Micro-Story Tabs */}
      <div className="w-full max-w-[420px] mt-4 space-y-2">
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#EFE4D6]/70 dark:bg-[#1E130B]/80 border border-[#DFCBB5] dark:border-[#382417] backdrop-blur-xs">
          {COFFEE_CRAFT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  isActive
                    ? "bg-[#C86D3B] text-white shadow-xs"
                    : "text-[#5D422E] dark:text-[#C5B4A2] hover:text-[#22150C] dark:hover:text-white"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail Card with Smooth Fade */}
        <div className="p-3 rounded-2xl bg-[#FAF6F0]/90 dark:bg-[#1A1009]/90 border border-[#E9DAC8] dark:border-[#382417] shadow-2xs text-left transition-all duration-300">
          <div className="flex items-center justify-between">
            <h4 className="font-bangla-serif font-black text-xs text-[#22150C] dark:text-[#FAF4ED]">
              {activeCraft.title}
            </h4>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {activeCraft.notes}
            </span>
          </div>
          <p className="text-[11px] text-[#6E4F39] dark:text-[#BDB0A2] mt-1 leading-snug font-normal">
            {activeCraft.desc}
          </p>
        </div>
      </div>
    </div>
  );
};
