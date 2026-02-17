'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, ShieldCheck, HelpCircle } from 'lucide-react';

export default function AICompanion() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hi! I'm your Control Companion. I'm here 24/7 to listen and support you. How are you feeling right now?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (customText) => {
    const messageText = customText || input;
    if (!messageText.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(messageText),
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  // ==============================
  // 🔐 SAFETY + RESPONSE ENGINE
  // ==============================

  const getAIResponse = (text) => {
    const lowerText = text.toLowerCase();

    // 🚨 Crisis Detection
    const crisisPhrases = [
      'suicide',
      'kill myself',
      'want to die',
      'end my life',
      'hurt myself',
      'i cant go on',
      "i can't go on",
      'no reason to live',
    ];

    const isCrisis = crisisPhrases.some((phrase) =>
      lowerText.includes(phrase)
    );

    if (isCrisis) {
      return `I'm really glad you told me. It sounds like you're in a lot of pain right now.

You deserve immediate human support.

If you're in the U.S., call or text 988 right now.
If you're outside the U.S., please contact your local crisis hotline.
If you're in immediate danger, call emergency services.

You are not alone in this moment. I'm here with you.`;
    }

    // 🚨 Relapse Emergency
    const relapseEmergencyPhrases = [
      "i'm going to drink",
      'about to relapse',
      'buying alcohol',
      'i cant stop myself',
      "i can't stop myself",
    ];

    const isRelapseEmergency = relapseEmergencyPhrases.some((phrase) =>
      lowerText.includes(phrase)
    );

    if (isRelapseEmergency) {
      return `Pause with me for 10 seconds.

Take one slow breath in.
And one slow breath out.

This urge will peak and pass. You do not have to act on it.

Would you like:
1️⃣ A 60-second grounding exercise  
2️⃣ A replacement habit suggestion  
3️⃣ A reminder of why you started  

Tell me the number.`;
    }

    // 🟡 Craving Detection
    if (
      lowerText.includes('drink') ||
      lowerText.includes('urge') ||
      lowerText.includes('craving')
    ) {
      return `I hear you. Cravings are powerful — but they are temporary.

Let's interrupt it right now.

Would you like:
• A breathing reset  
• A quick distraction task  
• A motivational reminder  

Pick one.`;
    }

    // 🟡 Emotional Distress
    if (
      lowerText.includes('sad') ||
      lowerText.includes('bad') ||
      lowerText.includes('stress') ||
      lowerText.includes('anxious')
    ) {
      return `I'm really sorry you're feeling this way.

This feeling is temporary, even if it doesn't feel like it.

Do you want to:
• Talk through what's happening  
• Log it in your CBT journal  
• Do a quick calming exercise  

I'm here with you.`;
    }

    // Default
    return `Thank you for sharing that with me.

You're showing up for yourself just by typing that.

What’s going on right now?`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto overflow-hidden">
      
      {/* Header */}
      <header className="p-6 bg-blue-50 flex items-center gap-4 border-b border-blue-100">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Sparkles size={28} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full" />
        </div>
        <div>
          <h1 className="font-black text-slate-900">Control Companion</h1>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck size={12} />
            Support AI Online
          </p>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'flex-row-reverse'
                    : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-slate-200 text-slate-500'
                      : 'bg-blue-600 text-white shadow-sm'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                </div>

                <div
                  className={`p-4 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Suggested Buttons */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto bg-slate-50/50 border-t border-slate-100">
        <button
          onClick={() => handleSend('I am feeling a craving')}
          className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600"
        >
          Feeling a craving
        </button>

        <button
          onClick={() => handleSend('Suggest a replacement habit')}
          className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600"
        >
          Suggest a replacement
        </button>

        <button
          onClick={() => handleSend('How am I doing?')}
          className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600"
        >
          How am I doing?
        </button>
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-4">
        <button className="text-slate-400 hover:text-blue-600">
          <HelpCircle size={24} />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none pr-12"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
