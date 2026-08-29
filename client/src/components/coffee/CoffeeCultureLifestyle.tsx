import React, { useState } from "react";
import {
  Music,
  Film,
  Play,
  Sparkles,
  Volume2,
  ExternalLink,
  Coffee,
} from "lucide-react";

interface MusicRecommendation {
  id: string;
  title: string;
  artist: string;
  moodTag: string;
  note: string;
  duration: string;
  imageUrl: string;
  moodKey: "peace" | "adda" | "romantic" | "focus";
}

interface MovieRecommendation {
  id: string;
  title: string;
  genre: string;
  moodTag: string;
  description: string;
  duration: string;
  imageUrl: string;
  moodKey: "peace" | "adda" | "romantic" | "focus";
}

const MUSIC_LIST: MusicRecommendation[] = [
  {
    id: "m1",
    title: "Coffeehouse Acoustic Sessions",
    artist: "Slow Sunday Trio",
    moodTag: "শান্ত সকাল",
    note: "নরম অ্যাকোস্টিক গিটারের সুর ও উষ্ণ রোদের মিষ্টি ছোঁয়া।",
    duration: "৩:৪৫ মিনিট",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    moodKey: "peace",
  },
  {
    id: "m2",
    title: "Monsoon Lofi & Raindrops",
    artist: "Dhaka Chillwave Collective",
    moodTag: "বৃষ্টির বিকেল",
    note: "জানালায় বৃষ্টির রিমঝিম শব্দ আর ধোঁয়া ওঠা গরম ক্যাপুচিনো।",
    duration: "৪:১২ মিনিট",
    imageUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80",
    moodKey: "romantic",
  },
  {
    id: "m3",
    title: "Midnight Jazz & Espresso",
    artist: "The Velvet Quartet",
    moodTag: "রাতের কফি",
    note: "ধীর স্যাক্সোফোন মেলোডি ও গভীর রাতের নিস্তব্ধ একাকীত্ব।",
    duration: "৫:০২ মিনিট",
    imageUrl:
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=400&q=80",
    moodKey: "focus",
  },
  {
    id: "m4",
    title: "Acoustic Adda Memories",
    artist: "Unplugged Friends Project",
    moodTag: "লম্বা আড্ডা",
    note: "বন্ধুদের হাসিমুখের আড্ডা আর চিরচেনা প্রিয় বাংলা গানের সুর।",
    duration: "৩:৫৮ মিনিট",
    imageUrl:
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80",
    moodKey: "adda",
  },
];

const MOVIE_LIST: MovieRecommendation[] = [
  {
    id: "mov1",
    title: "Before Sunset (বিফোর সানসেট)",
    genre: "রোমান্টিক ড্রামা • ২০০৪",
    moodTag: "রোমান্টিক",
    description:
      "প্যারিসের মনোরম রাস্তায় হাঁটতে হাঁটতে দুই অচেনা মানুষের গভীর কথোপকথন ও কফির মুহূর্ত।",
    duration: "১ ঘণ্টা ২০ মিনিট",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80",
    moodKey: "romantic",
  },
  {
    id: "mov2",
    title: "The Secret Life of Walter Mitty",
    genre: "অনুপ্রেরণামূলক অ্যাডভেঞ্চার",
    moodTag: "অনুপ্রেরণামূলক",
    description:
      "দৈনন্দিন একঘেয়ে রুটিন ভেঙে নিজেকে নতুন করে আবিষ্কার করার এক মায়াবী ভিজ্যুয়াল যাত্রা।",
    duration: "১ ঘণ্টা ৫৫ মিনিট",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80",
    moodKey: "focus",
  },
  {
    id: "mov3",
    title: "Midnight in Paris (মিডনাইট ইন প্যারিস)",
    genre: "ম্যাজিক্যাল রিয়ালিজম • কমেডি",
    moodTag: "শান্ত ও নস্টালজিক",
    description:
      "বৃষ্টিস্নাত রাতের ক্যাফেতে বসে সোনালী অতীতের সৃষ্টিশীল শিল্পীদের সাথে অদ্ভুত এক মেলবন্ধন।",
    duration: "১ ঘণ্টা ৩৫ মিনিট",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500&q=80",
    moodKey: "peace",
  },
];

