import { useEffect, useRef, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { Video, VideoOff, Square, MicOff, Mic } from "lucide-react";

// Google Chirp3 realistic female voice for Gemini Live.
// Passed to speechConfig.voiceConfig.customVoiceConfig.customVoiceId
// once a Gemini API key is provisioned server-side.
const GEMINI_VOICE_ID = "AQ.Ab8RN6IUN72jFO40xIqrcS_GriP0lqwj9tzqifYCiCw3rYC65Q";

export default function Assistant() {
  const [videoOn, setVideoOn] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => () => stopStream(), []);

  const startCall = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      setVideoOn(true);
      // Attach after the <video> element mounts
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
      // Respect current mute state
      stream.getAudioTracks().forEach((t) => (t.enabled = !muted));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Camera access denied";
      setError(msg);
      setVideoOn(false);
    }
  };

  const endCall = () => {
    stopStream();
    setVideoOn(false);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  };

  return (
    <PhoneShell>
      <div className="px-6 pt-8 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground">AI Assistant</p>
        <h1 className="display text-6xl mt-3 leading-[0.95]">
          How can I<br />help you?
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-snug max-w-[16rem]">
          Speak naturally. I'll listen, think, and help.
        </p>

        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[280px]">
          {videoOn ? (
            <div className="relative w-full max-w-[260px] aspect-[3/4] rounded-3xl overflow-hidden border border-border/70 shadow-[0_10px_40px_-8px_rgba(15,23,42,0.15)] bg-black">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 text-[10px] font-medium text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </div>
            </div>
          ) : (
            <div className="relative grid place-items-center">
              {[240, 180, 120].map((s) => (
                <div
                  key={s}
                  className="absolute rounded-full border border-border/60"
                  style={{ width: s, height: s }}
                />
              ))}
              <div className="relative h-24 w-24 rounded-full bg-white shadow-[0_10px_40px_-8px_rgba(15,23,42,0.15)] grid place-items-center border border-border/60">
                <Waveform />
              </div>
            </div>
          )}
          <p className="mt-16 text-sm text-foreground">
            {videoOn ? "On video call" : "Listening…"}
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            {[0.3, 0.4, 1, 0.5, 0.3, 0.2].map((o, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-foreground"
                style={{ opacity: muted ? 0.15 : o }}
              />
            ))}
          </div>
          {error && (
            <p className="mt-4 text-xs text-destructive max-w-[220px] text-center">
              {error}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between px-2 pb-2">
          <ActionButton
            active={videoOn}
            onClick={videoOn ? endCall : startCall}
            icon={
              videoOn ? (
                <VideoOff className="h-5 w-5" strokeWidth={1.6} />
              ) : (
                <Video className="h-5 w-5" strokeWidth={1.6} />
              )
            }
            label={videoOn ? "End" : "Video call"}
          />
          <div className="flex flex-col items-center gap-2">
            <button
              aria-label="Stop"
              onClick={endCall}
              className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-xl active:scale-95 transition-transform"
            >
              <Square className="h-5 w-5" fill="currentColor" />
            </button>
            <span className="text-xs text-muted-foreground">Tap to stop</span>
          </div>
          <ActionButton
            active={muted}
            onClick={toggleMute}
            icon={
              muted ? (
                <MicOff className="h-5 w-5" strokeWidth={1.6} />
              ) : (
                <Mic className="h-5 w-5" strokeWidth={1.6} />
              )
            }
            label={muted ? "Muted" : "Mute"}
          />
        </div>

        <p className="sr-only" data-voice-id={GEMINI_VOICE_ID}>
          Configured Gemini voice
        </p>
      </div>
    </PhoneShell>
  );
}

function Waveform() {
  const bars = [6, 12, 20, 14, 8];
  return (
    <div className="flex items-center gap-[3px]">
      {bars.map((h, i) => (
        <span key={i} className="w-[2px] bg-foreground rounded-full" style={{ height: h }} />
      ))}
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={`h-12 w-12 rounded-full grid place-items-center shadow-sm border transition-colors active:scale-95 ${
          active
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-white border-border/70"
        }`}
      >
        {icon}
      </button>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
