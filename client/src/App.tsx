import { useNavigate } from "react-router";
import { Coffee, ArrowRight, QrCode, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function App() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-4 sm:px-6 select-none overflow-hidden">
      {/* Ambient glowing background accents */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Container */}
      <div className="relative z-10 w-full max-w-2xl text-center space-y-8 p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Production-Grade Cafe Point of Sale SaaS
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/20">
              <Coffee className="h-9 w-9" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Cafe Sync POS
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Ultra-fast POS ordering, dedicated Kitchen Display System (KDS), real-time inventory tracking, customer CRM loyalty, and cashier drawer management.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left text-xs">
          {[
            "Live KDS Kitchen Queue",
            "Multi-tender Split Payments",
            "Customer CRM & Loyalty",
            "Inventory Stock Deduction",
            "Visual Floor Plan & Tables",
            "Customer QR Digital Menu",
          ].map((feat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 font-semibold"
            >
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
          >
            Launch POS Terminal
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/menu")}
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2"
          >
            <QrCode className="h-4 w-4 text-amber-400" />
            Customer QR Menu
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
