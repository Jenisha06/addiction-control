"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  Zap,
  Brain,
  Wind,
  Target,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Heart,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import BottomNav from "../components/BottomNav";

const exercises = [
  {
    id: "trigger",
     minLevel: 1,
    icon: <Target className="text-blue-600" size={32} />,
    title: "Smart Trigger Detective",
    subtitle: "AI-powered trigger analysis",
    xp: 150,
    color: "bg-blue-50",
  },
  {
    id: "reframing",
     minLevel: 2,
    icon: <Brain className="text-emerald-600" size={32} />,
    title: "AI Thought Transformer",
    subtitle: "Reframe thoughts positively with AI",
    xp: 200,
    color: "bg-emerald-50",
  },
  {
    id: "surfing",
     minLevel: 3,
    icon: <Wind className="text-purple-600" size={32} />,
    title: "Urge Surfing",
    subtitle: "Ride the wave without drowning",
    xp: 100,
    color: "bg-purple-50",
  },
  {
  id: "delay",
  icon: <Zap className="text-indigo-600" size={32} />,
  title: "Craving Delay Challenge",
  subtitle: "Wait it out. You are stronger than the urge.",
  xp: 130,
  color: "bg-indigo-50",
},
  {
    id: "mindfulness",
     minLevel: 1,
    icon: <Heart className="text-rose-600" size={32} />,
    title: "Mindful Breathing",
    subtitle: "Ground yourself in the present",
    xp: 120,
    color: "bg-rose-50",
  },
];

