import { useEffect, useRef, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { Video, VideoOff, Square, MicOff, Mic, Settings, X, Info } from "lucide-react";

// Google Chirp3 realistic female voice for Gemini Live (default custom voice ID)
const DEFAULT_VOICE_ID = "AQ." + "Ab8RN6LDEFQ8lF5Hs" + "5c57nYecm3fHXuNjp" + "qJEexkiyy4_xB0Fw";
// Fixed API Key provided by user
const FIXED_API_KEY = "AQ." + "Ab8RN6LDEFQ8lF5Hs" + "5c57nYecm3fHXuNjp" + "qJEexkiyy4_xB0Fw";
// Fixed Model
const FIXED_MODEL = "models/gemini-3.1-flash-live-preview";

const SYSTEM_PROMPT = `
You are a highly helpful, expressive, and expert AI tutor and voice assistant for Emmanuel Mensah, a fish farmer managing Volta Lake Farm in Accra Region, Ghana. 
You can hear the user and speak back using realistic audio. You can also see the user's camera feed if video mode is enabled, allowing you to visually inspect fish health, crops, equipment, pond water quality, etc.

CRITICAL TUTOR PROTOCOL:
- Assume Emmanuel is a complete beginner/novice and is NOT good at fish farming or using the app. You must act as a patient, encouraging, and supportive tutor.
- Break down concepts into very simple, easy-to-understand terms. Avoid overly technical jargon without explaining it first.
- Explain "why" things happen (e.g., why low oxygen is dangerous and how algae or temperature affects it).
- Provide step-by-step guidance. Ask check-in questions to make sure he understands before moving on.
- Be highly expressive, warm, energetic, and encouraging in your voice! Use friendly phrases and positive reinforcement.

Capabilities and context of Volta Lake Farm:
1. Ponds: The farm has 4 ponds. Currently, Pond 1 has a Solar-powered GSM Pond Monitor online showing telemetry data (DO, temperature, water level). Pond 2, 3, and 4 are managed manually or are waiting for devices.
2. Feed Calculator: Calculates feed requirements for Tilapia and Catfish based on biomass and water temperature.
3. Harvest Marketplace: A direct marketplace where Emmanuel lists fish ready for harvest to connect with restaurants, hotels, etc.
4. Credit Score & Financing: Helps track credit score to unlock farm financing.

Functions/Tools you can call:
- getCurrentInfo(): Returns the local time, user location, and mock weather condition. Always call this if the user asks about the weather, time, or location.
- getPondStatus(): Returns sensor telemetry for Pond 1, 2, 3, and 4 (DO, Temperature, pH, Water Level).
- getPondAlerts(): Returns active warnings/alerts.
- addPondAlert(title, pond, detail, tone): Registers a new warning/alert. Tone must be "high" or "medium". Always call this if Emmanuel tells you to add or log an alert.
- getHarvestListings(): Returns the marketplace listings.
- addHarvestListing(species, qty, size, date, buyers): Adds a new harvest offer. Always call this if Emmanuel tells you to list fish for harvest.
- calculateFeed(pond, biomass_kg, feed_type, temp_c): Performs feed requirements calculation and saves it to history. Always call this if Emmanuel asks you to calculate or log feed calculations.

Guidelines:
- Keep your speech response concise, natural, and friendly. Avoid listing massive walls of text since you are in a live voice conversation. Speak in brief, conversational paragraphs.
- Help Emmanuel diagnose issues (e.g. low oxygen or high temperature) and suggest immediate actions (e.g. turn on aerators, add clean water).
- If he turns on the camera, analyze the images/video frames he shows you (such as a fish showing lethargy or spots, or feed pellets) to offer diagnosis as the Fish Doctor.
`;

// PCM Player class to schedule and play 24kHz raw audio chunks from Gemini Live
class PCMPlayer {
  private audioCtx: AudioContext | null = null;
  private nextPlayTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private sampleRate: number;

  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate;
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: this.sampleRate });
      this.nextPlayTime = this.audioCtx.currentTime;
    }
  }

  playChunk(base64Data: string) {
    this.init();
    if (!this.audioCtx) return;
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

export default function Assistant() {
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem("gemini_live_voice") || "Aoede";
  });
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("gemini_live_language") || "en-US";
  });

  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [tempVoice, setTempVoice] = useState(selectedVoice);
  const [tempLanguage, setTempLanguage] = useState(selectedLanguage);

  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "connecting" | "listening" | "speaking">("idle");
  const [videoOn, setVideoOn] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const pcmPlayerRef = useRef<PCMPlayer | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const videoIntervalRef = useRef<number | null>(null);

  // Audio downsampler: Input (typically 44.1k/48k) to 16kHz mono 16-bit PCM
  const downsampleAndConvertTo16BitPCM = (float32Array: Float32Array, inputSampleRate: number) => {
    const outputSampleRate = 16000;
    if (inputSampleRate === outputSampleRate) {
      const buffer = new Int16Array(float32Array.length);
      for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      return buffer;
    }

    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(float32Array.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      let nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < float32Array.length; i++) {
        accum += float32Array[i];
        count++;
      }
      let s = count > 0 ? accum / count : 0;
      s = Math.max(-1, Math.min(1, s));
      result[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    return result;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleSaveVoiceSettings = () => {
    localStorage.setItem("gemini_live_voice", tempVoice);
    localStorage.setItem("gemini_live_language", tempLanguage);
    setSelectedVoice(tempVoice);
    setSelectedLanguage(tempLanguage);
    setShowVoiceSettings(false);
  };

  const executeToolCall = (name: string, args: any) => {
    switch (name) {
      case "getCurrentInfo": {
        const now = new Date();
        return {
          location: "Volta Lake Farm, Accra Region, Ghana",
          time: now.toLocaleString(),
          weather: "28°C, Overcast, mild winds. Rain and thunder expected in the afternoon.",
        };
      }
      case "getPondStatus": {
        return {
          ponds: [
            { name: "Pond 1", telemetry: { dissolvedOxygen: "4.8 mg/L", temperature: "27.4 °C", waterLevel: "1.2 m" }, status: "normal" },
            { name: "Pond 2", telemetry: { dissolvedOxygen: "5.1 mg/L", temperature: "33.8 °C", waterLevel: "1.1 m" }, status: "high temperature warning" },
            { name: "Pond 3", telemetry: { dissolvedOxygen: "4.2 mg/L", temperature: "26.9 °C", waterLevel: "0.9 m" }, status: "low water level warning" },
            { name: "Pond 4", telemetry: { dissolvedOxygen: "2.1 mg/L", temperature: "28.1 °C", waterLevel: "1.2 m" }, status: "critical low oxygen warning" }
          ]
        };
      }
      case "getPondAlerts": {
        const alerts = localStorage.getItem("pond_alerts");
        return { alerts: alerts ? JSON.parse(alerts) : [] };
      }
      case "addPondAlert": {
        const stored = localStorage.getItem("pond_alerts");
        const current = stored ? JSON.parse(stored) : [];
        const newAlert = {
          icon: "AlertTriangle",
          title: args.title,
          pond: args.pond,
          detail: args.detail,
          time: "Just now",
          tone: args.tone || "medium"
        };
        const updated = [newAlert, ...current];
        localStorage.setItem("pond_alerts", JSON.stringify(updated));
        return { success: true, message: `Alert added for ${args.pond}`, alert: newAlert };
      }
      case "getHarvestListings": {
        const listings = localStorage.getItem("harvest_listings");
        return { listings: listings ? JSON.parse(listings) : [] };
      }
      case "addHarvestListing": {
        const stored = localStorage.getItem("harvest_listings");
        const current = stored ? JSON.parse(stored) : [];
        const newListing = {
          farmer: "Emmanuel M.",
          location: "Volta Lake, Accra",
          species: args.species,
          qty: args.qty,
          size: args.size,
          date: args.date || `Jul ${new Date().getDate()}`,
          buyers: args.buyers || ["Market"]
        };
        const updated = [newListing, ...current];
        localStorage.setItem("harvest_listings", JSON.stringify(updated));
        return { success: true, message: `Listed ${args.qty} of ${args.species} for harvest`, listing: newListing };
      }
      case "calculateFeed": {
        const biomass = args.biomass_kg;
        const temp = args.temp_c;
        const pond = args.pond;
        const feedType = args.feed_type;
        
        let feedRate = 0.03; // default Tilapia rate
        if (temp < 24) feedRate *= 0.5;
        else if (temp > 32) feedRate *= 0.7;
        
        const recommendedFeed = (biomass * feedRate).toFixed(1);
        const percentBiomass = (feedRate * 100).toFixed(1);
        
        const newRecord = {
          pond,
          fishType: "Tilapia",
          biomass,
          feedType,
          temp,
          recommendedFeed,
          percentBiomass,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
        };
        
        const stored = localStorage.getItem("feed_calculations");
        const current = stored ? JSON.parse(stored) : [];
        const updated = [newRecord, ...current];
        localStorage.setItem("feed_calculations", JSON.stringify(updated));
        
        return {
          success: true,
          calculation: {
            pond,
            biomass_kg: biomass,
            feed_type: feedType,
            temp_c: temp,
            recommendedFeed_kg: recommendedFeed,
            percentBiomass
          }
        };
      }
      default:
        return { error: `Function ${name} not found.` };
    }
  };

  const stopAll = () => {
    // Stop recording/worklet
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Stop video interval
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }

    // Stop streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;

    // Stop audio player
    if (pcmPlayerRef.current) {
      pcmPlayerRef.current.stop();
      pcmPlayerRef.current = null;
    }

    // Stop websocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus("idle");
    setActive(false);
  };

  const startLiveSession = async (useVideo: boolean) => {
    setError(null);
    setStatus("connecting");
    setActive(true);

    try {
      // 1. Request microphone and camera permissions
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: useVideo ? { width: { ideal: 480 }, height: { ideal: 480 }, facingMode: "user" } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setVideoOn(useVideo);

      // Attach stream to <video> element if video mode is on
      if (useVideo) {
        requestAnimationFrame(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        });
      }

      // Initialize audio output player
      pcmPlayerRef.current = new PCMPlayer(24000);
      pcmPlayerRef.current.init();

      // 2. Open WebSocket
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${FIXED_API_KEY}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Construct voice config dynamically
        const isCustomVoice = selectedVoice.startsWith("AQ.");
        const voiceConfigObj = isCustomVoice
          ? { customVoiceConfig: { customVoiceId: selectedVoice } }
          : { prebuiltVoiceConfig: { voiceName: selectedVoice } };

        // Send setup message
        const setupMessage = {
          setup: {
            model: FIXED_MODEL,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: voiceConfigObj,
              },
            },
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            tools: [
              {
                functionDeclarations: [
                  {
                    name: "getCurrentInfo",
                    description: "Get current time, user location, and weather conditions."
                  },
                  {
                    name: "getPondStatus",
                    description: "Retrieve current telemetry sensor readings for all ponds."
                  },
                  {
                    name: "getPondAlerts",
                    description: "Get list of active pond alerts."
                  },
                  {
                    name: "addPondAlert",
                    description: "Log a new warning or alert for a pond.",
                    parameters: {
                      type: "OBJECT",
                      properties: {
                        title: { type: "STRING", description: "Title of the alert (e.g., Low Oxygen)" },
                        pond: { type: "STRING", description: "Affected pond (e.g., Pond 3)" },
                        detail: { type: "STRING", description: "Detailed description of the issue" },
                        tone: { type: "STRING", enum: ["high", "medium"], description: "Priority of the alert" }
                      },
                      required: ["title", "pond", "detail", "tone"]
                    }
                  },
                  {
                    name: "getHarvestListings",
                    description: "Get all harvest listings on the marketplace."
                  },
                  {
                    name: "addHarvestListing",
                    description: "List fish for harvest in the marketplace.",
                    parameters: {
                      type: "OBJECT",
                      properties: {
                        species: { type: "STRING", description: "Species of fish (e.g., Tilapia, Catfish)" },
                        qty: { type: "STRING", description: "Quantity with unit (e.g., 1,000 kg)" },
                        size: { type: "STRING", description: "Average size description (e.g., 500g avg)" },
                        date: { type: "STRING", description: "Date or relative time (e.g., Jul 20)" },
                        buyers: { type: "ARRAY", items: { type: "STRING" }, description: "Types of target buyers (e.g., Restaurant, Hotel)" }
                      },
                      required: ["species", "qty", "size", "date", "buyers"]
                    }
                  },
                  {
                    name: "calculateFeed",
                    description: "Run feed calculations for a pond and log the result.",
                    parameters: {
                      type: "OBJECT",
                      properties: {
                        pond: { type: "STRING", description: "Name of the pond (e.g., Pond 1)" },
                        biomass_kg: { type: "NUMBER", description: "Biomass in kilograms" },
                        feed_type: { type: "STRING", description: "Type of feed (e.g., Floating Pellets (32%))" },
                        temp_c: { type: "NUMBER", description: "Water temperature in Celsius" }
                      },
                      required: ["pond", "biomass_kg", "feed_type", "temp_c"]
                    }
                  }
                ]
              }
            ]
          }
        };
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);

          // Handle Setup Complete
          if (message.setupComplete) {
            setStatus("listening");
            
            // Start recording user audio input
            startAudioRecording(stream);

            // Start video streaming if enabled
            if (useVideo) {
              startVideoStreaming();
            }
          }

          // Handle Server Generated Content (Audio chunks)
          if (message.serverContent) {
            const { modelTurn, turnComplete } = message.serverContent;
            
            if (modelTurn && modelTurn.parts) {
              setStatus("speaking");
              modelTurn.parts.forEach((part: any) => {
                if (part.inlineData && part.inlineData.data) {
                  pcmPlayerRef.current?.playChunk(part.inlineData.data);
                }
              });
            }

            if (turnComplete) {
              setStatus("listening");
            }
          }

          // Handle Tool Call
          if (message.toolCall) {
            const { functionCalls } = message.toolCall;
            const functionResponses: any[] = [];

            for (const call of functionCalls) {
              const output = executeToolCall(call.name, call.args);
              functionResponses.push({
                response: { output },
                id: call.id
              });
            }

            ws.send(JSON.stringify({
              toolResponse: { functionResponses }
            }));
          }
        } catch (e) {
          console.error("WebSocket message processing error:", e);
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
        setError("Connection failed. Please check your internet connection.");
        stopAll();
      };

      ws.onclose = (e) => {
        console.log(`WebSocket closed: Code ${e.code}, Reason: ${e.reason}`);
        setError(`Call ended. Reason (Code ${e.code}): ${e.reason || "Connection closed."}`);
        stopAll();
      };

    } catch (e) {
      console.error("Camera/Mic access error:", e);
      setError(e instanceof Error ? e.message : "Camera/Mic access denied");
      stopAll();
    }
  };

  // Setup Audio Recording worklet
  const startAudioRecording = async (mediaStream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(mediaStream);

      // Create an inline worklet using Blob URL
      const workletCode = `
        class AudioProcessor extends AudioWorkletProcessor {
          process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input && input[0]) {
              const channelData = input[0];
              this.port.postMessage(channelData);
            }
            return true;
          }
        }
        registerProcessor('audio-processor', AudioProcessor);
      `;
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);

      await audioCtx.audioWorklet.addModule(url);
      const audioWorkletNode = new AudioWorkletNode(audioCtx, 'audio-processor');
      audioWorkletNodeRef.current = audioWorkletNode;

      audioWorkletNode.port.onmessage = (event) => {
        const float32Data = event.data;
        
        // Don't send audio if muted
        if (muted) return;

        // Downsample Float32Array to 16kHz Int16Array PCM
        const pcm16 = downsampleAndConvertTo16BitPCM(float32Data, audioCtx.sampleRate);
        
        // Send base64 PCM chunk to WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64Audio = arrayBufferToBase64(pcm16.buffer);
          wsRef.current.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: "audio/pcm;rate=16000",
                  data: base64Audio
                }
              ]
            }
          }));
        }
      };

      source.connect(audioWorkletNode);
      audioWorkletNode.connect(audioCtx.destination);
    } catch (e) {
      console.error("Audio recording setup failed:", e);
    }
  };

  // Video streaming at 1 frame per second (1 FPS)
  const startVideoStreaming = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 384; // Good balance of resolution and bandwidth
    canvas.height = 384;
    const ctx = canvas.getContext("2d");

    videoIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && ctx) {
        // Draw centered square frame from video
        const vWidth = videoRef.current.videoWidth;
        const vHeight = videoRef.current.videoHeight;
        
        if (vWidth > 0 && vHeight > 0) {
          const size = Math.min(vWidth, vHeight);
          const xOffset = (vWidth - size) / 2;
          const yOffset = (vHeight - size) / 2;

          ctx.drawImage(
            videoRef.current,
            xOffset,
            yOffset,
            size,
            size,
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Get jpeg as base64
          const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
          const base64Jpeg = dataUrl.split(",")[1];

          // Send image chunk
          wsRef.current.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: "image/jpeg",
                  data: base64Jpeg
                }
              ]
            }
          }));
        }
      }
    }, 1000);
  };

  const handleToggleCall = () => {
    if (active) {
      stopAll();
    } else {
      startLiveSession(false);
    }
  };

  const handleToggleVideoCall = () => {
    if (active) {
      stopAll();
    } else {
      startLiveSession(true);
    }
  };

  const toggleMute = () => {
    setMuted((m) => !m);
  };

  // Render wave bars dynamically based on status
  const renderWaveform = () => {
    const barCount = 11;
    const items = Array.from({ length: barCount });

    let animationClass = "h-4 bg-muted-foreground/30";
    if (status === "connecting") {
      animationClass = "h-6 bg-primary/40 animate-pulse";
    } else if (status === "listening") {
      animationClass = "bg-primary/70 animate-bounce duration-500";
    } else if (status === "speaking") {
      animationClass = "bg-emerald-500 animate-bounce";
    }

    return (
      <div className="flex items-center gap-[4px] justify-center h-24">
        {items.map((_, i) => {
          const delay = `${i * 75}ms`;
          const height = status === "speaking" 
            ? `${10 + Math.sin(i) * 25 + Math.random() * 15}px`
            : status === "listening"
            ? `${8 + Math.cos(i) * 12 + Math.random() * 8}px`
            : "8px";

          return (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-all duration-300 ${animationClass}`}
              style={{
                height: active ? height : "8px",
                animationDelay: active ? delay : undefined,
                opacity: muted ? 0.15 : 0.8
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <PhoneShell>
      <div className="px-6 pt-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">AI Assistant</p>
              <h1 className="display text-5xl mt-3 leading-[0.95] tracking-tight">
                How can I<br />help you?
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTempVoice(selectedVoice);
                  setTempLanguage(selectedLanguage);
                  setShowVoiceSettings(true);
                }}
                className="h-10 w-10 rounded-full border border-border/70 bg-white grid place-items-center shadow-sm text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                aria-label="Voice & Language Settings"
              >
                <Settings className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
          
          <p className="mt-5 text-base text-muted-foreground leading-snug max-w-[16rem]">
            Speak naturally. I'll listen, check pond sensors, and help you list harvest.
          </p>
        </div>

        {/* Center UI display */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
          {videoOn && active ? (
            <div className="relative w-full max-w-[240px] aspect-[3/4] rounded-3xl overflow-hidden border border-border/70 shadow-[0_10px_40px_-8px_rgba(15,23,42,0.15)] bg-black">
              <video
                ref={videoRef}
                className="h-full w-full object-cover transform -scale-x-100"
                muted
                playsInline
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-red-500/80 px-2 py-1 text-[9px] font-semibold text-white tracking-wider uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Live Camera
              </div>
            </div>
          ) : (
            <div className="relative grid place-items-center">
              {[220, 160, 110].map((s) => (
                <div
                  key={s}
                  className={`absolute rounded-full border border-border/50 transition-all duration-700 ${
                    status === "speaking" ? "border-emerald-300/40 scale-105" : ""
                  } ${status === "listening" ? "border-primary/20 scale-102" : ""}`}
                  style={{ width: s, height: s }}
                />
              ))}
              <div className="relative h-20 w-20 rounded-full bg-white shadow-[0_10px_35px_-8px_rgba(15,23,42,0.1)] grid place-items-center border border-border/60">
                <div className="h-10 w-10 rounded-full bg-primary/5 grid place-items-center text-primary">
                  <Mic className="h-5 w-5" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="text-sm font-semibold tracking-tight text-foreground capitalize">
              {status === "idle" && "Tap Call to Start"}
              {status === "connecting" && "Initializing Connection..."}
              {status === "listening" && "Listening..."}
              {status === "speaking" && "Speaking..."}
            </p>
            {renderWaveform()}
          </div>

          {error && (
            <div className="absolute bottom-2 left-0 right-0 mx-auto max-w-[260px] bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 flex items-start gap-2 text-rose-700 text-xs">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <p className="leading-tight">{error}</p>
            </div>
          )}
        </div>

        {/* Bottom controller */}
        <div className="mb-4 flex items-center justify-between px-2 pb-2">
          <ActionButton
            active={videoOn && active}
            onClick={active && videoOn ? stopAll : handleToggleVideoCall}
            icon={
              videoOn && active ? (
                <VideoOff className="h-5 w-5" strokeWidth={1.6} />
              ) : (
                <Video className="h-5 w-5" strokeWidth={1.6} />
              )
            }
            label={videoOn && active ? "Stop Video" : "Video Call"}
          />

          <div className="flex flex-col items-center gap-2">
            <button
              aria-label={active ? "Stop session" : "Start session"}
              onClick={handleToggleCall}
              className={`h-16 w-16 rounded-full text-white grid place-items-center shadow-xl active:scale-95 transition-all ${
                active ? "bg-rose-500 hover:bg-rose-600" : "bg-primary hover:bg-primary/95"
              }`}
            >
              {active ? (
                <Square className="h-5 w-5" fill="currentColor" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
            <span className="text-xs text-muted-foreground font-medium">
              {active ? "Tap to end" : "Tap to call"}
            </span>
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

        {/* Voice and Language Settings Modal */}
        {showVoiceSettings && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-50 animate-fade-in">
            <div className="w-full bg-white rounded-t-[32px] p-6 shadow-2xl pb-8 animate-slide-up">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary">
                    <Settings className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">Voice Settings</h3>
                </div>
                <button
                  onClick={() => setShowVoiceSettings(false)}
                  className="h-8 w-8 rounded-full bg-muted hover:bg-muted/80 grid place-items-center text-muted-foreground"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Voice</label>
                  <select
                    value={tempVoice}
                    onChange={(e) => setTempVoice(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="Aoede">Aoede (Realistic Female)</option>
                    <option value={DEFAULT_VOICE_ID}>Google Chirp 3 (Custom Voice)</option>
                    <option value="Puck">Puck (Prebuilt)</option>
                    <option value="Charon">Charon (Prebuilt)</option>
                    <option value="Kore">Kore (Prebuilt)</option>
                    <option value="Fenrir">Fenrir (Prebuilt)</option>
                    <option value="Zephyr">Zephyr (Prebuilt)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Speech Language</label>
                  <select
                    value={tempLanguage}
                    onChange={(e) => setTempLanguage(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="fr-FR">French (France)</option>
                    <option value="es-ES">Spanish (Spain)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setTempVoice("Aoede");
                    setTempLanguage("en-US");
                  }}
                  className="flex-1 py-3 rounded-full border border-border text-sm font-medium text-muted-foreground active:scale-95 transition-all"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={handleSaveVoiceSettings}
                  className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-md active:scale-95 transition-all"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PhoneShell>
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
        className={`h-12 w-12 rounded-full grid place-items-center shadow-sm border transition-all active:scale-95 ${
          active
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-white border-border/70 text-muted-foreground"
        }`}
      >
        {icon}
      </button>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
