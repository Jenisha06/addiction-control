"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Lock,
  Activity,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const assessmentQuestions = [
  {
    question: "How often do you drink alcohol?",
    options: [
      "Never",
      "Monthly or less",
      "2-4 times a month",
      "2-3 times a week",
      "4+ times a week",
    ],
  },
  {
    question: "Do you drink to cope with stress?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    question: "Have you tried quitting before?",
    options: ["Never", "Once", "A few times", "Many times", "Currently trying"],
  },
  {
    question: "How do you feel after drinking?",
    options: ["Relaxed", "Indifferent", "Guilty", "Anxious", "Regretful"],
  },
  {
    question: "Do you experience blackouts?",
    options: ["Never", "Once in a while", "Sometimes", "Frequently", "Regularly"],
  },
  {
    question: "Do you feel like you need to drink?",
    options: ["Not at all", "Occasionally", "Daily", "All the time"],
  },
  {
    question: "Has drinking affected your work/school?",
    options: ["Never", "A little", "Somewhat", "Significantly"],
  },
  {
    question: "How supportive is your environment?",
    options: [
      "Very supportive",
      "Somewhat",
      "Neutral",
      "Unsupportive",
      "Toxic",
    ],
  },
  {
    question: "What is your primary goal?",
    options: ["Total Sobriety", "Moderation", "Exploration", "Other"],
  },
  {
    question: "Are you ready to commit?",
    options: ["Fully", "Mostly", "Trying my best", "Uncertain"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(0); // 0 welcome, 1 quiz, 2 result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (currentQuestion < assessmentQuestions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setStep(2);
      }
    } else {
      router.push("/dashboard");
    }
  };

  const selectOption = (option) => {
    setAnswers({
      ...answers,
      [currentQuestion]: option,
    });

    setTimeout(handleNext, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

      <AnimatePresence mode="wait">
        {/* Welcome */}
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl text-center z-10"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Heart size={40} fill="currentColor" />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
              Welcome Home.
            </h1>

            <p className="text-slate-500 mb-10 leading-relaxed">
              Let’s understand where you are so we can build your personalized
              path.
            </p>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
              <Lock className="text-blue-500 shrink-0" size={20} />
              <p className="text-sm text-slate-600 font-medium italic">
                Anonymous & Secure. Your data is for you only.
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold text-lg mt-10 hover:bg-blue-700 transition-all shadow-xl"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* Quiz */}
        {step === 1 && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-lg w-full z-10"
          >
            <div className="mb-10">
              <div className="flex justify-between mb-4">
                <span className="text-blue-600 font-bold">
                  Question {currentQuestion + 1}
                </span>
                <span className="text-slate-400">
                  / {assessmentQuestions.length}
                </span>
              </div>

              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  animate={{
                    width: `${
                      ((currentQuestion + 1) /
                        assessmentQuestions.length) *
                      100
                    }%`,
                  }}
                  className="h-full bg-blue-600"
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              {assessmentQuestions[currentQuestion].question}
            </h2>

            <div className="grid gap-4">
              {assessmentQuestions[currentQuestion].options.map(
                (option, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectOption(option)}
                    className={`p-5 rounded-3xl text-left font-bold border-2 transition-all ${
                      answers[currentQuestion] === option
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}

        {/* Result */}
        {step === 2 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl text-center z-10"
          >
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <Activity size={48} />
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Assessment Ready
            </h2>

            <div className="p-6 bg-slate-50 rounded-3xl border mb-6">
              <p className="text-xs uppercase text-slate-400 mb-1">
                Recovery Level
              </p>
              <p className="text-2xl font-black text-blue-600">
                MODERATE RISK
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl flex items-start gap-4 text-left">
              <Sparkles className="text-blue-600 mt-1" size={24} />
              <p className="text-sm text-blue-900">
                We've assigned you the <b>Resilience Path</b>.
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold text-lg mt-8 hover:bg-blue-700 transition-all"
            >
              Start My Journey
              <ArrowRight className="inline ml-2" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
