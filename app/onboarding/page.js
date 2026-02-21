"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../src/lib/firebase";
import { db } from "../../src/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Lock,
  Activity,
  Sparkles,
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

  const [step, setStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const selectOption = (option) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: option,
    }));

    setTimeout(() => {
      if (currentQuestion < assessmentQuestions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setStep(2);
      }
    }, 250);
  };

  const calculateRiskLevel = () => {
    let score = 0;

    Object.values(answers).forEach((answer) => {
      if (
        answer === "4+ times a week" ||
        answer === "Always" ||
        answer === "Frequently" ||
        answer === "Regularly" ||
        answer === "Significantly"
      ) {
        score += 3;
      } else if (
        answer === "Often" ||
        answer === "Sometimes" ||
        answer === "Daily"
      ) {
        score += 2;
      } else if (
        answer === "Rarely" ||
        answer === "Once in a while"
      ) {
        score += 1;
      }
    });

    if (score >= 15) return "High Risk";
    if (score >= 8) return "Moderate Risk";
    return "Low Risk";
  };

  const handleFinish = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        alert("User not authenticated");
        return;
      }

      const riskLevel = calculateRiskLevel();
      const primaryGoal = answers[8] || "Moderation";

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        riskLevel,
        goalType: primaryGoal,
        assessmentAnswers: answers,
        xp: 0,
        coins: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <AnimatePresence mode="wait">

        {/* Welcome */}
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Heart size={40} fill="currentColor" />
            </div>

            <h1 className="text-3xl font-extrabold mb-4">
              Welcome Home.
            </h1>

            <p className="text-slate-500 mb-10">
              Let’s understand where you are so we can build your personalized path.
            </p>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border text-left">
              <Lock className="text-blue-500 shrink-0" size={20} />
              <p className="text-sm text-slate-600 font-medium italic">
                Anonymous & Secure. Your data is for you only.
              </p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold mt-10"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* Quiz */}
        {step === 1 && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-lg w-full"
          >
            <h2 className="text-2xl font-bold mb-8">
              {assessmentQuestions[currentQuestion].question}
            </h2>

            <div className="grid gap-4">
              {assessmentQuestions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => selectOption(option)}
                  className="p-5 rounded-3xl text-left font-bold border-2 bg-white border-slate-200 hover:border-blue-300"
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Result */}
        {step === 2 && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl text-center"
          >
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <Activity size={48} />
            </div>

            <h2 className="text-3xl font-extrabold mb-4">
              Assessment Ready
            </h2>

            <div className="p-6 bg-slate-50 rounded-3xl border mb-6">
              <p className="text-xs uppercase text-slate-400 mb-1">
                Recovery Level
              </p>
              <p className="text-2xl font-black text-blue-600">
                {calculateRiskLevel().toUpperCase()}
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl flex items-start gap-4 text-left">
              <Sparkles className="text-blue-600 mt-1" size={24} />
              <p className="text-sm text-blue-900">
                Your personalized journey begins now.
              </p>
            </div>

            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold mt-8"
            >
              {loading ? "Setting things up..." : "Start My Journey"}
              {!loading && <ArrowRight className="inline ml-2" />}
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}