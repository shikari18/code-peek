import { useState, useEffect, useRef } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { CloudRain, TrendingUp, Pill, Droplet, FileText, Bell, Calculator, Play, Pause } from "lucide-react";

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
  { id: "4", iconName: "Droplet", title: "Water quality alert", body: "Dissolved oxygen dropped low in Pond 4.", time: "Yesterday, 6:20 PM" },
  { id: "5", iconName: "FileText", title: "Feed plan updated", body: "AI adjusted today's feed amount for Pond 3.", time: "Yesterday, 11:40 AM" }
];

const iconMap: Record<string, any> = {
  CloudRain,
  TrendingUp,
  Pill,
  Droplet,
  FileText,
  Calculator,
  Bell
};

// PCM Player class to schedule and play 24kHz raw audio chunks from Gemini Live
class PCMPlayer {
  private audioCtx: AudioContext | null = null;
  private nextPlayTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private sampleRate: number;

  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate;
  }

  async init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: this.sampleRate });
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    this.nextPlayTime = this.audioCtx.currentTime;
  }

  playChunk(base64Data: string) {
    if (!this.audioCtx) {
      this.init();
      return;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      const buffer = this.audioCtx.createBuffer(1, float32.length, this.sampleRate);
      buffer.copyToChannel(float32, 0);

      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);

      const startTime = Math.max(this.audioCtx.currentTime, this.nextPlayTime);
      source.start(startTime);
      this.nextPlayTime = startTime + buffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        this.activeSources = this.activeSources.filter(s => s !== source);
      };
    } catch (e) {
      console.error("PCM Playback error:", e);
    }
  }

  stop() {
    this.activeSources.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextPlayTime = this.audioCtx.currentTime;
    }
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<AlertItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // References for WebSocket and Player
  const wsRef = useRef<WebSocket | null>(null);
  const pcmPlayerRef = useRef<PCMPlayer | null>(null);

  const loadNotifications = () => {
    const stored = localStorage.getItem("app_notifications");
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications(DEFAULT_ALERTS);
      }
    } else {
      localStorage.setItem("app_notifications", JSON.stringify(DEFAULT_ALERTS));
      setNotifications(DEFAULT_ALERTS);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen for custom background events
    window.addEventListener("notifications_updated", loadNotifications);
    return () => {
      window.removeEventListener("notifications_updated", loadNotifications);
      stopGeminiSpeech();
    };
  }, []);

  const stopGeminiSpeech = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pcmPlayerRef.current) {
      pcmPlayerRef.current.stop();
    }
    window.speechSynthesis.cancel(); // also clear legacy tts fallback
    setPlayingId(null);
  };

  const playVoiceNote = async (id: string, text: string) => {
    // If already playing this ID, stop it
    if (playingId === id) {
      stopGeminiSpeech();
      return;
    }

    // Stop any existing playing audio
    stopGeminiSpeech();
    setPlayingId(id);

    // Retrieve Gemini API Key from localStorage or env override
    const apiKey = localStorage.getItem("gemini_live_api_key") || import.meta.env.VITE_GEMINI_API_KEY || "";
    
    // Fallback: If no API key is present, use standard Web Speech TTS
    if (!apiKey) {
      console.warn("[GeminiSpeech] No API key found. Falling back to native browser TTS.");
      const cleanText = text.replace(/Click to know more\./gi, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
      return;
    }

    try {
      // Initialize PCM Player for 24kHz raw audio chunks
      if (!pcmPlayerRef.current) {
        pcmPlayerRef.current = new PCMPlayer(24000);
      }
      await pcmPlayerRef.current.init();

      // Open Live WebSocket
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send setup frame
        const setupMessage = {
          setup: {
            model: "models/gemini-3.1-flash-live-preview",
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede" // Realistic Aoede voice
                  }
                }
              }
            }
          }
        };
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = async (event) => {
        try {
          let rawData = "";
          if (typeof event.data === "string") {
            rawData = event.data;
          } else {
            rawData = await event.data.text();
          }

          const response = JSON.parse(rawData);

          // Handle incoming audio data chunks
          const parts = response.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/pcm")) {
                pcmPlayerRef.current?.playChunk(part.inlineData.data);
              }
            }
          }

          // If turn is complete, close connection gracefully after audio finishes scheduling
          if (response.serverContent?.turnComplete) {
            console.log("[GeminiSpeech] Model finished speaking.");
            setTimeout(() => {
              // Only reset playing state if we are still the active playing notification
              setPlayingId(current => current === id ? null : current);
            }, 1000);
          }
        } catch (e) {
          console.error("[GeminiSpeech] Error parsing server content:", e);
        }
      };

      ws.onclose = () => {
        console.log("[GeminiSpeech] WebSocket closed.");
      };

      ws.onerror = (err) => {
        console.error("[GeminiSpeech] WebSocket error, falling back to TTS:", err);
        // Fallback to TTS on socket error
        const cleanText = text.replace(/Click to know more\./gi, "").trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.onend = () => setPlayingId(null);
        utterance.onerror = () => setPlayingId(null);
        window.speechSynthesis.speak(utterance);
      };

      // Send greeting content asking model to read notification word-for-word
      const cleanText = text.replace(/Click to know more\./gi, "").trim();
      const textPrompt = `Read the following warning message out loud word-for-word in your natural, realistic voice. Do not add any greeting or commentary, just read the text exactly as written: "${cleanText}"`;

      // Wait a moment for connection setup before sending content turn
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          const contentMessage = {
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      text: textPrompt
                    }
                  ]
                }
              ],
              turnComplete: true
            }
          };
          ws.send(JSON.stringify(contentMessage));
        }
      }, 500);

    } catch (e) {
      console.error("[GeminiSpeech] Failed to initialize Gemini Live speech:", e);
      // Fallback
      const cleanText = text.replace(/Click to know more\./gi, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
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
      <div className="px-6 pt-8 pb-12 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="display text-6xl">Alerts</h1>
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] uppercase tracking-wider font-bold text-primary hover:opacity-85 active:scale-95 transition-all"
            >
              Mark Read
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleClearAll}
              className="text-[10px] uppercase tracking-wider font-bold text-rose-500 hover:opacity-85 active:scale-95 transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Bell className="h-7 w-7" strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                No new alerts. Background monitoring will push live alerts when weather or oxygen rates change.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 divide-y divide-border/70">
            {notifications.map((it) => {
              const IconComponent = iconMap[it.iconName] || Bell;
              return (
                <div key={it.id} className="py-5 flex gap-4 animate-slide-up items-center justify-between">
                  <div className="flex gap-4 items-start flex-1 min-w-0">
                    <div className={`h-11 w-11 rounded-full border grid place-items-center shrink-0 ${
                      it.unread 
                        ? "bg-primary/5 border-primary/20 text-primary shadow-sm" 
                        : "bg-surface border-border/70 text-muted-foreground/80"
                    }`}>
                      <IconComponent className="h-[18px] w-[18px]" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className={`font-semibold tracking-tight ${it.unread ? "text-slate-950 font-bold" : "text-slate-700"}`}>
                          {it.title}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{it.time}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3 mt-1">
                        <p className="text-xs text-muted-foreground leading-relaxed">{it.body}</p>
                        {it.unread && (
                          <span className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(3,105,161,0.5)]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Voice Note Readout Button */}
                  <button
                    onClick={() => playVoiceNote(it.id, it.body)}
                    className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border transition-all active:scale-90 ml-3 ${
                      playingId === it.id 
                        ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm animate-pulse" 
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                    }`}
                    title={playingId === it.id ? "Pause Voice" : "Play Voice"}
                  >
                    {playingId === it.id ? (
                      <Pause className="h-4 w-4" fill="currentColor" />
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
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
