// Professional Real-time Café Order Announcement & Audio Engine for Bornocafe TV Display

export type AnnouncementType = "new_order" | "order_ready";

export interface AnnouncementItem {
  id: string; // unique event key (e.g. orderId_new or orderId_ready)
  orderId: string;
  orderToken: string;
  table?: string;
  type: AnnouncementType;
}

export interface AnnouncementActiveState {
  orderId: string;
  orderToken: string;
  table?: string;
  type: AnnouncementType;
}

class OrderAnnouncer {
  private queue: AnnouncementItem[] = [];
  private isProcessing = false;
  private audioCtx: AudioContext | null = null;
  private volume = 0.85;
  private soundEnabled = true;
  private activeListeners: ((state: AnnouncementActiveState | null) => void)[] = [];

  // Memory of announced events (orderId + eventType)
  private announcedEvents: Set<string> = new Set();
  private isInitialized = false;

  constructor() {
    this.loadStateFromStorage();
    if (typeof window !== "undefined") {
      // Warm up voices on browser load
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }

  private loadStateFromStorage() {
    try {
      const stored = sessionStorage.getItem("bornocafe_announced_events");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.announcedEvents = new Set(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveStateToStorage() {
    try {
      const arr = Array.from(this.announcedEvents).slice(-200); // keep recent 200
      sessionStorage.setItem("bornocafe_announced_events", JSON.stringify(arr));
    } catch {
      // Ignore storage errors
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public onActiveChange(listener: (state: AnnouncementActiveState | null) => void) {
    this.activeListeners.push(listener);
    return () => {
      this.activeListeners = this.activeListeners.filter((l) => l !== listener);
    };
  }

  private notifyActive(state: AnnouncementActiveState | null) {
    this.activeListeners.forEach((l) => l(state));
  }

  // Unlock browser audio context on user interaction
  public async unlockAudio(): Promise<boolean> {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }
      // Speak a silent utterance to unlock speech synthesis in iOS/Safari/Chrome
      if ("speechSynthesis" in window) {
        const silent = new SpeechSynthesisUtterance(" ");
        silent.volume = 0;
        window.speechSynthesis.speak(silent);
      }
      return true;
    } catch {
      return false;
    }
  }

  // Format token for speech: "A106" -> "A ১ ০ ৬" or "A 1 0 6"
  private formatTokenForSpeech(token: string, isBangla: boolean): string {
    const cleaned = token.replace(/^#/, "").trim();
    if (isBangla) {
      const bnDigits: Record<string, string> = {
        "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
        "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
      };
      // Space out letters and convert numbers to Bangla digits
      return cleaned
        .split("")
        .map((char) => bnDigits[char] || char)
        .join(" ");
    }
    // English: spaced out for clear phonetic articulation
    return cleaned.split("").join(" ");
  }

  // Synthesize a warm café chime sound
  private async playChime(type: AnnouncementType): Promise<void> {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      await this.unlockAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.45, now);
      masterGain.connect(this.audioCtx.destination);

      if (type === "new_order") {
        // Warm 3-tone acoustic café chime (F5 -> A5 -> C6)
        const notes = [698.46, 880.0, 1046.5]; // F5, A5, C6
        notes.forEach((freq, index) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          const filter = this.audioCtx.createBiquadFilter();

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(2200, now);

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + index * 0.12);

          gain.gain.setValueAtTime(0, now + index * 0.12);
          gain.gain.linearRampToValueAtTime(0.35, now + index * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.65);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(now + index * 0.12);
          osc.stop(now + index * 0.12 + 0.65);
        });
        await new Promise((r) => setTimeout(r, 650));
      } else {
        // Bright double bell chime for ORDER READY (E5 -> B5 -> E6)
        const notes = [659.25, 987.77, 1318.51]; // E5, B5, E6
        notes.forEach((freq, index) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + index * 0.14);

          gain.gain.setValueAtTime(0, now + index * 0.14);
          gain.gain.linearRampToValueAtTime(0.4, now + index * 0.14 + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.14 + 0.8);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + index * 0.14);
          osc.stop(now + index * 0.14 + 0.8);
        });
        await new Promise((r) => setTimeout(r, 750));
      }
    } catch {
      // AudioContext fallback
    }
  }

  // Text-To-Speech Speech Synthesis helper
  private async speakText(text: string, lang: string): Promise<void> {
    if (!this.soundEnabled || this.volume <= 0 || !("speechSynthesis" in window)) {
      await new Promise((r) => setTimeout(r, 1200));
      return;
    }

    return new Promise((resolve) => {
      try {
        window.speechSynthesis.cancel(); // clear previous stuck speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.volume;
        utterance.rate = 0.92; // Natural, calm unhurried pace
        utterance.pitch = 1.0;
        utterance.lang = lang;

        // Find best voice match
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(
          (v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()) || v.name.toLowerCase().includes("bangla")
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        let resolved = false;
        const done = () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };

        utterance.onend = done;
        utterance.onerror = done;

        // Safety timeout in case speech synth hangs
        setTimeout(done, 6000);

        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
  }

  // Process the announcement queue sequentially without overlap
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.notifyActive({
        orderId: item.orderId,
        orderToken: item.orderToken,
        table: item.table,
        type: item.type,
      });

      // 1. Play chime sound
      await this.playChime(item.type);

      // 2. 500ms pause
      await new Promise((r) => setTimeout(r, 500));

      // Check available voices for Bangla
      const voices = "speechSynthesis" in window ? window.speechSynthesis.getVoices() : [];
      const hasBanglaVoice = voices.some(
        (v) => v.lang.startsWith("bn") || v.name.toLowerCase().includes("bangla")
      );

      const tokenSpokenBn = this.formatTokenForSpeech(item.orderToken, true);
      const tokenSpokenEn = this.formatTokenForSpeech(item.orderToken, false);

      if (hasBanglaVoice) {
        if (item.type === "new_order") {
          // Phrase 1: "অর্ডার নম্বর A106 এসেছে।"
          await this.speakText(`অর্ডার নম্বর ${tokenSpokenBn} এসেছে।`, "bn-BD");
          // 400ms pause
          await new Promise((r) => setTimeout(r, 400));
          // Phrase 2: exact 2nd repetition of order number
          await this.speakText(tokenSpokenBn, "bn-BD");
        } else {
          // READY
          // Phrase 1: "অর্ডার নম্বর A106 প্রস্তুত।"
          await this.speakText(`অর্ডার নম্বর ${tokenSpokenBn} প্রস্তুত।`, "bn-BD");
          // 400ms pause
          await new Promise((r) => setTimeout(r, 400));
          // Phrase 2: exact 2nd repetition
          await this.speakText(`${tokenSpokenBn}, আপনার অর্ডার প্রস্তুত।`, "bn-BD");
        }
      } else {
        // English Fallback
        if (item.type === "new_order") {
          // Phrase 1: "Order number A106 is now in preparation."
          await this.speakText(`Order number ${tokenSpokenEn} is now in preparation.`, "en-US");
          // 400ms pause
          await new Promise((r) => setTimeout(r, 400));
          // Phrase 2: exact 2nd repetition
          await this.speakText(tokenSpokenEn, "en-US");
        } else {
          // READY
          // Phrase 1: "Order number A106 is ready."
          await this.speakText(`Order number ${tokenSpokenEn} is ready.`, "en-US");
          // 400ms pause
          await new Promise((r) => setTimeout(r, 400));
          // Phrase 2: exact 2nd repetition
          await this.speakText(`Order ${tokenSpokenEn}, your order is ready.`, "en-US");
        }
      }

      // Small cooldown before clearing visual highlight / next in queue
      await new Promise((r) => setTimeout(r, 1200));
      this.notifyActive(null);
      await new Promise((r) => setTimeout(r, 400));
    }

    this.isProcessing = false;
  }

  // Initialize initial orders on page load (so refresh / reconnect does NOT announce old orders)
  public initializeSnapshot(orders: { _id: string; status: string }[]) {
    if (this.isInitialized) return;
    orders.forEach((ord) => {
      this.announcedEvents.add(`${ord._id}_new`);
      if (ord.status === "ready" || ord.status === "completed" || ord.status === "served") {
        this.announcedEvents.add(`${ord._id}_ready`);
      }
    });
    this.saveStateToStorage();
    this.isInitialized = true;
  }

  // Queue a NEW ORDER announcement
  public announceNewOrder(orderId: string, orderToken: string, table?: string) {
    const key = `${orderId}_new`;
    if (this.announcedEvents.has(key)) return; // prevent duplicates
    this.announcedEvents.add(key);
    this.saveStateToStorage();

    this.queue.push({
      id: key,
      orderId,
      orderToken,
      table,
      type: "new_order",
    });

    this.processQueue();
  }

  // Queue an ORDER READY announcement
  public announceOrderReady(orderId: string, orderToken: string, table?: string) {
    const key = `${orderId}_ready`;
    if (this.announcedEvents.has(key)) return; // prevent duplicates
    this.announcedEvents.add(key);
    this.saveStateToStorage();

    this.queue.push({
      id: key,
      orderId,
      orderToken,
      table,
      type: "order_ready",
    });

    this.processQueue();
  }

  // Test announcement (for staff verification button)
  public testAnnouncement(type: AnnouncementType = "order_ready") {
    const testToken = "A106";
    this.queue.push({
      id: `test_${Date.now()}`,
      orderId: `test_${Date.now()}`,
      orderToken: testToken,
      table: "টেবিল ০৩",
      type,
    });
    this.processQueue();
  }
}

export const orderAnnouncer = new OrderAnnouncer();