interface MoodChip {
  key: "peace" | "adda" | "romantic" | "focus";
  label: string;
  icon: string;
  quote: string;
}

const MOOD_CHIPS: MoodChip[] = [
  {
    key: "peace",
    label: "শান্ত",
    icon: "🌿",
    quote: "এক কাপ Americano আর একটু নরম সুর।",
  },
  {
    key: "adda",
    label: "আড্ডা",
    icon: "☕",
    quote: "বন্ধুদের সাথে Espresso, গল্প আর হাসি।",
  },
  {
    key: "romantic",
    label: "রোমান্টিক",
    icon: "✨",
    quote: "নরম আলো, Latte আর একটা সুন্দর গল্প।",
  },
  {
    key: "focus",
    label: "ফোকাস",
    icon: "🎯",
    quote: "কফির ঘ্রাণ আর মনোযোগের জন্য কিছু শান্ত সুর।",
  },
];

export const CoffeeCultureLifestyle: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<
    "peace" | "adda" | "romantic" | "focus"
  >("peace");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const activeMoodObj =
    MOOD_CHIPS.find((m) => m.key === selectedMood) || MOOD_CHIPS[0];

  const handlePlayToggle = (id: string) => {
    setPlayingTrackId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F8F4ED] dark:bg-[#150D07] border-t border-[#EDE1D1] dark:border-[#332317]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFE3D3] dark:bg-[#261810] text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#E8925A] shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#C86D3B]" />
            <span>☕ CAFE SYNC · COFFEE & CULTURE</span>
          </div>

          <h2 className="font-bangla-serif font-black text-3xl sm:text-4xl lg:text-5xl text-[#22150C] dark:text-[#FAF4ED] tracking-tight leading-[1.2]">
            কফির সাথে একটু সময় নিজের জন্য
          </h2>

          <p className="text-sm sm:text-base text-[#6E4F39] dark:text-[#BDB0A2] font-normal leading-relaxed">
            এক কাপ কফি, পছন্দের কিছু গান, আর একটা ভালো গল্প — কখনো কখনো এতটুকুই
            যথেষ্ট।
          </p>

          {/* Interactive Mood Selector */}
          <div className="pt-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C5D3D] dark:text-[#D4A373] block">
              আজ আপনার মুড কেমন?
            </span>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {MOOD_CHIPS.map((chip) => {
                const isSelected = selectedMood === chip.key;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setSelectedMood(chip.key)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#C86D3B] text-white shadow-md shadow-[#C86D3B]/25 scale-105"
                        : "bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#C5B4A2] hover:bg-[#E6D6C2] dark:hover:bg-[#342217]"
                    }`}
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Mood Feedback Pill */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3]/70 dark:bg-[#261810]/70 text-xs font-medium text-[#6E4F39] dark:text-[#D8C7B5] border border-[#DFCBB5] dark:border-[#382417] animate-in fade-in-50 duration-300">
                <Coffee className="h-3.5 w-3.5 text-[#C86D3B]" />
                {activeMoodObj.quote}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Recommendation Board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN: MUSIC RECOMMENDATIONS */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE1D1] dark:border-[#332317]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-[#C86D3B]">
                  <Music className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bangla-serif font-black text-lg sm:text-xl text-[#22150C] dark:text-[#FAF4ED]">
                    আজকের কফির সাথে শুনুন
                  </h3>
                  <span className="text-[11px] text-[#8C6446] dark:text-[#9F8A77] font-medium block">
                    নরম সুর, ধীর বিকেল আর এক কাপ গরম কফি।
                  </span>
                </div>
              </div>
            </div>

            {/* Music Cards List */}
            <div className="space-y-3">
              {MUSIC_LIST.map((track) => {
                const isPlaying = playingTrackId === track.id;
                const isMoodMatch = track.moodKey === selectedMood;

                return (
                  <div
                    key={track.id}
                    className={`p-3.5 rounded-3xl bg-[#FAF6F0] dark:bg-[#1A1009] border transition-all duration-300 flex items-center justify-between gap-3 shadow-2xs hover:shadow-md ${
                      isMoodMatch
                        ? "border-[#C86D3B]/60 ring-2 ring-[#C86D3B]/10 bg-[#FCF8F2] dark:bg-[#20140D]"
                        : "border-[#E9DAC8] dark:border-[#382417]"
                    }`}
                  >
                    {/* Artwork & Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative h-14 w-14 rounded-2xl overflow-hidden shrink-0 bg-[#EFE4D6] shadow-inner">
                        <img
                          src={track.imageUrl}
                          alt={track.title}
                          className="h-full w-full object-cover"
                        />
                        {isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                            <Volume2 className="h-5 w-5 animate-pulse text-amber-300" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#EFE3D3] dark:bg-[#261810] text-[#8C5D3D] dark:text-[#E8925A] uppercase tracking-wider">
                            {track.moodTag}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {track.duration}
                          </span>
                        </div>

                        <h4 className="font-bangla-serif font-black text-sm text-[#22150C] dark:text-[#FAF4ED] truncate mt-0.5">
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-[#6E4F39] dark:text-[#BDB0A2] truncate font-normal">
                          {track.note}
                        </p>
                      </div>
                    </div>

                    {/* Compact Interactive Play Button */}
                    <button
                      type="button"
                      onClick={() => handlePlayToggle(track.id)}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all ${
                        isPlaying
                          ? "bg-[#C86D3B] text-white shadow-md"
                          : "bg-[#EFE3D3] dark:bg-[#261810] text-[#5D422E] dark:text-[#C5B4A2] hover:bg-[#C86D3B] hover:text-white"
                      }`}
                      title={isPlaying ? "বিরতি" : "শুনুন"}
                    >
                      {isPlaying ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 ml-0.5 fill-current" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: MOVIES & STORIES RECOMMENDATIONS */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE1D1] dark:border-[#332317]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-[#C86D3B]">
                  <Film className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bangla-serif font-black text-lg sm:text-xl text-[#22150C] dark:text-[#FAF4ED]">
                    কফি শেষ হওয়ার আগেই একটা গল্প
                  </h3>
                  <span className="text-[11px] text-[#8C6446] dark:text-[#9F8A77] font-medium block">
                    প্রিয় মুভি ও দৃশ্যকাব্যের মিষ্টি সঙ্গী।
                  </span>
                </div>
              </div>
            </div>

            {/* Movies List */}
            <div className="space-y-3">
              {MOVIE_LIST.map((movie) => {
                const isMoodMatch = movie.moodKey === selectedMood;

                return (
                  <div
                    key={movie.id}
                    className={`p-3.5 rounded-3xl bg-[#FAF6F0] dark:bg-[#1A1009] border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-2xs hover:shadow-md ${
                      isMoodMatch
                        ? "border-[#C86D3B]/60 ring-2 ring-[#C86D3B]/10 bg-[#FCF8F2] dark:bg-[#20140D]"
                        : "border-[#E9DAC8] dark:border-[#382417]"
                    }`}
                  >
                    {/* Poster Frame */}
                    <div className="relative h-28 sm:h-20 w-full sm:w-28 rounded-2xl overflow-hidden shrink-0 bg-[#EFE4D6] shadow-inner">
                      <img
                        src={movie.imageUrl}
                        alt={movie.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-1.5 left-2">
                        <span className="text-[9px] font-bold text-white/90">
                          {movie.duration}
                        </span>
                      </div>
                    </div>

                    {/* Movie Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#EFE3D3] dark:bg-[#261810] text-[#8C5D3D] dark:text-[#E8925A] uppercase tracking-wider">
                          {movie.moodTag}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {movie.genre}
                        </span>
                      </div>

                      <h4 className="font-bangla-serif font-black text-sm text-[#22150C] dark:text-[#FAF4ED] truncate">
                        {movie.title}
                      </h4>

                      <p className="text-[11px] text-[#6E4F39] dark:text-[#BDB0A2] leading-snug line-clamp-2 font-normal">
                        {movie.description}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="self-end sm:self-center shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C86D3B] hover:underline cursor-pointer">
                        বিস্তারিত
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Closing Warm Cultural Signature */}
        <div className="text-center pt-4">
          <p className="text-xs sm:text-sm text-[#8C6446] dark:text-[#AA9380] font-medium max-w-xl mx-auto italic">
            "এই ক্যাফেতে শুধু কফি পাওয়া যায় না — কফির সাথে একটা ছোট্ট অনুভূতিও
            পাওয়া যায়।"
          </p>
        </div>
      </div>
    </section>
  );
};
