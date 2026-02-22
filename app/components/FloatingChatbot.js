"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Mic, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hey 👋 I’m here to help. What’s on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  /* Scroll to bottom when new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===========================
     Text-to-Speech
  =========================== */
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function toggleSpeech() {
    if (!utteranceRef.current) return;
    if (speechPaused) {
      window.speechSynthesis.resume();
      setSpeechPaused(false);
    } else {
      window.speechSynthesis.pause();
      setSpeechPaused(true);
    }
  }

  /* ===========================
     Speech-to-Text
  =========================== */
  function startListening() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.start();
  }

  /* ===========================
     Send Message
  =========================== */
  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are a supportive addiction recovery chatbot.
Be empathetic, warm, non-judgmental, and practical.

Conversation so far:
${messages.map((m) => `${m.role}: ${m.text}`).join("\n")}

User: ${input}
Assistant:`,
        }),
      });

      const data = await res.json();
      const assistantText = data.text || "I’m here with you 💙";

      setMessages((prev) => [...prev, { role: "assistant", text: assistantText }]);
      speak(assistantText); // 🗣 Speak AI response
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Try again ❤️" },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:scale-105 transition"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] h-[500px] bg-white rounded-[32px] shadow-2xl flex flex-col border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-black text-slate-800">AI Support Chat 💬</h3>
              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm flex items-center gap-1 ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white ml-auto rounded-tr-none"
                      : "bg-slate-100 text-slate-700 rounded-tl-none"
                  }`}
                >
                  <span>{msg.role === "user" ? "🙂" : "🤖"}</span>
                  {msg.text}
                </div>
              ))}

              {/* Typing dots animation */}
              {loading && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-400"></span>
                  </span>
                  Thinking…
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type or speak…"
                className="flex-1 border rounded-xl px-4 py-2 outline-none"
              />

              {/* Voice Button */}
              <button
                onClick={startListening}
                className={`p-2 rounded-xl flex items-center justify-center ${
                  listening ? "bg-red-500 text-white animate-pulse" : "bg-green-500 text-white"
                }`}
                title={listening ? "Listening..." : "Start voice input"}
              >
                <Mic size={18} />
              </button>

              {/* Pause/Resume AI Voice */}
              {speaking && (
                <button
                  onClick={toggleSpeech}
                  className="p-2 rounded-xl bg-yellow-500 text-white"
                  title={speechPaused ? "Resume AI Voice" : "Pause AI Voice"}
                >
                  {speechPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>
              )}

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-emerald-600 p-2 rounded-xl text-white flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}