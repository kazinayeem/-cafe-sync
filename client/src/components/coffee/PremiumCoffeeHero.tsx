import React, { useState, useEffect, useRef } from "react";

export const PremiumCoffeeHero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle Mouse Parallax on Desktop (2-4px max for subtle luxury feel)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 768) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 4, y: -y * 4 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  useEffect(() => {
    // Ensure video plays smoothly once mounted
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[500px] lg:max-w-[540px] aspect-square flex flex-col items-center justify-center p-2 sm:p-4 select-none"
    >
      {/* Ambient Warm Coffee Atmosphere Glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-600/15 via-amber-500/20 to-orange-400/10 blur-3xl -z-10 pointer-events-none" />

      {/* Decorative Roasted Coffee Beans (3 Subtle Accents) */}
      {/* Bean 1: Upper Left */}
      <div
        className="absolute top-6 left-6 sm:left-8 transition-transform duration-500 ease-out pointer-events-none z-10 hidden sm:block"
        style={{
          transform: `translate(${tilt.x * -0.8}px, ${tilt.y * -0.8}px)`,
        }}
      >
        <div className="animate-bean-drift-1 w-6 h-4.5 rounded-[44%] bg-gradient-to-br from-[#4a2f1d] via-[#2f1b0e] to-[#1a0e07] shadow-md border-t border-amber-800/40 rotate-[18deg] flex items-center justify-center opacity-85">
          <div className="w-[1.2px] h-3 bg-[#110803] rounded-full rotate-6" />
        </div>
      </div>

      {/* Bean 2: Upper Right */}
      <div
        className="absolute top-10 right-6 sm:right-10 transition-transform duration-500 ease-out pointer-events-none z-10 hidden sm:block"
        style={{
          transform: `translate(${tilt.x * 0.7}px, ${tilt.y * 0.7}px)`,
        }}
      >
        <div className="animate-bean-drift-2 w-5.5 h-4 rounded-[42%] bg-gradient-to-br from-[#543420] via-[#351d10] to-[#1c0f08] shadow-md border-t border-amber-700/40 -rotate-[28deg] flex items-center justify-center opacity-80">
          <div className="w-[1.2px] h-2.8 bg-[#110803] rounded-full -rotate-3" />
        </div>
      </div>

      {/* Bean 3: Lower Left */}
      <div
        className="absolute bottom-12 left-8 sm:left-12 transition-transform duration-500 ease-out pointer-events-none z-10 hidden sm:block"
        style={{
          transform: `translate(${tilt.x * 1.1}px, ${tilt.y * 1.1}px)`,
        }}
      >
        <div className="animate-bean-drift-3 w-5 h-3.5 rounded-[40%] bg-gradient-to-br from-[#3e2415] to-[#1b0d06] shadow-md border-t border-amber-900/40 rotate-[40deg] flex items-center justify-center opacity-75">
          <div className="w-[1px] h-2.4 bg-[#0d0603] rounded-full" />
        </div>
      </div>

      {/* Central Realistic Coffee Visual Container with 3D Tilt & Soft Feathered Border */}
      <div
        className="relative w-full max-w-[420px] aspect-square flex items-center justify-center transition-all duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${
            isHovered ? 1.02 : 1
          })`,
        }}
      >
        {/* Soft Saucer Shadow & Contact Ambient Halo */}
        <div className="absolute -bottom-2 w-[85%] h-12 rounded-full bg-amber-950/20 dark:bg-black/40 blur-xl -z-10" />

        {/* Ceramic Rim Frame & Seamless Visual Mask */}
        <div className="relative w-full h-full rounded-full p-2.5 sm:p-3 bg-gradient-to-b from-[#fcf9f5] via-[#ede2d4] to-[#caa78b] dark:from-[#35271d] dark:via-[#261a12] dark:to-[#170f0a] shadow-[0_20px_45px_rgba(45,22,10,0.22)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-t border-white/80 dark:border-white/10 flex items-center justify-center overflow-hidden group">
          {/* Inner Well / Liquid Container */}
          <div className="relative w-full h-full rounded-full overflow-hidden bg-[#1f1008] shadow-[inset_0_8px_20px_rgba(0,0,0,0.85)] flex items-center justify-center">
            {/* Fallback & Loading Shimmer Placeholder (Zero Layout Shift) */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a160c] via-[#3d2012] to-[#1a0c06] flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
              </div>
            )}

            {/* High-Quality Realistic Coffee Video / GIF Animation */}
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
              {/* Native GIF Fallback for legacy environments */}
              <img
                src="/images/coffee-latte.gif"
                alt="Fresh Barista Specialty Coffee Latte Art Pour"
                onLoad={() => setIsLoaded(true)}
                className="w-full h-full object-cover rounded-full"
              />
            </video>

            {/* Subtle Specular Porcelain Arc Reflection */}
            <div className="absolute top-2 left-6 right-6 h-8 rounded-t-full bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

            {/* Subtle Golden Crema Radial Vignette Ring */}
            <div className="absolute inset-0 rounded-full border border-amber-500/20 shadow-[inset_0_0_18px_rgba(20,10,5,0.6)] pointer-events-none" />
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
