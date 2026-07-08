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

const GEMINI_MODEL = "models/gemini-3.1-flash-live-preview";
const ABENA_KEY = "sk_efe453b8d2774a22975cb14de4c4a5b9";

export default function Notifications() {
  const [notifications, setNotifications] = useState<AlertItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);

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
    // Close WS
    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;
    // Stop all scheduled audio sources
    scheduledSourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
    scheduledSourcesRef.current = [];
    // Close AudioContext
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    nextPlayTimeRef.current = 0;
    // Browser TTS
    window.speechSynthesis?.cancel();
    setPlayingId(null);
    setLoadingId(null);
  };

  // ─── Play a base64 PCM/audio chunk via AudioContext ──────────────────────
  const ensureAudioCtx = async () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      nextPlayTimeRef.current = 0;
    }
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const scheduleChunk = (ctx: AudioContext, b64: string): Promise<void> => {
    return new Promise(resolve => {
      try {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

        // Try to decode as compressed audio (WAV/MP3) first via decodeAudioData
        const copy = bytes.buffer.slice(0);
        ctx.decodeAudioData(
          copy,
          (decoded) => {
            const src = ctx.createBufferSource();
            src.buffer = decoded;
            src.connect(ctx.destination);
            const t = Math.max(ctx.currentTime, nextPlayTimeRef.current);
            src.start(t);
            nextPlayTimeRef.current = t + decoded.duration;
            scheduledSourcesRef.current.push(src);
            src.onended = () => {
              scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== src);
              resolve();
            };
          },
          () => {
            // Fallback: treat as raw 16-bit PCM at 24kHz mono
            const i16 = new Int16Array(bytes.buffer);
            const f32 = new Float32Array(i16.length);
            for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
            const buf = ctx.createBuffer(1, f32.length, 24000);
            buf.copyToChannel(f32, 0);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            const t = Math.max(ctx.currentTime, nextPlayTimeRef.current);
            src.start(t);
            nextPlayTimeRef.current = t + buf.duration;
            scheduledSourcesRef.current.push(src);
            src.onended = () => {
              scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== src);
              resolve();
            };
          }
        );
      } catch { resolve(); }
    });
  };

  // ─── Gemini Live TTS (English / French) ──────────────────────────────────
  const playGemini = async (id: string, text: string) => {
    const apiKey = localStorage.getItem("gemini_live_api_key") || import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      // No key saved yet - use browser TTS
      playBrowserTTS(id, text, "en");
      return;
    }

    setLoadingId(id);

    const ctx = await ensureAudioCtx();
    let audioReceived = false;
    let turnDone = false;
    let setupDone = false;

    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const lang = localStorage.getItem("selected_language") || "en";

    const cleanup = (delay = 0) => {
      setTimeout(() => {
        try { ws.close(); } catch {}
        if (wsRef.current === ws) wsRef.current = null;
        // Only clear playingId if no more audio is playing
        if (scheduledSourcesRef.current.length === 0) {
          setPlayingId(null);
        }
      }, delay);
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({
        setup: {
          model: GEMINI_MODEL,
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
            }
          },
          systemInstruction: {
            parts: [{
              text: lang === "fr"
                ? "Tu es un assistant vocal. Lis le texte suivant en français clairement."
                : "You are a voice assistant. Read the following notification text clearly and naturally in English."
            }]
          }
        }
      }));
    };

    ws.onmessage = async (event) => {
      try {
        const raw = typeof event.data === "string" ? event.data : await (event.data as Blob).text();
        const msg = JSON.parse(raw);

        // Setup complete → send the text to read
        if (msg.setupComplete && !setupDone) {
          setupDone = true;
          setLoadingId(null);
          setPlayingId(id);
          ws.send(JSON.stringify({
            clientContent: {
              turns: [{ role: "user", parts: [{ text }] }],
              turnComplete: true
            }
          }));
        }

        // Audio chunks
        const parts = msg.serverContent?.modelTurn?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            audioReceived = true;
            await scheduleChunk(ctx, part.inlineData.data);
          }
        }

        // Turn complete
        if (msg.serverContent?.turnComplete) {
          turnDone = true;
          // Give buffered audio time to finish then close
          const bufferMs = audioReceived ? 2000 : 500;
          cleanup(bufferMs);
        }
      } catch {}
    };

    ws.onerror = () => {
      setLoadingId(null);
      cleanup();
      if (!audioReceived) playBrowserTTS(id, text, lang);
    };

    ws.onclose = () => {
      if (!setupDone) {
        // Never got setup → fallback
        setLoadingId(null);
        setPlayingId(null);
      }
      if (!turnDone && !audioReceived) {
        setPlayingId(null);
      }
    };
  };

  // ─── Abena AI TTS (Twi / Hausa) ──────────────────────────────────────────
  const playAbena = async (id: string, text: string, voice: string) => {
    setLoadingId(id);
    try {
      const res = await fetch("https://abena.mobobi.com/playground/api/v1/tts/synthesize/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ABENA_KEY}`
        },
        body: JSON.stringify({ text, voice })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // The API might return audio_base64 or audio field
      const b64: string | undefined = json.audio_base64 ?? json.audio ?? json.audioContent;
      if (!b64) throw new Error(`No audio in response. Keys: ${Object.keys(json).join(", ")}`);

      const ctx = await ensureAudioCtx();
      setLoadingId(null);
      setPlayingId(id);

      await scheduleChunk(ctx, b64);

      // Wait for audio to finish
      const checkDone = setInterval(() => {
        if (scheduledSourcesRef.current.length === 0) {
          clearInterval(checkDone);
          setPlayingId(null);
        }
      }, 300);

    } catch (e) {
      console.error("[AbenaAI] failed:", e);
      setLoadingId(null);
      setPlayingId(null);
      // Fallback to browser TTS with English for any Twi notification
      playBrowserTTS(id, text, "en");
    }
  };

  // ─── Browser TTS fallback ─────────────────────────────────────────────────
  const playBrowserTTS = (id: string, text: string, lang: string) => {
    if (!("speechSynthesis" in window)) { return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "fr" ? "fr-FR" : "en-US";
    u.rate = 0.95;
    u.onstart = () => setPlayingId(id);
    u.onend = () => setPlayingId(null);
    u.onerror = () => setPlayingId(null);
    window.speechSynthesis.speak(u);
    setPlayingId(id);
  };

  // ─── Main play handler ────────────────────────────────────────────────────
  const handlePlay = (id: string, body: string) => {
    if (playingId === id || loadingId === id) { stopAll(); return; }
    stopAll();

    const lang = localStorage.getItem("selected_language") || "en";
    const text = body.replace(/\.?\s*Click to know more\.?/gi, "").trim();

    if (lang === "tw") {
      playAbena(id, text, "abena_high");
    } else if (lang === "ha") {
      playAbena(id, text, "abubakar");
    } else {
      playGemini(id, text);
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
              const displayBody = it.body.replace(/\.?\s*Click to know more\.?/gi, "").trim();

              return (
                <div key={it.id} className="py-4 flex gap-3 items-center">
                  <div className={`h-10 w-10 rounded-full border grid place-items-center shrink-0 ${it.unread ? "bg-primary/5 border-primary/20 text-primary shadow-sm" : "bg-surface border-border/70 text-muted-foreground/80"}`}>
                    <IconComponent className="h-[17px] w-[17px]" strokeWidth={2} />
                  </div>

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

                  <button
                    onClick={() => handlePlay(it.id, displayBody)}
                    className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border transition-all active:scale-90 ${
                      isPlaying
                        ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                        : isLoading
                          ? "bg-amber-50 border-amber-200 text-amber-500"
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
