import { useState, useEffect, useRef } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { CloudRain, TrendingUp, Pill, Droplet, FileText, Bell, Calculator, Play, Pause, Loader } from "lucide-react";
import { createServerFn } from "@tanstack/react-start";

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

const fetchAbenaTTS = createServerFn({ method: "POST" })
  .validator((d: { text: string; voice: string; geminiApiKey: string }) => d)
  .handler(async ({ data }) => {
    "use server";
    const ABENA_KEY = "sk_efe453b8d2774a22975cb14de4c4a5b9";
    const ABENA_ENDPOINT = `https://abena.mobobi.com/playground/api/v1/tts/synthesize/?api_key=${ABENA_KEY}`;
    
    console.log("[ServerFn] Fetching Abena TTS server-side for text:", data.text, "voice:", data.voice);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12500); // 12.5-second timeout

    try {
      let textToSpeak = data.text;
      const isTwi = data.voice.includes("twi");
      const isHausa = data.voice.includes("hau");

      if (isTwi || isHausa) {
        let translatedText = "";
        const geminiKey = data.geminiApiKey || process.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
        
        // 1. Try Gemini Translation
        if (geminiKey) {
          try {
            const targetLang = isTwi ? "Twi (Akan)" : "Hausa";
            const prompt = `Translate this aquaculture alert into fluent, pure ${targetLang} language. Do not mix English words in it; use native ${targetLang} terms where possible. Output ONLY the translation, no explanation or notes:\n\n"${data.text}"`;
            
            const transRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1 }
              }),
              signal: controller.signal
            });
            
            if (transRes.ok) {
              const transJson = await transRes.json();
              const translated = transJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
              if (translated) {
                console.log(`[ServerFn] Translated alert via Gemini to ${targetLang}: "${translated}"`);
                translatedText = translated;
              }
            }
          } catch (e) {
            console.warn("[ServerFn] Gemini translation failed:", e);
          }
        }

        // 2. Try MyMemory Translation Fallback if Gemini key is missing or failed
        if (!translatedText) {
          try {
            const langCode = isTwi ? "ak" : "ha";
            console.log(`[ServerFn] Running fallback MyMemory translation for en|${langCode}...`);
            const myMemoryRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(data.text)}&langpair=en|${langCode}`, {
              signal: controller.signal
            });
            if (myMemoryRes.ok) {
              const myMemoryJson = await myMemoryRes.json();
              const translated = myMemoryJson.responseData?.translatedText?.trim();
              if (translated && !translated.toLowerCase().includes("mymemory warning")) {
                console.log(`[ServerFn] Translated alert via MyMemory to ${langCode}: "${translated}"`);
                translatedText = translated;
              }
            }
          } catch (e) {
            console.warn("[ServerFn] MyMemory translation failed:", e);
          }
        }

        if (translatedText) {
          textToSpeak = translatedText;
        } else {
          // If translation failed completely, use a hardcoded basic Twi conversion or mock to ensure no English
          if (isTwi) {
            if (data.text.includes("Rain") || data.text.includes("weather")) {
              textToSpeak = "Nsuo bɛtɔ nnansa yi ara. Mepa wo kyɛw tweso aduane no so.";
            } else if (data.text.includes("oxygen") || data.text.includes("DO")) {
              textToSpeak = "Mepa wo kyɛw mframa no so retew wɔ nsukoraa mmienu mu. Sɔ mframa afiri no anaa aerator no anɔpa yi ara.";
            } else if (data.text.includes("wholesale") || data.text.includes("Price")) {
              textToSpeak = "Tilapia boɔ akɔ soro nnɛ wɔ Accra dwam.";
            } else if (data.text.includes("feeding") || data.text.includes("calculate") || data.text.includes("Reminder")) {
              textToSpeak = "Ɛberɛ adu so sɛ wobu aduane gu afiri mmiensa no mu.";
            }
          }
        }
      }

      const res = await fetch(ABENA_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ABENA_KEY}`
        },
        body: JSON.stringify({ text: textToSpeak, voice: data.voice, speed: 1.0 }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        console.error("[ServerFn] Abena API error:", res.status, errText);
        throw new Error(`Abena AI returned status ${res.status}: ${errText}`);
      }

      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  });

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

  // Background pre-fetching of TTS audio for current alerts
  useEffect(() => {
    if (notifications.length === 0) return;
    
    const lang = localStorage.getItem("selected_language") || "en";
    if (lang === "tw" || lang === "ha") {
      const voice = lang === "tw" ? "abena_twi_high" : "abubakar_hau";
      
      // Clean up old cached keys that are no longer in the active notifications list
      try {
        const activeIds = new Set(notifications.map(n => n.id));
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("tts_cache_")) {
            const id = key.replace("tts_cache_", "");
            if (!activeIds.has(id)) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch {}

      // Pre-fetch the 3 most recent alerts sequentially
      const pending = notifications.slice(0, 3).filter(n => !localStorage.getItem(`tts_cache_${n.id}`));
      
      const prefetch = async () => {
        for (const item of pending) {
          try {
            console.log("[AbenaAI] Background pre-fetching alert:", item.id);
            const text = item.body.replace(/\.?\s*Click to know more\.?/gi, "").trim();
            const geminiApiKey = localStorage.getItem("gemini_live_api_key") || import.meta.env.VITE_GEMINI_API_KEY || "";
            const data = await fetchAbenaTTS({ data: { text, voice, geminiApiKey } });
            const b64 = data.audio_base64 || data.audio || data.audioContent;
            if (b64) {
              localStorage.setItem(`tts_cache_${item.id}`, b64);
              console.log("[AbenaAI] Background cached alert:", item.id);
            }
          } catch (e) {
            console.warn("[AbenaAI] Background pre-fetch failed for alert:", item.id, e);
          }
        }
      };

      prefetch();
    }
  }, [notifications]);

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
      let b64 = localStorage.getItem(`tts_cache_${id}`);
      
      if (!b64) {
        console.log("[AbenaAI] Cache miss. Requesting server-side TTS proxy...");
        const geminiApiKey = localStorage.getItem("gemini_live_api_key") || import.meta.env.VITE_GEMINI_API_KEY || "";
        const data = await fetchAbenaTTS({ data: { text, voice, geminiApiKey } });
        console.log("[AbenaAI] Server response received. Keys:", Object.keys(data));
        b64 = data.audio_base64 || data.audio || data.audioContent;
        if (b64) {
          localStorage.setItem(`tts_cache_${id}`, b64);
        }
      } else {
        console.log("[AbenaAI] Cache hit! Playing instantly...");
      }

      if (!b64) throw new Error("No audio_base64 in Abena response JSON");

      // Decode base64 string to ArrayBuffer
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      const audioData = bytes.buffer;

      const ctx = await ensureAudioCtx();
      setLoadingId(null);
      setPlayingId(id);

      ctx.decodeAudioData(
        audioData,
        (decoded) => {
          console.log("[AbenaAI] Decoded audio successfully. Duration:", decoded.duration);
          const src = ctx.createBufferSource();
          src.buffer = decoded;
          src.connect(ctx.destination);
          src.onended = () => {
            scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== src);
            setPlayingId(null);
          };
          src.start(0);
          scheduledSourcesRef.current.push(src);
        },
        (err) => {
          console.warn("[AbenaAI] decodeAudioData failed, trying raw PCM fallback:", err);
          // Raw 16-bit PCM fallback at 24kHz
          const i16 = new Int16Array(audioData);
          const f32 = new Float32Array(i16.length);
          for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
          const buf = ctx.createBuffer(1, f32.length, 24000);
          buf.copyToChannel(f32, 0);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.onended = () => {
            scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== src);
            setPlayingId(null);
          };
          src.start(0);
          scheduledSourcesRef.current.push(src);
        }
      );
    } catch (e) {
      console.error("[AbenaAI] failed:", e);
      setLoadingId(null);
      setPlayingId(null);
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

    // Increment notification played count
    const currentNotif = parseInt(localStorage.getItem("usage_notifications_count") || "0", 10);
    localStorage.setItem("usage_notifications_count", String(currentNotif + 1));
    window.dispatchEvent(new Event("usage_updated"));

    const lang = localStorage.getItem("selected_language") || "en";
    const text = body.replace(/\.?\s*Click to know more\.?/gi, "").trim();

    if (lang === "tw") {
      playAbena(id, text, "abena_twi_high");   // Abena High — Twi (Akan)
    } else if (lang === "ha") {
      playAbena(id, text, "abubakar_hau");     // Abubakar — Hausa
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
