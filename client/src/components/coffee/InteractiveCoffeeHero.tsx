import React, { useState, useRef } from "react";
import { Coffee, Sparkles, Droplets, Heart } from "lucide-react";

type BrewStage = "all" | "espresso" | "pour" | "latte-art" | "steam";

export const InteractiveCoffeeHero: React.FC = () => {
  const [activeStage, setActiveStage] = useState<BrewStage>("all");
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle Mouse Parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 14, y: -y * 14 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[540px] aspect-square flex flex-col items-center justify-center p-4 select-none touch-pan-y"
    >
      {/* Background Soft Glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-500/10 via-amber-400/20 to-orange-400/10 blur-3xl -z-10 pointer-events-none" />

      {/* Floating Coffee Beans (Parallax & Gentle Floating) */}
      <div
        className="absolute top-8 left-6 transition-transform duration-300 ease-out pointer-events-none"
        style={{
          transform: `translate(${tilt.x * -1.8}px, ${tilt.y * -1.8}px)`,
        }}
      >
        <div className="animate-float-1 w-7 h-5 rounded-[40%] bg-gradient-to-br from-[#4a2e1b] via-[#2e1a0e] to-[#1a0f08] shadow-md border-t border-amber-800/40 rotate-12 relative flex items-center justify-center">
          <div className="w-[1.5px] h-3.5 bg-[#120a05] rounded-full rotate-6 shadow-inner" />
        </div>
      </div>

      <div
        className="absolute bottom-16 left-10 transition-transform duration-300 ease-out pointer-events-none"
        style={{
          transform: `translate(${tilt.x * 2.2}px, ${tilt.y * 2.2}px)`,
        }}
      >
        <div className="animate-float-2 w-6 h-4 rounded-[40%] bg-gradient-to-br from-[#5a3821] via-[#3a2012] to-[#1f1109] shadow-md border-t border-amber-700/40 -rotate-45 relative flex items-center justify-center">
          <div className="w-[1.5px] h-3 bg-[#120a05] rounded-full rotate-3" />
        </div>
      </div>

      <div
        className="absolute top-16 right-8 transition-transform duration-300 ease-out pointer-events-none"
        style={{
          transform: `translate(${tilt.x * 1.5}px, ${tilt.y * 1.5}px)`,
        }}
      >
        <div className="animate-float-3 w-8 h-5.5 rounded-[42%] bg-gradient-to-br from-[#4a2e1b] via-[#2d190d] to-[#140b06] shadow-md border-t border-amber-800/50 rotate-[35deg] relative flex items-center justify-center">
          <div className="w-[1.8px] h-4 bg-[#0d0704] rounded-full -rotate-6" />
        </div>
      </div>

      <div
        className="absolute bottom-12 right-12 transition-transform duration-300 ease-out pointer-events-none"
        style={{
          transform: `translate(${tilt.x * -2.4}px, ${tilt.y * -2.4}px)`,
        }}
      >
        <div className="animate-float-1 w-5 h-3.5 rounded-[40%] bg-gradient-to-br from-[#3e2415] to-[#1c0f08] shadow-sm -rotate-12 relative flex items-center justify-center">
          <div className="w-[1.2px] h-2.5 bg-[#0d0704] rounded-full" />
        </div>
      </div>

      {/* Main Coffee Cup Stage Container with 3D Tilt */}
      <div
        className="relative w-full max-w-[420px] aspect-square flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${
            isHovered ? 1.02 : 1
          })`,
        }}
      >
        {/* Steam Trails Rising Above the Cup */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-36 flex items-end justify-center pointer-events-none z-30">
          {/* Steam 1 */}
          <div className="absolute left-[38%] bottom-4 w-5 h-24 animate-steam-1">
            <svg viewBox="0 0 24 90" className="w-full h-full stroke-amber-200/50 fill-none stroke-[2.5] stroke-linecap-round">
              <path d="M12 90 C 4 65, 20 45, 10 20 C 6 8, 14 2, 12 0" />
            </svg>
          </div>

          {/* Steam 2 */}
          <div className="absolute left-[48%] bottom-2 w-6 h-28 animate-steam-2">
            <svg viewBox="0 0 24 100" className="w-full h-full stroke-amber-100/60 fill-none stroke-[3] stroke-linecap-round">
              <path d="M10 100 C 18 75, 4 50, 14 25 C 18 10, 8 3, 12 0" />
            </svg>
          </div>

          {/* Steam 3 */}
          <div className="absolute left-[58%] bottom-5 w-5 h-22 animate-steam-3">
            <svg viewBox="0 0 24 85" className="w-full h-full stroke-amber-200/50 fill-none stroke-[2.5] stroke-linecap-round">
              <path d="M14 85 C 6 60, 18 40, 8 18 C 5 6, 12 1, 10 0" />
            </svg>
          </div>

          {/* Steam 4 */}
          <div className="absolute left-[44%] bottom-6 w-7 h-32 animate-steam-4">
            <svg viewBox="0 0 24 110" className="w-full h-full stroke-amber-50/40 fill-none stroke-[2] stroke-linecap-round">
              <path d="M8 110 C 16 80, 2 55, 14 28 C 17 12, 10 4, 12 0" />
            </svg>
          </div>
        </div>

        {/* Milk Stream Pouring from Spout */}
        {(activeStage === "all" || activeStage === "pour" || activeStage === "latte-art") && (
          <div className="absolute -top-12 left-[50%] -translate-x-1/2 w-8 h-36 z-20 pointer-events-none flex flex-col items-center">
            {/* Silky Milk Stream */}
            <div className="w-2.5 h-full rounded-full bg-gradient-to-b from-[#fffefc] via-[#fbf7f0] to-[#f4ebe0] shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-milk-flow" />
          </div>
        )}

        {/* Saucer (Base Plate) */}
        <div className="absolute bottom-6 w-[88%] h-[32%] rounded-[50%] bg-gradient-to-b from-[#f5ede3] via-[#e2d5c5] to-[#c8b7a2] dark:from-[#2e2620] dark:via-[#221b16] dark:to-[#17120e] shadow-[0_24px_48px_rgba(40,20,10,0.22)] border-t border-white/60 dark:border-white/10 flex items-center justify-center">
          {/* Inner Saucer Rim */}
          <div className="w-[84%] h-[74%] rounded-[50%] bg-gradient-to-b from-[#e8dcce] to-[#d6c4b0] dark:from-[#221b16] dark:to-[#1a1410] border-t border-black/5 dark:border-black/30 shadow-inner" />
        </div>

        {/* Ceramic Coffee Cup Body */}
        <div className="relative w-[72%] h-[68%] -mt-6 rounded-[50%] bg-gradient-to-b from-[#fbf8f4] via-[#eedecf] to-[#caa98a] dark:from-[#3a2d24] dark:via-[#2a1f18] dark:to-[#1a130f] p-4 shadow-[0_16px_36px_rgba(45,25,12,0.32)] border-t-2 border-white/80 dark:border-white/15 flex items-center justify-center group/cup">
          {/* Cup Handle (Right Side) */}
          <div className="absolute -right-7 top-[32%] w-12 h-20 rounded-r-3xl border-8 border-l-0 border-[#eedecf] dark:border-[#2a1f18] shadow-md -z-10 rotate-6" />

          {/* Cup Interior / Espresso Crema Liquid Reservoir */}
          <div className="relative w-full h-full rounded-[50%] bg-gradient-to-br from-[#28150c] via-[#482816] to-[#6d3c1e] p-3 overflow-hidden shadow-[inset_0_12px_24px_rgba(0,0,0,0.85)] border border-[#1a0d07] flex items-center justify-center">
            {/* Golden Crema Rim Texture */}
            <div className="absolute inset-1 rounded-[50%] border-2 border-amber-600/30 opacity-70" />

            {/* Ripple Wave 1 */}
            {(activeStage === "all" || activeStage === "pour" || isHovered) && (
              <div className="absolute w-20 h-20 rounded-full border border-amber-200/60 animate-ripple-1 pointer-events-none" />
            )}

            {/* Ripple Wave 2 */}
            {(activeStage === "all" || activeStage === "pour" || isHovered) && (
              <div className="absolute w-20 h-20 rounded-full border border-white/50 animate-ripple-2 pointer-events-none" />
            )}

            {/* Latte Art: Handcrafted Golden Heart / Rosette */}
            {(activeStage === "all" || activeStage === "latte-art" || activeStage === "steam") && (
              <div className="relative z-10 flex items-center justify-center animate-latte-art">
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 sm:w-28 h-24 sm:h-28 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                >
                  {/* Outer milk swirl circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-[#f8ede2]/40 fill-none stroke-[2] stroke-dasharray-[4,2]"
                  />
                  {/* Rosette Leaf Layers */}
                  <path
                    d="M 50 20 C 35 30, 20 45, 28 62 C 34 74, 50 82, 50 82 C 50 82, 66 74, 72 62 C 80 45, 65 30, 50 20 Z"
                    className="fill-[#fffdf9] opacity-95"
                  />
                  {/* Crema Separation Lines */}
                  <path
                    d="M 50 22 Q 38 42 36 60 Q 50 74 50 78 Q 50 74 64 60 Q 62 42 50 22 Z"
                    className="fill-[#e9be8a] opacity-80"
                  />
                  {/* Inner Heart Layer */}
                  <path
                    d="M 50 32 C 42 38, 34 48, 38 58 C 42 66, 50 72, 50 72 C 50 72, 58 66, 62 58 C 66 48, 58 38, 50 32 Z"
                    className="fill-[#fffefc] opacity-95"
                  />
                  {/* Center Heart Spire */}
                  <path
                    d="M 50 16 L 50 84"
                    className="stroke-[#a65d28] stroke-[2] stroke-linecap-round opacity-90"
                  />
                  {/* Microfoam Highlights */}
                  <circle cx="50" cy="22" r="3.5" className="fill-[#fffdf9]" />
                  <circle cx="44" cy="38" r="2" className="fill-[#fffdf9]" />
                  <circle cx="56" cy="38" r="2" className="fill-[#fffdf9]" />
                </svg>
              </div>
            )}

            {/* Specular Light Arc Reflection */}
            <div className="absolute top-2 left-6 right-6 h-6 rounded-t-[50%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Interactive Brew Stage Control Bar */}
      <div className="mt-2 flex items-center gap-1.5 p-1.5 rounded-2xl bg-card/80 dark:bg-card/40 backdrop-blur-md border border-border/80 shadow-lg text-xs z-20">
        <button
          type="button"
          onClick={() => setActiveStage("all")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-[11px] transition-all ${
            activeStage === "all"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          Auto Brew
        </button>

        <button
          type="button"
          onClick={() => setActiveStage("espresso")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
            activeStage === "espresso"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Coffee className="h-3 w-3" />
          Espresso
        </button>

        <button
          type="button"
          onClick={() => setActiveStage("pour")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
            activeStage === "pour"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Droplets className="h-3 w-3" />
          Milk Pour
        </button>

        <button
          type="button"
          onClick={() => setActiveStage("latte-art")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
            activeStage === "latte-art"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className="h-3 w-3" />
          Latte Art
        </button>
      </div>

      {/* Flavor Profile Micro-Pill */}
      <p className="text-[10px] text-muted-foreground font-semibold mt-2.5 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
        Freshly pulled Arabica shot • Silky Oat Microfoam • 65°C Perfect Temp
      </p>
    </div>
  );
};
