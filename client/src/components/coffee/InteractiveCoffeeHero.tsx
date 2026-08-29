import React, { useState, useEffect, useRef } from "react";

export const InteractiveCoffeeHero: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to pause/play animation when in viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Subtle Parallax on Desktop (2-4px max for Apple-level subtlety)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 768) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 6, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full max-w-[480px] aspect-square flex flex-col items-center justify-center p-2 sm:p-4 select-none ${
        isInView ? "" : "paused"
      }`}
    >
      {/* Ambient Warm Coffee Atmosphere Glow */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-amber-600/10 via-amber-500/15 to-orange-400/8 blur-3xl -z-10 pointer-events-none" />

      {/* 3 Deliberately Positioned, Slowly Drifting Coffee Beans */}
      {/* Bean 1: Upper Left */}
      <div
        className="absolute top-10 left-6 sm:left-8 transition-transform duration-500 ease-out pointer-events-none z-10"
        style={{
          transform: `translate(${tilt.x * -0.8}px, ${tilt.y * -0.8}px)`,
        }}
      >
        <div className="animate-bean-drift-1 w-6 h-4.5 rounded-[44%] bg-gradient-to-br from-[#4a2f1d] via-[#2f1b0e] to-[#1a0e07] shadow-sm border-t border-amber-800/30 rotate-[18deg] flex items-center justify-center opacity-85">
          <div className="w-[1.2px] h-3 bg-[#110803] rounded-full rotate-6" />
        </div>
      </div>

      {/* Bean 2: Upper Right */}
      <div
        className="absolute top-14 right-6 sm:right-10 transition-transform duration-500 ease-out pointer-events-none z-10"
        style={{
          transform: `translate(${tilt.x * 0.7}px, ${tilt.y * 0.7}px)`,
        }}
      >
        <div className="animate-bean-drift-2 w-5.5 h-4 rounded-[42%] bg-gradient-to-br from-[#543420] via-[#351d10] to-[#1c0f08] shadow-sm border-t border-amber-700/30 -rotate-[28deg] flex items-center justify-center opacity-80">
          <div className="w-[1.2px] h-2.8 bg-[#110803] rounded-full -rotate-3" />
        </div>
      </div>

      {/* Bean 3: Lower Left */}
      <div
        className="absolute bottom-16 left-8 sm:left-12 transition-transform duration-500 ease-out pointer-events-none z-10"
        style={{
          transform: `translate(${tilt.x * 1.1}px, ${tilt.y * 1.1}px)`,
        }}
      >
        <div className="animate-bean-drift-3 w-5 h-3.5 rounded-[40%] bg-gradient-to-br from-[#3e2415] to-[#1b0d06] shadow-sm border-t border-amber-900/30 rotate-[40deg] flex items-center justify-center opacity-75">
          <div className="w-[1px] h-2.4 bg-[#0d0603] rounded-full" />
        </div>
      </div>

      {/* Main Ceramic Cup & Saucer Container */}
      <div
        className="relative w-full max-w-[380px] aspect-square flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        }}
      >
        {/* Natural Wispy Steam Trails */}
        <div className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 w-44 h-32 flex items-end justify-center pointer-events-none z-30">
          {/* Steam Trail 1 (Left Curve) */}
          <div className="absolute left-[36%] bottom-3 w-5 h-24 animate-natural-steam-1">
            <svg viewBox="0 0 20 80" className="w-full h-full stroke-[#fdf6eb]/35 fill-none stroke-[2] stroke-linecap-round">
              <path d="M 10 80 C 4 58, 16 42, 8 20 C 5 10, 12 3, 10 0" />
            </svg>
          </div>

          {/* Steam Trail 2 (Center Rising Stream) */}
          <div className="absolute left-[48%] bottom-2 w-6 h-28 animate-natural-steam-2">
            <svg viewBox="0 0 20 90" className="w-full h-full stroke-[#fbf2e3]/45 fill-none stroke-[2.2] stroke-linecap-round">
              <path d="M 8 90 C 15 68, 4 46, 12 24 C 15 11, 7 3, 10 0" />
            </svg>
          </div>

          {/* Steam Trail 3 (Right Curve) */}
          <div className="absolute left-[60%] bottom-4 w-5 h-22 animate-natural-steam-3">
            <svg viewBox="0 0 20 75" className="w-full h-full stroke-[#fdf6eb]/35 fill-none stroke-[1.8] stroke-linecap-round">
              <path d="M 12 75 C 5 54, 15 38, 7 16 C 4 7, 10 1, 8 0" />
            </svg>
          </div>
        </div>

        {/* Silky Milk Stream Pouring from Above */}
        <div className="absolute -top-14 left-[50%] -translate-x-1/2 w-4 h-32 z-20 pointer-events-none flex flex-col items-center animate-coffee-milk">
          <svg viewBox="0 0 16 110" className="w-full h-full drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]">
            <path
              d="M 8 0 Q 6 35, 8 65 Q 10 90, 8 110"
              className="stroke-[#fffcf7] fill-none stroke-[3] stroke-linecap-round"
            />
          </svg>
        </div>

        {/* Saucer (Base Plate) */}
        <div className="absolute bottom-6 w-[86%] h-[30%] rounded-[50%] bg-gradient-to-b from-[#f7f2ea] via-[#e5d9ca] to-[#cbbbb0] dark:from-[#2a221d] dark:via-[#1e1713] dark:to-[#140f0c] shadow-[0_24px_42px_rgba(35,18,8,0.16)] dark:shadow-[0_24px_42px_rgba(0,0,0,0.6)] border-t border-white/70 dark:border-white/10 flex items-center justify-center">
          {/* Inner Saucer Inset */}
          <div className="w-[82%] h-[72%] rounded-[50%] bg-gradient-to-b from-[#ebdfd1] to-[#d8c7b5] dark:from-[#201914] dark:to-[#17110d] border-t border-black/5 dark:border-black/40 shadow-inner" />
        </div>

        {/* Ceramic Coffee Cup Body */}
        <div className="relative w-[70%] h-[66%] -mt-5 rounded-[50%] bg-gradient-to-b from-[#fcfaf7] via-[#eee3d5] to-[#c9ab8f] dark:from-[#35281f] dark:via-[#251b14] dark:to-[#18110c] p-3.5 sm:p-4 shadow-[0_16px_32px_rgba(40,20,10,0.24)] border-t-2 border-white/90 dark:border-white/15 flex items-center justify-center">
          {/* Cup Handle (Right Side) */}
          <div className="absolute -right-6.5 top-[32%] w-10 sm:w-11 h-18 sm:h-20 rounded-r-3xl border-6 sm:border-7 border-l-0 border-[#eee3d5] dark:border-[#251b14] shadow-md -z-10 rotate-6" />

          {/* Deep Espresso Reservoir / Crema Surface */}
          <div className="relative w-full h-full rounded-[50%] bg-gradient-to-br from-[#1b0a04] via-[#33170a] to-[#542812] p-2 overflow-hidden shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] border border-[#160803] flex items-center justify-center">
            {/* Subtle Golden Crema Margin */}
            <div className="absolute inset-0.5 rounded-[50%] border border-amber-600/25 pointer-events-none" />

            {/* Delicate Surface Fluid Ripples */}
            <div className="absolute w-18 h-18 rounded-full border border-amber-100/40 animate-coffee-ripple-1 pointer-events-none" />
            <div className="absolute w-18 h-18 rounded-full border border-[#fffcf7]/35 animate-coffee-ripple-2 pointer-events-none" />

            {/* Latte Art Bloom: Elegant Handcrafted Rosette / Heart */}
            <div className="relative z-10 flex items-center justify-center animate-coffee-latte">
              <svg
                viewBox="0 0 100 100"
                className="w-22 sm:w-26 h-22 sm:h-26 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
              >
                {/* Outer Microfoam Swirl */}
                <path
                  d="M 50 22 C 34 32, 22 48, 30 64 C 36 76, 50 82, 50 82 C 50 82, 64 76, 70 64 C 78 48, 66 32, 50 22 Z"
                  className="fill-[#fffef9] opacity-95"
                />
                {/* Caramel Crema Separation Layer */}
                <path
                  d="M 50 25 Q 39 44 38 61 Q 50 73 50 76 Q 50 73 62 61 Q 61 44 50 25 Z"
                  className="fill-[#d4995b] opacity-80"
                />
                {/* Inner Heart Layer */}
                <path
                  d="M 50 34 C 43 40, 36 50, 40 59 C 43 66, 50 71, 50 71 C 50 71, 57 66, 60 59 C 64 50, 57 40, 50 34 Z"
                  className="fill-[#fffdfa] opacity-95"
                />
                {/* Center Drawn Crema Spire */}
                <path
                  d="M 50 18 L 50 82"
                  className="stroke-[#964f1d] stroke-[1.8] stroke-linecap-round opacity-85"
                />
                {/* Microfoam Highlights */}
                <circle cx="50" cy="24" r="3" className="fill-[#fffdfa]" />
                <circle cx="45" cy="38" r="1.6" className="fill-[#fffdfa]" />
                <circle cx="55" cy="38" r="1.6" className="fill-[#fffdfa]" />
              </svg>
            </div>

            {/* Specular Glaze Arc Reflection */}
            <div className="absolute top-1.5 left-5 right-5 h-5 rounded-t-[50%] bg-gradient-to-b from-white/18 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Refined Single Contextual Line */}
      <p className="text-[11px] sm:text-xs text-muted-foreground/80 font-medium tracking-wide mt-3 text-center">
        Freshly pulled espresso · Silky microfoam · Handcrafted with care
      </p>
    </div>
  );
};
