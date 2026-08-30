// Professional Real-time Café & Restaurant POS / KDS Order Audio Announcement Engine
// Warm, elegant, natural female English voice announcements with Web Audio synthesized café chimes.

export type AnnouncementType = "new_order" | "order_ready" | "order_completed";

export interface AnnouncementItem {
  id: string; // unique event key (e.g. orderId_new, orderId_ready, orderId_completed)
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
      const stored = sessionStorage.getItem("bornocafe_announced_events_v2");
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
      const arr = Array.from(this.announcedEvents).slice(-300); // keep recent 300
      sessionStorage.setItem("bornocafe_announced_events_v2", JSON.stringify(arr));
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

  // Unlock browser audio context on user gesture
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

  // Format token for clean English pronunciation (e.g. "A106" -> "A 106")
  private formatTokenForSpeech(token: string): string {
    const cleaned = token.replace(/^#/, "").trim();
    return cleaned.replace(/([A-Za-z]+)(\d+)/g, "$1 $2");
  }

  // Synthesize smooth, soft café chimes via Web Audio API (warm, non-piercing)
  private async playChime(type: AnnouncementType): Promise<void> {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      await this.unlockAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.38, now);
      masterGain.connect(this.audioCtx.destination);

      if (type === "new_order") {
        // Soft acoustic 3-tone café POS chord (F5 -> A5 -> C6)
        const notes = [698.46, 880.0, 1046.5];
        notes.forEach((freq, index) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          const filter = this.audioCtx.createBiquadFilter();

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(2200, now);

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + index * 0.11);

          gain.gain.setValueAtTime(0, now + index * 0.11);
          gain.gain.linearRampToValueAtTime(0.32, now + index * 0.11 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.11 + 0.65);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(now + index * 0.11);
          osc.stop(now + index * 0.11 + 0.65);
        });
        await new Promise((r) => setTimeout(r, 600));
      } else if (type === "order_ready") {
        // Soft, sparkling double bell chime for ORDER READY (E5 -> B5 -> E6)
        const notes = [659.25, 987.77, 1318.51];
        notes.forEach((freq, index) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + index * 0.12);

          gain.gain.setValueAtTime(0, now + index * 0.12);
          gain.gain.linearRampToValueAtTime(0.35, now + index * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.75);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + index * 0.12);
          osc.stop(now + index * 0.12 + 0.75);
        });
        await new Promise((r) => setTimeout(r, 650));
      } else if (type === "order_completed") {
        // Subtle confirmation soft chime (A5 -> E6)
        const notes = [880.0, 1318.51];
        notes.forEach((freq, index) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + index * 0.1);

          gain.gain.setValueAtTime(0, now + index * 0.1);
          gain.gain.linearRampToValueAtTime(0.25, now + index * 0.1 + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.5);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + index * 0.1);
          osc.stop(now + index * 0.1 + 0.5);
        });
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch {
      // Ignore audio error
    }
  }

  // Pure English Text-To-Speech SpeechSynthesis helper (prioritizing warm, natural female English voices)
  private async speakTextFemaleEnglish(
    text: string,
    options: { rate?: number; pitch?: number } = {}
  ): Promise<void> {
    if (!this.soundEnabled || this.volume <= 0 || !("speechSynthesis" in window)) {
      await new Promise((r) => setTimeout(r, 1000));
      return;
    }

    return new Promise((resolve) => {
      try {
        window.speechSynthesis.cancel(); // clear previous stuck speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.volume;
        utterance.rate = options.rate ?? 0.90; // Gentle, smooth, unhurried pacing
        utterance.pitch = options.pitch ?? 1.02; // Warm natural pitch
        utterance.lang = "en-US";

        // Find warm, natural female English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredFemaleVoice =
          voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            const isEnglish = lang.startsWith("en");
            const isFemale =
              name.includes("samantha") ||
              name.includes("victoria") ||
              name.includes("karen") ||
              name.includes("zira") ||
              name.includes("jenny") ||
              name.includes("aria") ||
              name.includes("fiona") ||
              name.includes("tessa") ||
              name.includes("moira") ||
              name.includes("female") ||
              name.includes("natural");
            return isEnglish && isFemale;
          }) ||
          voices.find(
            (v) =>
              v.lang === "en-US" ||
              v.lang === "en-GB" ||
              v.name.includes("Google US English") ||
              v.lang.startsWith("en")
          );

        if (preferredFemaleVoice) {
          utterance.voice = preferredFemaleVoice;
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
        setTimeout(done, 7000);

        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
  }

  // Process the announcement queue sequentially without overlapping audio
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

      const tokenSpoken = this.formatTokenForSpeech(item.orderToken);

      // 1. Play soft café notification chime
      await this.playChime(item.type);

      // 2. Short pause (450ms)
      await new Promise((r) => setTimeout(r, 450));

      // 3. Warm, Natural Female Voice Announcement
      if (item.type === "order_ready") {
        // "Your order, A106, is ready."
        await this.speakTextFemaleEnglish(`Your order, ${tokenSpoken}, is ready.`, {
          rate: 0.90,
          pitch: 1.02,
        });

        // Natural pause between sentences (400ms)
        await new Promise((r) => setTimeout(r, 400));

        // "Please come to the counter and collect order A106. Thank you, and enjoy your coffee."
        await this.speakTextFemaleEnglish(
          `Please come to the counter and collect order ${tokenSpoken}. Thank you, and enjoy your coffee.`,
          {
            rate: 0.90,
            pitch: 1.02,
          }
        );
      } else if (item.type === "new_order") {
        // "New order. Order A106."
        await this.speakTextFemaleEnglish(`New order. Order ${tokenSpoken}.`, {
          rate: 0.93,
          pitch: 1.02,
        });

        // 350ms pause
        await new Promise((r) => setTimeout(r, 350));

        // Repeat order number exactly 2nd time: "A106."
        await this.speakTextFemaleEnglish(`${tokenSpoken}.`, {
          rate: 0.93,
          pitch: 1.02,
        });
      } else if (item.type === "order_completed") {
        // "Order A106 completed."
        await this.speakTextFemaleEnglish(`Order ${tokenSpoken} completed.`, {
          rate: 0.92,
          pitch: 1.02,
        });
      }

      // Smooth soft ending before clearing visual highlight
      await new Promise((r) => setTimeout(r, 900));
      this.notifyActive(null);
      await new Promise((r) => setTimeout(r, 400));
    }

    this.isProcessing = false;
  }

  // Initialize initial orders on page load (so refresh / reconnect does NOT replay old orders)
  public initializeSnapshot(orders: { _id: string; status: string }[]) {
    if (this.isInitialized) return;
    orders.forEach((ord) => {
      this.announcedEvents.add(`${ord._id}_new`);
      if (ord.status === "ready" || ord.status === "served" || ord.status === "completed") {
        this.announcedEvents.add(`${ord._id}_ready`);
      }
      if (ord.status === "served" || ord.status === "completed") {
        this.announcedEvents.add(`${ord._id}_completed`);
      }
    });
    this.saveStateToStorage();
    this.isInitialized = true;
  }

  // Queue a NEW ORDER announcement
  public announceNewOrder(orderId: string, orderToken: string, table?: string) {
    const key = `${orderId}_new`;
    if (this.announcedEvents.has(key)) return; // prevent duplicate
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
    if (this.announcedEvents.has(key)) return; // prevent duplicate
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

  // Queue an ORDER COMPLETED announcement
  public announceOrderCompleted(orderId: string, orderToken: string, table?: string) {
    const key = `${orderId}_completed`;
    if (this.announcedEvents.has(key)) return; // prevent duplicate
    this.announcedEvents.add(key);
    this.saveStateToStorage();

    this.queue.push({
      id: key,
      orderId,
      orderToken,
      table,
      type: "order_completed",
    });

    this.processQueue();
  }

  // Test announcement (for staff verification button):
  public testNotification(type: AnnouncementType = "order_ready") {
    const testToken = "A106";
    this.queue.push({
      id: `test_${Date.now()}`,
      orderId: `test_${Date.now()}`,
      orderToken: testToken,
      table: "Table 03",
      type,
    });
    this.processQueue();
  }

  public testAnnouncement = this.testNotification;
}

export const orderAnnouncer = new OrderAnnouncer();
