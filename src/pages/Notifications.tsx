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
  { id: "4", iconName: "Droplet", title: "Water quality alert", body: "Dissolved oxygen dropped low in Pond 4.", time: "Yesterday", },
  { id: "5", iconName: "FileText", title: "Feed plan updated", body: "AI adjusted today's feed amount for Pond 3.", time: "Yesterday" }
];

const iconMap: Record<string, any> = {
  CloudRain, TrendingUp, Pill, Droplet, FileText, Calculator, Bell
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<AlertItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      stopPlayback();
    };
  }, []);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setPlayingId(null);
  };

  const playVoiceNote = async (id: string, body: string) => {
    if (playingId === id) { stopPlayback(); return; }
    stopPlayback();
    setPlayingId(id);

    const lang = localStorage.getItem("selected_language") || "en";
    const cleanText = body.replace(/Click to know more\./gi, "").trim();

    // TWI: Use Abena AI TTS (returns JSON with audio_base64 WAV)
    if (lang === "tw") {
      try {
        const res = await fetch("https://abena.mobobi.com/playground/api/v1/tts/synthesize/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": "sk_efe453b8d2774a22975cb14de4c4a5b9"
          },
          body: JSON.stringify({ text: cleanText, voice: "abena_twi" })
        });

        if (!res.ok) throw new Error(`Abena API error: ${res.status}`);
        const json = await res.json();
        const b64 = json.audio_base64;
        if (!b64) throw new Error("No audio_base64 in response");

        // Decode base64 WAV → Blob → Object URL
        const byteChars = atob(b64);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteArr], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { URL.revokeObjectURL(url); setPlayingId(null); };
        audio.onerror = () => { URL.revokeObjectURL(url); setPlayingId(null); };
        await audio.play();
        return;
      } catch (e) {
        console.error("[AbenaAI] Twi TTS failed, falling back to browser TTS:", e);
      }
    }

    // ENGLISH / FRENCH / HAUSA / fallback: use native SpeechSynthesis
    if (!("speechSynthesis" in window)) { setPlayingId(null); return; }
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (lang === "fr") utterance.lang = "fr-FR";
    else if (lang === "ha") utterance.lang = "ha";
    else utterance.lang = "en-US";
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    window.speechSynthesis.speak(utterance);
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
              No alerts yet. Background monitoring will push live updates for weather, oxygen and market changes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {notifications.map((it) => {
              const IconComponent = iconMap[it.iconName] || Bell;
              const isPlaying = playingId === it.id;
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
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 pr-2">{it.body}</p>
                  </div>

                  {/* Play / Pause voice button */}
                  <button
                    onClick={() => playVoiceNote(it.id, it.body)}
                    className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border transition-all active:scale-90 ${isPlaying ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                    title={isPlaying ? "Pause" : "Play voice note"}
                  >
                    {isPlaying
                      ? <Pause className="h-4 w-4" fill="currentColor" />
                      : <Play className="h-4 w-4 ml-0.5" fill="currentColor" />}
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
