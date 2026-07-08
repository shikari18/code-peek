import { useState, useEffect, useRef } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { CloudRain, TrendingUp, Pill, Droplet, FileText, Bell, Calculator, Play, Pause, Loader } from "lucide-react";

type AlertItem = {
  id: string;
  iconName: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};

const DEFAULT_ALERTS: AlertItem[] = [
  { id: "1", iconName: "CloudRain", title: "Storm expected at 3PM", body: "Heavy rain and strong winds expected. Secure ponds and check oxygen levels.", time: "8:30 AM", unread: true },
  { id: "2", iconName: "TrendingUp", title: "Market price increase", body: "Catfish price in Kumasi increased by 8% today.", time: "7:15 AM", unread: true },
  { id: "3", iconName: "Pill", title: "Medicine reminder", body: "Oxytetracycline treatment scheduled for Pond 2.", time: "6:45 AM", unread: true },
  { id: "4", iconName: "Droplet", title: "Water quality alert", body: "Dissolved oxygen dropped low in Pond 4.", time: "Yesterday" },
  { id: "5", iconName: "FileText", title: "Feed plan updated", body: "AI adjusted today's feed amount for Pond 3.", time: "Yesterday" }
];

const iconMap: Record<string, any> = {
  CloudRain, TrendingUp, Pill, Droplet, FileText, Calculator, Bell
};

// Lightweight PCM player for Gemini audio chunks
class PCMPlayer {
  private ctx: AudioContext | null = null;
  private nextTime = 0;
  private sources: AudioBufferSourceNode[] = [];
  readonly rate: number;
  constructor(rate = 24000) { this.rate = rate; }
  async init() {
    if (!this.ctx) this.ctx = new AudioContext({ sampleRate: this.rate });
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.nextTime = this.ctx.currentTime;
  }
  playChunk(b64: string) {
    if (!this.ctx) return;
    try {
      const bin = atob(b64); const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const i16 = new Int16Array(bytes.buffer);
      const f32 = new Float32Array(i16.length);
      for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
      const buf = this.ctx.createBuffer(1, f32.length, this.rate);
      buf.copyToChannel(f32, 0);
      const src = this.ctx.createBufferSource();
      src.buffer = buf; src.connect(this.ctx.destination);
      const t = Math.max(this.ctx.currentTime, this.nextTime);
      src.start(t); this.nextTime = t + buf.duration;
      this.sources.push(src);
      src.onended = () => { this.sources = this.sources.filter(s => s !== src); };
    } catch {}
  }
  stop() {
    this.sources.forEach(s => { try { s.stop(); } catch {} });
    this.sources = [];
    if (this.ctx) { this.ctx.close(); this.ctx = null; }
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<AlertItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Refs for cleanup
  const abenaCtxRef = useRef<AudioContext | null>(null);
  const abenaSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const geminiWsRef = useRef<WebSocket | null>(null);
  const geminiPlayerRef = useRef<PCMPlayer | null>(null);

  const loadNotifications = () => {
    const stored = localStorage.getItem("app_notifications");
    if (stored) {
      try { setNotifications(JSON.parse(stored)); }
      catch { setNotifications(DEFAULT_ALERTS); }
    } else {
      localStorage.setItem("app_notifications", JSON.stringify(DEFAULT_ALERTS));
      setNotifications(DEFAULT_ALERTS);
    }
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener("notifications_updated", loadNotifications);
    return () => {
      window.removeEventListener("notifications_updated", loadNotifications);
      stopAll();
    };
  }, []);

  const stopAll = () => {
    // Stop Abena audio
    try { abenaSourceRef.current?.stop(); } catch {}
    abenaSourceRef.current = null;
    try { abenaCtxRef.current?.close(); } catch {}
    abenaCtxRef.current = null;
    // Stop Gemini WS
    try { geminiWsRef.current?.close(); } catch {}
    geminiWsRef.current = null;
    geminiPlayerRef.current?.stop();
    geminiPlayerRef.current = null;
    // Stop browser TTS
    window.speechSynthesis?.cancel();
    setPlayingId(null);
    setLoadingId(null);
  };

  // ── Abena AI TTS (Twi / Hausa) ──────────────────────────────────────────
  const playAbena = async (id: string, text: string, voice: string) => {
    setLoadingId(id);
    try {
      const res = await fetch("https://abena.mobobi.com/playground/api/v1/tts/synthesize/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "sk_efe453b8d2774a22975cb14de4c4a5b9"
        },
        body: JSON.stringify({ text, voice })
      });

      if (!res.ok) throw new Error(`Abena ${res.status}`);
      const json = await res.json();
      const b64 = json.audio_base64;
      if (!b64) throw new Error("No audio_base64");

