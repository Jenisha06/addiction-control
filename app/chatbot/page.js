"use client";

import { useState, useRef, useEffect , useMemo } from "react";
import { Mic, Send, Loader2, Pause, Play, MicOff, MessageSquare, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../components/BottomNav";


function Robot3D({ speaking, listening, idle }) {
  const isTalking = speaking && !idle;

  return (
    <svg
      viewBox="0 0 200 260"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 20px 60px rgba(161,90,43,0.5))" }}
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8956c" />
          <stop offset="50%" stopColor="#a0522d" />
          <stop offset="100%" stopColor="#6b3a1f" />
        </linearGradient>
        <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a076" />
          <stop offset="50%" stopColor="#b5651d" />
          <stop offset="100%" stopColor="#7a3b10" />
        </linearGradient>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd580" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3d1f0a" />
          <stop offset="100%" stopColor="#1a0d04" />
        </linearGradient>
        <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Antenna */}
      <rect x="97" y="4" width="6" height="22" rx="3" fill="#c8956c" />
      <circle cx="100" cy="4" r="6" fill="#f59e0b" filter="url(#glow)">
        <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Neck */}
      <rect x="85" y="98" width="30" height="16" rx="4" fill="#7a3b10" />
      <rect x="89" y="100" width="22" height="4" rx="2" fill="#c8956c" opacity="0.4" />

      {/* Head */}
      <rect x="40" y="26" width="120" height="76" rx="22" fill="url(#headGrad)" />
      <rect x="44" y="28" width="112" height="36" rx="18" fill="url(#shine)" />
      <circle cx="42" cy="64" r="7" fill="#8b4513" />
      <circle cx="42" cy="64" r="4" fill="#c8956c" />
      <circle cx="158" cy="64" r="7" fill="#8b4513" />
      <circle cx="158" cy="64" r="4" fill="#c8956c" />

      {/* Eyes / Visor */}
      <rect x="52" y="38" width="96" height="44" rx="12" fill="url(#panelGrad)" />
      <ellipse cx="78" cy="60" rx="16" ry="16" fill="#1a0a02" />
      <ellipse cx="78" cy="60" rx="11" ry="11" fill="url(#eyeGlow)" filter="url(#glow)">
        {listening && <animate attributeName="ry" values="11;14;11" dur="0.4s" repeatCount="indefinite" />}
      </ellipse>
      <circle cx="78" cy="60" r="5" fill="white" opacity="0.9">
        {isTalking && <animate attributeName="cy" values="60;57;60" dur="0.3s" repeatCount="indefinite" />}
      </circle>
      <circle cx="82" cy="55" r="2" fill="white" opacity="0.6" />
      <ellipse cx="122" cy="60" rx="16" ry="16" fill="#1a0a02" />
      <ellipse cx="122" cy="60" rx="11" ry="11" fill="url(#eyeGlow)" filter="url(#glow)">
        {listening && <animate attributeName="ry" values="11;14;11" dur="0.4s" repeatCount="indefinite" />}
      </ellipse>
      <circle cx="122" cy="60" r="5" fill="white" opacity="0.9">
        {isTalking && <animate attributeName="cy" values="60;57;60" dur="0.3s" repeatCount="indefinite" />}
      </circle>
      <circle cx="126" cy="55" r="2" fill="white" opacity="0.6" />

      {/* Mouth */}
      <rect x="72" y="84" width="56" height="12" rx="6" fill="#1a0a02" />
      {isTalking ? (
        <>
          <rect x="74" y="86" width="8" height="8" rx="2" fill="#f59e0b" opacity="0.9">
            <animate attributeName="height" values="8;2;8" dur="0.2s" repeatCount="indefinite" />
            <animate attributeName="y" values="86;90;86" dur="0.2s" repeatCount="indefinite" />
          </rect>
          <rect x="86" y="86" width="8" height="8" rx="2" fill="#f59e0b" opacity="0.9">
            <animate attributeName="height" values="2;8;2" dur="0.2s" repeatCount="indefinite" />
            <animate attributeName="y" values="90;86;90" dur="0.2s" repeatCount="indefinite" />
          </rect>
          <rect x="98" y="86" width="8" height="8" rx="2" fill="#f59e0b" opacity="0.9">
            <animate attributeName="height" values="8;3;8" dur="0.25s" repeatCount="indefinite" />
            <animate attributeName="y" values="86;89;86" dur="0.25s" repeatCount="indefinite" />
          </rect>
          <rect x="110" y="86" width="8" height="8" rx="2" fill="#f59e0b" opacity="0.9">
            <animate attributeName="height" values="3;8;3" dur="0.18s" repeatCount="indefinite" />
            <animate attributeName="y" values="89;86;89" dur="0.18s" repeatCount="indefinite" />
          </rect>
        </>
      ) : (
        <rect x="76" y="89" width="48" height="4" rx="2" fill="#f59e0b" opacity="0.6" />
      )}

      {/* Body */}
      <rect x="45" y="114" width="110" height="100" rx="20" fill="url(#bodyGrad)" />
      <rect x="48" y="116" width="104" height="44" rx="16" fill="url(#shine)" />
      <rect x="60" y="128" width="80" height="56" rx="12" fill="url(#panelGrad)" />

      {/* Panel LEDs */}
      <circle cx="74" cy="142" r="5" fill="#f59e0b" opacity="0.9" filter="url(#glow)">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="142" r="5" fill="#ef4444" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.1s" repeatCount="indefinite" />
      </circle>
      <circle cx="106" cy="142" r="5" fill="#22c55e" opacity="0.8">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.9s" repeatCount="indefinite" />
      </circle>
      <circle cx="122" cy="142" r="5" fill="#f59e0b" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.3s" repeatCount="indefinite" />
      </circle>

      {/* Waveform bars */}
      {[68, 76, 84, 92, 100, 108, 116, 124, 132].map((x, i) => (
        <rect key={i} x={x} y={isTalking ? undefined : "158"} width="5" rx="2.5"
          fill="#f59e0b" opacity={isTalking ? "0.9" : "0.3"}
          height={isTalking ? undefined : "8"}
        >
          {isTalking && (
            <animate
              attributeName="height"
              values={`${4 + (i % 3) * 6};${10 + (i % 5) * 5};${4 + (i % 3) * 6}`}
              dur={`${0.2 + i * 0.05}s`}
              repeatCount="indefinite"
            />
          )}
          {isTalking && (
            <animate
              attributeName="y"
              values={`${170 - (4 + (i % 3) * 6)};${170 - (10 + (i % 5) * 5)};${170 - (4 + (i % 3) * 6)}`}
              dur={`${0.2 + i * 0.05}s`}
              repeatCount="indefinite"
            />
          )}
          {!isTalking && <set attributeName="y" to="158" />}
        </rect>
      ))}

      {/* Arms */}
      <rect x="14" y="118" width="28" height="72" rx="14" fill="url(#bodyGrad)" />
      <circle cx="28" cy="196" r="13" fill="#7a3b10" />
      <circle cx="28" cy="196" r="8" fill="#c8956c" />
      <rect x="158" y="118" width="28" height="72" rx="14" fill="url(#bodyGrad)">
        {isTalking && (
          <animateTransform attributeName="transform" type="rotate"
            values="0 172 118;-8 172 118;0 172 118" dur="0.6s" repeatCount="indefinite" />
        )}
      </rect>
      <circle cx="172" cy="196" r="13" fill="#7a3b10">
        {isTalking && (
          <animateTransform attributeName="transform" type="rotate"
            values="0 172 196;-8 172 196;0 172 196" dur="0.6s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="172" cy="196" r="8" fill="#c8956c" />

      {/* Legs */}
      <rect x="66" y="212" width="28" height="44" rx="12" fill="#7a3b10" />
      <rect x="106" y="212" width="28" height="44" rx="12" fill="#7a3b10" />
      <rect x="60" y="244" width="40" height="16" rx="8" fill="#5a2d0c" />
      <rect x="100" y="244" width="40" height="16" rx="8" fill="#5a2d0c" />
    </svg>
  );
}