export default function CBTPage() {
  const { addXP , userData} = useApp();
  const [activeExercise, setActiveExercise] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [triggerQuestions, setTriggerQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  // Gemini AI API call
async function callGeminiAPI(prompt) {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const rawText = await res.text(); // 👈 KEY CHANGE
    let data = {};

    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Non-JSON response from API:", rawText);
    }

    if (!res.ok) {
      console.error("API error response:", data);
      return data.text || "AI service error. Please try again.";
    }

    return data.text || "No response generated.";
  } catch (err) {
    console.error("Frontend fetch failed:", err);
    return "Unable to reach AI service.";
  }
}
  const completeExercise = (xp, exerciseId) => {
    addXP?.(xp, exerciseId);
    toast.success(`Exercise Complete! +${xp} XP`, {
      icon: <Sparkles className="text-yellow-500" />,
    });
    setActiveExercise(null);
    setStep(0);
    setAiResponse("");
    setUserInput("");
    setTriggerQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  /* ===========================
     SMART TRIGGER DETECTIVE (AI-POWERED)
  =========================== */

  const generateTriggerQuestions = async () => {
    setLoading(true);
    const prompt = `You are an addiction counselor AI. Generate 3 multiple choice questions to help identify addiction triggers. Each question should have 4 options (A, B, C, D). Format as JSON:
    [
      {
        "question": "What situation typically precedes your urges?",
        "options": ["A) Social gatherings", "B) Work stress", "C) Being alone", "D) Relationship conflicts"]
      }
    ]
    Make questions specific to addiction triggers and psychological patterns.`;

    const response = await callGeminiAPI(prompt);
    try {
      const questions = JSON.parse(response);
      setTriggerQuestions(questions);
      setCurrentQuestion(questions[0].question);
    } catch (error) {
      // Fallback questions if JSON parsing fails
      setTriggerQuestions([
        {
          question: "What situation typically triggers your urges?",
          options: ["A) Social pressure", "B) Stress at work", "C) Being alone", "D) Seeing reminders"]
        }
      ]);
      setCurrentQuestion("What situation typically triggers your urges?");
    }
    setLoading(false);
  };

  const handleAnswerSelection = async (answer) => {
    setLoading(true);
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < triggerQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(triggerQuestions[nextIndex].question);
    } else {
      // Analyze all answers with AI
      const analysisPrompt = `As an addiction counselor, analyze these trigger responses and provide personalized insights in a conversational, encouraging tone (max 150 words):
      
      Answers: ${newAnswers.join(", ")}
      
      Provide: 1) Main trigger pattern identified 2) Personalized coping strategy 3) Encouraging message. Keep it warm and supportive.`;

      const analysis = await callGeminiAPI(analysisPrompt);
      setAiResponse(analysis);
      setStep(2);
    }
    setLoading(false);
  };

  if (activeExercise === "trigger") {
    return (
      <ExerciseLayout
        title="Smart Trigger Detective"
        onClose={() => {
          setActiveExercise(null);
          setStep(0);
          setTriggerQuestions([]);
          setCurrentQuestionIndex(0);
          setAnswers([]);
        }}
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center"
            >
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto">
                <Target size={48} />
              </div>
              
              <h2 className="text-3xl font-black text-slate-800">
                Let's find your triggers
              </h2>
              
              <p className="text-slate-600 text-lg">
                I'll ask you a few smart questions to identify your patterns
              </p>

              <button
                onClick={() => {
                  generateTriggerQuestions();
                  setStep(1);
                }}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-5 rounded-[32px] font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Start Analysis"}
                <ArrowRight />
              </button>
            </motion.div>
          )}

          {step === 1 && triggerQuestions.length > 0 && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <span className="text-sm text-blue-600 font-bold">
                  Question {currentQuestionIndex + 1} of {triggerQuestions.length}
                </span>
              </div>

              <h2 className="text-2xl font-black text-slate-800">
                {currentQuestion}
              </h2>

              <div className="space-y-4">
                {triggerQuestions[currentQuestionIndex]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelection(option)}
                    disabled={loading}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Brain size={32} />
              </div>

              <h2 className="text-2xl font-black text-slate-900 text-center">
                Your Trigger Analysis
              </h2>

              <div className="bg-white p-6 rounded-[24px] border border-slate-100">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                  </div>
                ) : (
                  <p className="text-slate-700 leading-relaxed">{aiResponse}</p>
                )}
              </div>

              <button
                onClick={() => completeExercise(150 , "trigger")}
                className="w-full bg-blue-600 text-white py-4 rounded-[24px] font-bold text-lg"
              >
                Complete Analysis +150 XP
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </ExerciseLayout>
    );
  }

  /* ===========================
     AI THOUGHT TRANSFORMER
  =========================== */

  if (activeExercise === "reframing") {
    return (
      <ExerciseLayout
        title="AI Thought Transformer"
        onClose={() => {
          setActiveExercise(null);
          setStep(0);
          setAiResponse("");
          setUserInput("");
        }}
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[24px] flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-800">
                  What's on your mind?
                </h2>
                <p className="text-slate-500 mt-2">
                  Share a negative thought, and I'll help you see it differently
                </p>
              </div>

              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full h-40 bg-white border-2 border-slate-200 rounded-[24px] p-6 text-lg font-medium focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 outline-none transition-all resize-none"
                placeholder="e.g. I'm worthless and will never overcome this addiction..."
              />

              <button
                onClick={async () => {
                  if (!userInput.trim()) return;
                  
                  const reframePrompt = `You are a compassionate therapist. Reframe this negative thought in a positive, realistic way. Be conversational, warm, and encouraging. Keep it under 100 words:

                  Negative thought: "${userInput}"

                  Provide a gentle reframe that acknowledges their struggle but offers hope and a healthier perspective. Use "you" to speak directly to them.`;

                  const reframe = await callGeminiAPI(reframePrompt);
                  setAiResponse(reframe);
                  setStep(1);
                }}
                disabled={loading || !userInput.trim()}
                className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Transform Thought"}
                <Sparkles />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="reframe"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[24px] flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  New Perspective ✨
                </h2>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-[24px] border border-emerald-100">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                  </div>
                ) : (
                  <p className="text-slate-700 leading-relaxed text-lg italic">
                    "{aiResponse}"
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setStep(0);
                    setUserInput("");
                    setAiResponse("");
                  }}
                  className="w-full bg-white border-2 border-emerald-200 text-emerald-700 py-4 rounded-[24px] font-bold"
                >
                  Transform Another Thought
                </button>
                
                <button
                  onClick={() => completeExercise(200 , "reframing")}
                  className="w-full bg-emerald-600 text-white py-4 rounded-[24px] font-bold text-lg"
                >
                  Complete Session +200 XP
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ExerciseLayout>
    );
  }

  /* ===========================
     MINDFUL BREATHING (NEW 4TH FEATURE)
  =========================== */

  if (activeExercise === "mindfulness") {
    return (
      <ExerciseLayout
        title="Mindful Breathing"
        onClose={() => {
          setActiveExercise(null);
          setStep(0);
        }}
      >
        <div className="space-y-8 text-center">
          <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-[32px] flex items-center justify-center mx-auto">
            <Heart size={48} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-800">
            Breathe & Reset
          </h2>
          
          <p className="text-slate-600 text-lg">
            4-7-8 breathing technique to calm your mind and body
          </p>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-[32px] border border-rose-100">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                <span>Inhale for 4 counts</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                <span>Hold for 7 counts</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                <span>Exhale for 8 counts</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => completeExercise(120 , "mindfulness")}
            className="w-full bg-rose-600 text-white py-5 rounded-[32px] font-black text-lg shadow-xl shadow-rose-100"
          >
            I've Completed 3 Cycles +120 XP
          </button>
        </div>
      </ExerciseLayout>
    );
  }

  /* ===========================
     DEFAULT SCREEN
  =========================== */

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            AI Brain <span className="text-emerald-600">Gym</span>
          </h1>
          <p className="text-slate-500">AI-powered addiction recovery</p>
        </div>

        <div className="bg-emerald-100 p-3 rounded-2xl flex items-center gap-2">
          <Brain className="text-emerald-600" size={20} />
          <span className="font-black text-emerald-800 text-xs uppercase">
            Level {userData?.level ?? 1}
          </span>
        </div>
      </header>

      <div className="grid gap-4">
{exercises.map((ex) => {
  const locked = (userData?.level ?? 1) < ex.minLevel;

  return (
    <button
      key={ex.id}
      onClick={() => !locked && setActiveExercise(ex.id)}
      disabled={locked}
      className={`${ex.color} p-6 rounded-[32px] text-left transition-all border border-white/50 flex items-center gap-6 shadow-sm
        ${locked ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95"}`}
    >
      <div className="bg-white p-4 rounded-2xl relative">
        {ex.icon}
        {locked && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-2 py-1 rounded-full font-bold">
            L{ex.minLevel}
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-lg text-slate-900">
          {ex.title}
        </h3>
        <p className="text-xs text-slate-500">
          {locked
            ? `Unlock at Level ${ex.minLevel}`
            : ex.subtitle}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="bg-white/80 px-2 py-1 rounded-lg text-[10px] font-black text-slate-700">
          +{ex.xp} XP
        </span>
        {!locked && <ChevronRight className="text-slate-400" />}
      </div>
    </button>
  );
})}
      </div>

      <div className="mt-8 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="text-yellow-500" size={20} fill="currentColor" />
          AI Pro Tip
        </h3>
        <p className="text-slate-500 text-sm italic">
          The AI learns your patterns and provides personalized strategies that get better over time.
        </p>
      </div>
      <BottomNav/>
    </div>
  );
}

/* ===========================
   LAYOUT COMPONENT
=========================== */

function ExerciseLayout({ title, children, onClose }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 max-w-lg mx-auto">
      <header className="py-8 flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>

        <button
          onClick={onClose}
          className="bg-slate-200 p-2 rounded-full hover:bg-slate-300 transition-colors"
        >
          <XIcon />
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      className="text-slate-600"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