      // Decode base64 → ArrayBuffer
      const binStr = atob(b64);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);

      // Use AudioContext.decodeAudioData (bypasses autoplay policy)
      const ctx = new AudioContext();
      abenaCtxRef.current = ctx;
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));

      const src = ctx.createBufferSource();
      src.buffer = audioBuffer;
      src.connect(ctx.destination);
      abenaSourceRef.current = src;

      src.onended = () => {
        ctx.close().catch(() => {});
        abenaCtxRef.current = null;
        abenaSourceRef.current = null;
        setPlayingId(null);
      };

      setLoadingId(null);
      setPlayingId(id);
      src.start(0);
    } catch (e) {
      console.error("[AbenaAI] TTS failed:", e);
      setLoadingId(null);
      setPlayingId(null);
    }
  };

  // ── Gemini Live TTS (English / French) ──────────────────────────────────
  const playGemini = async (id: string, text: string, lang: string) => {
    const apiKey = localStorage.getItem("gemini_live_api_key") || "";
    if (!apiKey) {
      // Fallback to browser TTS if no Gemini key
      playBrowserTTS(id, text, lang);
      return;
    }

    setLoadingId(id);
    try {
      const player = new PCMPlayer(24000);
      await player.init();
      geminiPlayerRef.current = player;

      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      const ws = new WebSocket(wsUrl);
      geminiWsRef.current = ws;

      ws.onopen = () => {
        const langInstruction = lang === "fr"
          ? "Respond in French."
          : "Respond in English.";

        ws.send(JSON.stringify({
          setup: {
            model: "models/gemini-live-2.5-flash-preview",
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
            },
            systemInstruction: { parts: [{ text: langInstruction }] }
          }
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const raw = typeof event.data === "string" ? event.data : await event.data.text();
          const msg = JSON.parse(raw);

          if (msg.setupComplete) {
            setLoadingId(null);
            setPlayingId(id);
            // Send the text to speak
            ws.send(JSON.stringify({
              clientContent: {
                turns: [{ role: "user", parts: [{ text: `Read this notification aloud clearly: "${text}"` }] }],
                turnComplete: true
              }
            }));
          }

          const parts = msg.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) player.playChunk(part.inlineData.data);
            }
          }

          if (msg.serverContent?.turnComplete) {
            // Wait for audio to finish then clean up
            setTimeout(() => {
              ws.close();
              geminiWsRef.current = null;
              geminiPlayerRef.current?.stop();
              geminiPlayerRef.current = null;
              setPlayingId(null);
            }, 1500);
          }
        } catch {}
      };

      ws.onerror = () => {
        setLoadingId(null);
        playBrowserTTS(id, text, lang); // fallback
      };
      ws.onclose = () => {};

    } catch (e) {
      console.error("[GeminiTTS] failed:", e);
      setLoadingId(null);
      playBrowserTTS(id, text, lang);
    }
  };

  // ── Browser TTS fallback ─────────────────────────────────────────────────
  const playBrowserTTS = (id: string, text: string, lang: string) => {
    if (!("speechSynthesis" in window)) { setPlayingId(null); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "fr" ? "fr-FR" : "en-US";
    u.onstart = () => setPlayingId(id);
    u.onend = () => setPlayingId(null);
    u.onerror = () => setPlayingId(null);
    window.speechSynthesis.speak(u);
    setPlayingId(id);
  };

  // ── Main handler ──────────────────────────────────────────────────────────
  const handlePlay = (id: string, body: string) => {
    if (playingId === id || loadingId === id) { stopAll(); return; }
    stopAll();

    const lang = localStorage.getItem("selected_language") || "en";
    // Strip any trailing "Click to know more" from body just in case
    const text = body.replace(/\.?\s*Click to know more\.?/gi, "").trim();

    if (lang === "tw") {
      playAbena(id, text, "abena_high");
    } else if (lang === "ha") {
      playAbena(id, text, "abubakar");
    } else {
      playGemini(id, text, lang);
    }
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    localStorage.setItem("app_notifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleClearAll = () => {
    localStorage.setItem("app_notifications", JSON.stringify([]));
    setNotifications([]);
  };

  return (
    <PhoneShell>
      <div className="px-6 pt-8 pb-24 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="display text-6xl">Alerts</h1>
          <div className="flex gap-2 items-center">
            <button onClick={handleMarkAllRead} className="text-[10px] uppercase tracking-wider font-bold text-primary hover:opacity-85 active:scale-95 transition-all">Mark Read</button>
            <span className="text-slate-300">|</span>
            <button onClick={handleClearAll} className="text-[10px] uppercase tracking-wider font-bold text-rose-500 hover:opacity-85 active:scale-95 transition-all">Clear</button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Bell className="h-7 w-7" strokeWidth={1.6} />
            </div>
            <p className="font-semibold text-slate-800">All caught up!</p>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              No alerts yet. Background monitoring pushes live updates for weather, oxygen and market changes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {notifications.map((it) => {
              const IconComponent = iconMap[it.iconName] || Bell;
              const isPlaying = playingId === it.id;
              const isLoading = loadingId === it.id;
              // Strip "Click to know more." before displaying
              const displayBody = it.body.replace(/\.?\s*Click to know more\.?/gi, "").trim();

              return (
                <div key={it.id} className="py-4 flex gap-3 items-center">
                  {/* Icon */}
                  <div className={`h-10 w-10 rounded-full border grid place-items-center shrink-0 ${it.unread ? "bg-primary/5 border-primary/20 text-primary shadow-sm" : "bg-surface border-border/70 text-muted-foreground/80"}`}>
                    <IconComponent className="h-[17px] w-[17px]" strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold tracking-tight leading-snug ${it.unread ? "text-slate-950" : "text-slate-700"}`}>
                        {it.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{it.time}</span>
                        {it.unread && <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_rgba(3,105,161,0.5)]" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 pr-2">{displayBody}</p>
                  </div>

                  {/* Play / Pause / Loading button */}
                  <button
                    onClick={() => handlePlay(it.id, displayBody)}
                    className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border transition-all active:scale-90 ${
                      isPlaying ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                      : isLoading ? "bg-amber-50 border-amber-200 text-amber-500"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                    title={isPlaying ? "Stop" : isLoading ? "Loading…" : "Play voice note"}
                  >
                    {isLoading
                      ? <Loader className="h-4 w-4 animate-spin" />
                      : isPlaying
                        ? <Pause className="h-4 w-4" fill="currentColor" />
                        : <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                    }
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PhoneShell>
  );
}
