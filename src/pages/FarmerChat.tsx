import { useState, useEffect, useRef } from "react";
import { DetailShell } from "@/components/DetailShell";
import { Send, Users, Check, Circle } from "lucide-react";

type Message = {
  id: string;
  sender: string;
  location: string;
  text: string;
  time: string;
  isMe: boolean;
};

const INITIAL_MESSAGES: Message[] = [
  { id: "1", sender: "Kofi Annan", location: "Kumasi", text: "My tilapia stock is growing so fast this season! Average weight is already 250g.", time: "10:15 AM", isMe: false },
  { id: "2", sender: "Abena Selorm", location: "Volta Lake", text: "Are you guys reducing feeding? A storm warning popped up on my notifications.", time: "10:20 AM", isMe: false },
  { id: "3", sender: "Kwame Mensah", location: "Koforidua", text: "Yes, Abena. AI told me to cut feed in half for today. Don't want unconsumed feed spoiling the pond water.", time: "10:22 AM", isMe: false },
];

export default function FarmerChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Increment usage prompt count
    const currentPrompts = parseInt(localStorage.getItem("usage_prompts_count") || "0", 10);
    localStorage.setItem("usage_prompts_count", String(currentPrompts + 1));
    window.dispatchEvent(new Event("usage_updated"));

    const newMsg: Message = {
      id: Math.random().toString(),
      sender: "Emmanuel (You)",
      location: "Volta Lake",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate another farmer replying after a short delay
    setTimeout(() => {
      const replies = [
        "Welcome to the discussion, Emmanuel! How are your Volta Lake ponds doing today?",
        "Good advice, Emmanuel. Let's make sure we group buy the feed next week so we get the 15% discount.",
        "Exactly! Anyone here stocking Nile Tilapia or Catfish?",
        "That's correct. Good to have another Volta farmer in the chat."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const replyMsg: Message = {
        id: Math.random().toString(),
        sender: Math.random() > 0.5 ? "Yaw Boateng" : "Esi Darko",
        location: Math.random() > 0.5 ? "Sunyani" : "Accra",
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: false,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1500);
  };

  return (
    <DetailShell title="Farmer Forum" subtitle="Live discussion with fish growers across Ghana.">
      <div className="flex flex-col h-[52vh] bg-slate-50 rounded-2xl border border-border/80 overflow-hidden relative shadow-inner">
        {/* Active farmers status bar */}
        <div className="bg-white px-4 py-2 border-b border-border/60 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-slate-700">Ghana Growers Channel</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">342 online</span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.isMe ? "items-end" : "items-start"}`}>
              <div className="flex items-baseline gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-bold text-slate-600">{m.sender}</span>
                <span className="text-[8px] text-muted-foreground font-semibold bg-slate-200/60 px-1.5 py-0.5 rounded-full">{m.location}</span>
              </div>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                m.isMe 
                  ? "bg-primary text-primary-foreground rounded-tr-none font-medium" 
                  : "bg-white text-slate-800 border border-slate-200/50 rounded-tl-none leading-relaxed"
              }`}>
                <p>{m.text}</p>
                <div className="text-[9px] text-right mt-1 opacity-70">
                  {m.time}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-border/60 flex gap-2 items-center shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Share feed updates or ask questions..."
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary font-medium"
          />
          <button
            onClick={handleSend}
            className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </div>
    </DetailShell>
  );
}