function MiniAvatar({ speaking }) {
  return (
    <div className="w-9 h-9 flex-shrink-0">
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="miniHead" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4a076" /><stop offset="100%" stopColor="#7a3b10" />
          </linearGradient>
          <radialGradient id="miniEye" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd580" /><stop offset="100%" stopColor="#b45309" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="4" y="4" width="2" height="10" rx="1" fill="#c8956c" transform="translate(37,0)" />
        <circle cx="40" cy="4" r="3" fill="#f59e0b">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <rect x="10" y="14" width="60" height="50" rx="14" fill="url(#miniHead)" />
        <rect x="14" y="22" width="52" height="28" rx="8" fill="#1a0a02" />
        <ellipse cx="30" cy="36" rx="8" ry="8" fill="url(#miniEye)" />
        <circle cx="30" cy="36" r="4" fill="white" opacity="0.9" />
        <ellipse cx="50" cy="36" rx="8" ry="8" fill="url(#miniEye)" />
        <circle cx="50" cy="36" r="4" fill="white" opacity="0.9" />
        {speaking ? (
          <rect x="28" y="52" width="24" height="8" rx="4" fill="#1a0a02">
            <animate attributeName="height" values="4;10;4" dur="0.25s" repeatCount="indefinite" />
            <animate attributeName="y" values="54;50;54" dur="0.25s" repeatCount="indefinite" />
          </rect>
        ) : (
          <path d="M28 56 Q40 62 52 56" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </div>
  );
}


function SoundWave({ active }) {
  const bars = Array.from({ length: 20 });
  return (
    <div className="flex items-center gap-1 h-16">
      {bars.map((_, i) => (
        <motion.div key={i} className="rounded-full"
          style={{ width: 4, backgroundColor: "#f59e0b" }}
          animate={active
            ? { height: [8, Math.random() * 48 + 8, 8], opacity: [0.4, 1, 0.4] }
            : { height: 4, opacity: 0.2 }}
          transition={active
            ? { duration: 0.4 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }
            : { duration: 0.3 }}
        />
      ))}
    </div>
  );
}


export default function ChatbotPage() {
  const [mode,         setMode]         = useState(null);
  const [messages,     setMessages]     = useState([
    { role: "assistant", text: "Hail, Seeker 👋 I'm NOVA, your recovery companion. What weighs on your spirit today?" },
  ]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [listening,    setListening]    = useState(false);
  const [speaking,     setSpeaking]     = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);
  const [talkStatus,   setTalkStatus]   = useState("idle");

  const bottomRef       = useRef(null);
  const recognitionRef  = useRef(null);
  const utteranceRef    = useRef(null);
  const modeRef         = useRef(mode);
  const talkHistoryRef  = useRef([]);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* ── TTS ── */
  function speak(text, onDone) {
    if (!("speechSynthesis" in window)) { onDone?.(); return; }
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = "en-US";
    utterance.rate  = 1;
    utterance.pitch = 1.1;
    utterance.onstart = () => { setSpeaking(true); setSpeechPaused(false); if (modeRef.current === "talk") setTalkStatus("speaking"); };
    utterance.onend   = () => { setSpeaking(false); setSpeechPaused(false); onDone?.(); };
    utterance.onerror = () => { setSpeaking(false); onDone?.(); };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function toggleSpeech() {
    if (!utteranceRef.current) return;
    if (speechPaused) { window.speechSynthesis.resume(); setSpeechPaused(false); }
    else              { window.speechSynthesis.pause();  setSpeechPaused(true);  }
  }

  /* ── STT ── */
  function startListening(onResult) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported"); return; }
    const recognition = new SR();
    recognition.lang             = "en-US";
    recognition.interimResults   = false;
    recognition.continuous       = false;
    recognitionRef.current       = recognition;
    recognition.onstart  = () => { setListening(true); setTalkStatus("listening"); };
    recognition.onend    = () => { setListening(false); };
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      onResult(transcript);
    };
    recognition.start();
  }

  /* ── Chat send ── */
  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are a supportive addiction recovery chatbot. Be empathetic, warm, non-judgmental, and practical.\n\nConversation so far:\n${messages.map(m => `${m.role}: ${m.text}`).join("\n")}\n\nUser: ${input}\nAssistant:`,
        }),
      });
      const data = await res.json();
      const assistantText = data.text || "I'm here with you 💙";
      setMessages(prev => [...prev, { role: "assistant", text: assistantText }]);
      speak(assistantText);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Try again ❤️" }]);
    }
    setLoading(false);
  }

  /* ── Talk mode cycle ── */
  async function handleTalkCycle() {
    if (talkStatus === "speaking") {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      setTalkStatus("idle");
      return;
    }
    if (talkStatus !== "idle") return;

    startListening(async (transcript) => {
      if (!transcript.trim()) { setTalkStatus("idle"); return; }
      talkHistoryRef.current = [...talkHistoryRef.current, { role: "user", text: transcript }];
      setTalkStatus("thinking");
      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `You are a supportive addiction recovery chatbot. Be empathetic, warm, non-judgmental, and practical. Keep voice responses under 3 sentences.\n\nConversation so far:\n${talkHistoryRef.current.map(m => `${m.role}: ${m.text}`).join("\n")}\n\nAssistant:`,
          }),
        });
        const data = await res.json();
        const assistantText = data.text || "I'm here with you.";
        talkHistoryRef.current = [...talkHistoryRef.current, { role: "assistant", text: assistantText }];
        speak(assistantText, () => setTalkStatus("idle"));
      } catch {
        setTalkStatus("idle");
      }
    });
  }

const particles = useMemo(() => {
  return Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    color: i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#c8956c" : "#d97706",
    duration: 5 + Math.random() * 5,
    delay: Math.random() * 8,
  }));
}, []);

  return (
    <div  className="min-h-screen w-full flex flex-col overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #1a0d04 0%, #2d1507 35%, #3d1f0a 60%, #1a0a02 100%)", fontFamily: "'Georgia', 'Palatino Linotype', serif" }}>

      {/* Ambient particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
  <motion.div
    key={p.id}
    className="absolute rounded-full"
    style={{
      width: p.size,
      height: p.size,
      left: p.left,
      top: p.top,
      backgroundColor: p.color,
    }}
    animate={{ opacity: [0, 0.6, 0], y: [0, -80, -160], scale: [0.5, 1, 0] }}
    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
  />
))}
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 300, height: 300, background: "radial-gradient(circle, rgba(197,133,80,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(180,83,9,0.1) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(200,149,108,0.15)" }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 38, height: 38 }}>
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <circle cx="20" cy="20" r="18" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
              <circle cx="20" cy="20" r="10" fill="#b45309" opacity="0.8" />
              <circle cx="20" cy="20" r="5" fill="#fcd34d" />
            </svg>
          </div>
          <div>
            <p style={{ color: "#f59e0b", fontSize: 18, fontWeight: 700, letterSpacing: "0.05em" }}>NOVA</p>
            <p style={{ color: "#c8956c", fontSize: 11, letterSpacing: "0.15em" }}>RECOVERY COMPANION</p>
          </div>
        </div>
        {mode && (
          <button onClick={() => { setMode(null); setSpeaking(false); setTalkStatus("idle"); window.speechSynthesis?.cancel(); }}
            style={{ color: "#c8956c", fontSize: 13, letterSpacing: "0.1em", border: "1px solid rgba(200,149,108,0.3)", padding: "6px 16px", borderRadius: 20, background: "none", cursor: "pointer" }}>
            ← BACK
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">

        {/* ── MODE SELECTION ── */}
        {!mode && (
          <motion.div key="landing"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">

            <motion.div style={{ width: 200, height: 260 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
              <Robot3D speaking={false} listening={false} idle />
            </motion.div>

            <motion.div className="text-center mt-6 mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <h1 style={{ color: "#fcd34d", fontSize: 36, fontWeight: 700, letterSpacing: "0.03em", lineHeight: 1.1 }}>
                How may I help you<br /><span style={{ color: "#f59e0b" }}>today?</span>
              </h1>
              <p style={{ color: "#c8956c", marginTop: 10, fontSize: 15, letterSpacing: "0.08em" }}>CHOOSE YOUR EXPERIENCE</p>
            </motion.div>

            <div className="flex gap-6 w-full max-w-sm">
              {/* Chat card */}
              <motion.button whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                onClick={() => setMode("chat")}
                className="flex-1 flex flex-col items-center gap-3 py-8 rounded-3xl relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(180,83,9,0.35), rgba(120,50,5,0.5))", border: "1px solid rgba(245,158,11,0.3)", backdropFilter: "blur(10px)", cursor: "pointer" }}>
                <div style={{ width: 52, height: 52, background: "rgba(245,158,11,0.2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MessageSquare size={26} color="#f59e0b" />
                </div>
                <div>
                  <p style={{ color: "#fcd34d", fontWeight: 700, fontSize: 16, letterSpacing: "0.05em" }}>CHAT</p>
                  <p style={{ color: "#c8956c", fontSize: 11, marginTop: 2 }}>Type & read</p>
                </div>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 70%)" }} />
              </motion.button>

              {/* Talk card */}
              <motion.button whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                onClick={() => setMode("talk")}
                className="flex-1 flex flex-col items-center gap-3 py-8 rounded-3xl relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.35), rgba(180,83,9,0.5))", border: "1px solid rgba(245,158,11,0.5)", backdropFilter: "blur(10px)", cursor: "pointer" }}>
                <div style={{ width: 52, height: 52, background: "rgba(245,158,11,0.25)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Radio size={26} color="#f59e0b" />
                </div>
                <div>
                  <p style={{ color: "#fcd34d", fontWeight: 700, fontSize: 16, letterSpacing: "0.05em" }}>TALK</p>
                  <p style={{ color: "#c8956c", fontSize: 11, marginTop: 2 }}>Voice mode</p>
                </div>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.18) 0%, transparent 70%)" }} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── CHAT MODE ── */}
        {mode === "chat" && (
          <motion.div key="chat"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col relative z-10 max-w-2xl mx-auto w-full px-4">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(200,149,108,0.2) transparent" }}>
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  className={`flex items-end gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && <MiniAvatar speaking={speaking && i === messages.length - 1} />}
                  <div className="max-w-xs px-5 py-3 rounded-2xl text-sm leading-relaxed"
                    style={msg.role === "user"
                      ? { background: "linear-gradient(135deg, #b45309, #92400e)", color: "#fef3c7", borderBottomRightRadius: 4 }
                      : { background: "rgba(61,31,10,0.8)", border: "1px solid rgba(200,149,108,0.2)", color: "#fde68a", borderBottomLeftRadius: 4, backdropFilter: "blur(8px)" }}>
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #c8956c, #7a3b10)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 16 }}>🙂</span>
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-center gap-3">
                  <MiniAvatar speaking={false} />
                  <div style={{ background: "rgba(61,31,10,0.8)", border: "1px solid rgba(200,149,108,0.2)", padding: "12px 18px", borderRadius: 16, backdropFilter: "blur(8px)" }} className="flex gap-2 items-center">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <motion.div key={i} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f59e0b" }}
                        animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, delay: d, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="py-4">
              <div className="flex gap-3 items-center px-4 py-3 rounded-2xl"
                style={{ background: "rgba(61,31,10,0.7)", border: "1px solid rgba(200,149,108,0.25)", backdropFilter: "blur(12px)" }}>
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message…"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "#fde68a", caretColor: "#f59e0b" }} />
                <button onClick={() => startListening(t => setInput(t))}
                  style={{ padding: 8, borderRadius: 12, background: listening ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", cursor: "pointer" }}>
                  {listening ? <MicOff size={16} color="#ef4444" /> : <Mic size={16} color="#f59e0b" />}
                </button>
                {speaking && (
                  <button onClick={toggleSpeech}
                    style={{ padding: 8, borderRadius: 12, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", cursor: "pointer" }}>
                    {speechPaused ? <Play size={16} color="#f59e0b" /> : <Pause size={16} color="#f59e0b" />}
                  </button>
                )}
                <button onClick={sendMessage} disabled={loading}
                  style={{ padding: 8, borderRadius: 12, background: loading ? "rgba(180,83,9,0.3)" : "linear-gradient(135deg, #d97706, #92400e)", border: "none", cursor: loading ? "default" : "pointer" }}>
                  {loading ? <Loader2 size={16} color="#fcd34d" className="animate-spin" /> : <Send size={16} color="white" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TALK MODE ── */}
        {mode === "talk" && (
          <motion.div key="talk"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center relative z-10 px-6"
            style={{ gap: 28 }}>

            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Ripple rings */}
              {(talkStatus === "listening" || talkStatus === "speaking") && [1, 2, 3].map((n) => (
                <motion.div key={n}
                  style={{
                    position: "absolute", borderRadius: "50%", pointerEvents: "none",
                    border: `2px solid ${talkStatus === "listening" ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.4)"}`,
                    width: 220 + n * 70, height: 220 + n * 70,
                  }}
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.6, delay: n * 0.4, repeat: Infinity, ease: "easeOut" }}
                />
              ))}

              {/* Robot — tap to speak */}
              <motion.button onClick={handleTalkCycle}
                style={{ width: 240, height: 312, cursor: talkStatus === "thinking" ? "default" : "pointer", background: "none", border: "none", padding: 0, position: "relative", zIndex: 2 }}
                animate={
                  talkStatus === "speaking"  ? { y: [0, -8, 0] } :
                  talkStatus === "listening" ? { scale: [1, 1.04, 1] } :
                  { y: [0, -12, 0] }
                }
                transition={
                  talkStatus === "speaking"  ? { duration: 0.45, repeat: Infinity } :
                  talkStatus === "listening" ? { duration: 0.35, repeat: Infinity } :
                  { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }>
                <Robot3D speaking={talkStatus === "speaking"} listening={talkStatus === "listening"} idle={talkStatus === "idle"} />
              </motion.button>
            </div>

            <SoundWave active={talkStatus === "speaking" || talkStatus === "listening"} />

            {/* Status pill */}
            <motion.div key={talkStatus}
              initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "10px 28px", borderRadius: 30, backdropFilter: "blur(12px)",
                border: `1px solid ${
                  talkStatus === "listening" ? "rgba(239,68,68,0.5)" :
                  talkStatus === "speaking"  ? "rgba(245,158,11,0.6)" :
                  talkStatus === "thinking"  ? "rgba(200,149,108,0.4)" :
                                              "rgba(200,149,108,0.25)"
                }`,
                background:
                  talkStatus === "listening" ? "rgba(80,10,10,0.6)" :
                  talkStatus === "speaking"  ? "rgba(60,30,5,0.7)"  :
                  talkStatus === "thinking"  ? "rgba(45,20,5,0.6)"  :
                                              "rgba(30,12,3,0.5)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
              {talkStatus === "thinking" && (
                <Loader2 size={15} color="#c8956c" className="animate-spin" />
              )}
              <p style={{
                fontSize: 13, letterSpacing: "0.18em", fontWeight: 700,
                color:
                  talkStatus === "listening" ? "#ef4444" :
                  talkStatus === "speaking"  ? "#f59e0b" :
                  talkStatus === "thinking"  ? "#c8956c" : "#8a6040",
              }}>
                {talkStatus === "idle"      && "TAP NOVA TO SPEAK"}
                {talkStatus === "listening" && "● LISTENING"}
                {talkStatus === "thinking"  && "PROCESSING"}
                {talkStatus === "speaking"  && "NOVA IS SPEAKING"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(200,149,108,0.25); border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <BottomNav/>
    </div>
  );
}