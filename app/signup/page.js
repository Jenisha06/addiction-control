"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../src/lib/firebase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Shield, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

import loginPic from "@/public/loginPic.png";

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "",       color: "rgba(200,160,74,0.15)" },
    { label: "Weak",   color: "#c06060" },
    { label: "Fair",   color: "#c8a060" },
    { label: "Good",   color: "#6ab4d8" },
    { label: "Strong", color: "#7aab6a" },
  ];
  return { score, ...map[score] };
}

export default function SignupPage() {
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [isSuccess,    setIsSuccess]    = useState(false);
  const router = useRouter();

  const strength = getStrength(password);

  const createUserDoc = async (user, displayName) => {
    await setDoc(doc(db, "users", user.uid), {
      uid:                 user.uid,
      email:               user.email,
      name:                displayName || user.displayName || "Seeker",
      createdAt:           new Date(),
      xp:                  0,
      coins:               0,
      level:               1,
      streak:              0,
      currentStreak:       0,
      longestStreak:       0,
      totalFocusTime:      0,
      onboardingCompleted: false,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (strength.score < 2) {
      setError("Choose a stronger password (min 8 chars, mix letters & numbers).");
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await createUserDoc(user, name);
      setIsSuccess(true);
      setTimeout(() => router.push("/onboarding"), 1200);
    } catch (err) {
      const msg = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email":        "Please enter a valid email address.",
        "auth/weak-password":        "Password must be at least 6 characters.",
      };
      setError(msg[err.code] || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await createUserDoc(user, user.displayName);
      setIsSuccess(true);
      setTimeout(() => router.push("/onboarding"), 1200);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-up failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">

      {/* ── Background image with Ken Burns + Exit Zoom ── */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={isSuccess
          ? { scale: 1.5, opacity: 0 }
          : { scale: [1.1, 1.05, 1.1], opacity: 1 }
        }
        transition={{
          opacity: { duration: 1.5 },
          scale: isSuccess
            ? { duration: 1.2, ease: "easeIn" }
            : { duration: 20, repeat: Infinity, ease: "linear" },
        }}
        className="absolute inset-0 z-0"
      >
        <Image src={loginPic} alt="Signup background" fill priority className="object-cover" />
      </motion.div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/65 via-black/20 to-black/70" />
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-1 [background:radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]"
      />

      {/* Floating sparkles */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full bg-amber-200/40 blur-[1px]"
            initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, opacity: 0, scale: Math.random() * 0.5 + 0.5 }}
            animate={{ y: ["0%", "-100%"], x: ["0%", `${(Math.random() - 0.5) * 15}%`], opacity: [0, 0.7, 0] }}
            transition={{ duration: Math.random() * 8 + 8, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
            style={{ width: `${Math.random() * 3 + 2}px`, height: `${Math.random() * 3 + 2}px`, filter: "drop-shadow(0 0 4px rgba(251,191,36,0.4))" }}
          />
        ))}
      </div>

      <div className="relative z-20 flex min-h-screen flex-col items-center">

        {/* Top brand */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={isSuccess ? { y: -50, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto flex max-w-5xl items-center justify-center px-6 pt-10"
        >
          <div className="flex items-center gap-3 text-white/90 drop-shadow-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <Shield size={18} />
            </div>
            <span className="text-2xl font-black tracking-tight">Control.</span>
          </div>
        </motion.div>

        {/* Center portal */}
        <div className="flex flex-1 items-center justify-center px-5 pb-14 pt-8 w-full">
          <AnimatePresence>
            {!isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                exit={{ scale: 1.5, opacity: 0, filter: "blur(12px)", transition: { duration: 0.8, ease: "easeIn" } }}
                className="relative w-full max-w-[560px]"
              >
                {/* Outer glow */}
                <div className="absolute inset-0 -z-10 rounded-[44px] bg-[radial-gradient(circle_at_50%_35%,rgba(255,214,140,0.3),transparent_60%)] blur-3xl" />

                <div className="relative overflow-hidden rounded-[44px] border border-white/10 bg-black/25 shadow-2xl backdrop-blur-md">

                  {/* Stone arch decor */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-6 h-[620px] w-[560px] -translate-x-1/2 rounded-full border-[22px] border-[#6b4c2e]/65 shadow-[0_0_0_2px_rgba(0,0,0,0.25)]" />
                    <div className="absolute left-1/2 top-6 h-[620px] w-[560px] -translate-x-1/2 rounded-full border border-white/10" />
                    <div className="absolute left-1/2 top-10 h-[600px] w-[540px] -translate-x-1/2 rounded-full [background:radial-gradient(circle_at_50%_40%,rgba(255,215,145,0.28),rgba(0,0,0,0)_58%)]" />
                  </div>

                  {/* Rune ring */}
                  <div className="pointer-events-none absolute left-1/2 top-[56px] -translate-x-1/2 text-[#f5d7a8]/35">
                    <div className="relative h-[520px] w-[520px] rounded-full">
                      {["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚺ","ᚾ","ᛁ","ᛃ","ᛇ"].map((r, i) => (
                        <motion.span key={r + i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 + i * 0.04 }}
                          className="absolute left-1/2 top-1/2 text-lg drop-shadow-sm"
                          style={{ transform: `rotate(${i * 30}deg) translateY(-255px) rotate(-${i * 30}deg) translateX(-50%)` }}
                        >
                          {r}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Form container */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="relative mx-auto mt-20 w-[86%] rounded-[34px] bg-gradient-to-b from-[#2a1b12]/60 via-[#2a1b12]/40 to-[#2a1b12]/60 ring-1 ring-white/10"
                  >
                    {/* Crest icon */}
                    <div className="absolute left-1/2 top-[-20px] -translate-x-1/2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1b120c]/70 ring-1 ring-[#f5d7a8]/25 shadow-[0_0_20px_rgba(255,214,140,0.25)]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6b4c2e]/40 ring-1 ring-[#f5d7a8]/20">
                          <Shield size={18} className="text-[#f5d7a8]/80" />
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-8 pt-10 sm:px-10 sm:pb-10">
                      <h1 className="text-center font-serif text-2xl font-semibold tracking-wide text-[#f7e6c9] drop-shadow">
                        Begin Your Journey
                      </h1>
                      <p className="mt-1 text-center text-sm text-white/55 italic">
                        Forge your legend. Your recovery starts here.
                      </p>

                      {/* Error */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-5 rounded-2xl border border-rose-200/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                        >
                          <span className="mr-2">⚠️</span>{error}
                        </motion.div>
                      )}

                      {/* Google */}
                      <button type="button" onClick={handleGoogle} disabled={loading}
                        className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/10 py-3.5 text-sm font-semibold text-white/85 shadow-lg shadow-black/30 backdrop-blur transition hover:bg-white/15 active:scale-[0.98] disabled:opacity-50"
                      >
                        <svg width="18" height="18" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.9-4.5z"/>
                          <path fill="#FF3D00" d="M6.3 15.1l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4.5 24 4.5c-7.7 0-14.3 4.5-17.7 10.6z"/>
                          <path fill="#4CAF50" d="M24 45.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 37 26.8 38 24 38c-5.3 0-9.7-3.3-11.3-7.9l-6.6 4.8C9.6 41 16.3 45.5 24 45.5z"/>
                          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.4l6.2 5.2c-.4.4 6.3-4.6 6.3-13.6 0-1.5-.2-3-.9-4.5z"/>
                        </svg>
                        Continue with Google
                      </button>

                      {/* Divider */}
                      <div className="mt-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/15" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">The Scroll Path</span>
                        <div className="h-px flex-1 bg-white/15" />
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSignup} className="mt-5 space-y-4">

                        {/* Name */}
                        <div className="space-y-1.5">
                          <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-white/50">
                            Seeker Name
                          </label>
                          <div className="relative">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                              type="text"
                              placeholder="Alex"
                              className="w-full rounded-2xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-[#ffd692]/40 focus:bg-black/40"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-white/50">
                            Identifier
                          </label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                              type="email"
                              placeholder="you@example.com"
                              className="w-full rounded-2xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-[#ffd692]/40 focus:bg-black/40"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                          <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-white/50">
                            Secret Key
                          </label>
                          <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="w-full rounded-2xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-[#ffd692]/40 focus:bg-black/40"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              required
                            />
                            <button type="button" onClick={() => setShowPassword(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-white/30 hover:text-white/70 transition">
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>

                          {/* Strength bar — rune-style */}
                          {password.length > 0 && (
                            <div className="mt-2.5">
                              <div className="flex gap-1.5 mb-1.5">
                                {[1, 2, 3, 4].map(i => (
                                  <div key={i}
                                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                    style={{ background: i <= strength.score ? strength.color : "rgba(255,255,255,0.08)", boxShadow: i <= strength.score && strength.score >= 3 ? `0 0 6px ${strength.color}66` : "none" }}
                                  />
                                ))}
                              </div>
                              {strength.label && (
                                <p className="text-[11px] font-bold ml-0.5" style={{ color: strength.color }}>
                                  {strength.label} key
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Submit — Quest button */}
                        <button type="submit" disabled={loading}
                          className="group relative mt-2 w-full overflow-hidden rounded-2xl py-4 text-sm font-black tracking-widest text-white shadow-2xl transition active:scale-[0.97] disabled:opacity-60"
                          style={{ background: "linear-gradient(180deg, #5ecef5 0%, #38b6f0 40%, #1a96d8 100%)", boxShadow: "0 4px 0 #0e5c8a, 0 6px 20px rgba(30,140,210,0.4), inset 0 1px 0 rgba(255,255,255,0.4)", border: "2px solid #1478b0" }}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? "FORGING ACCOUNT..." : (
                              <>
                                BEGIN JOURNEY
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </span>
                        </button>
                      </form>

                      <p className="mt-6 text-center text-xs text-white/50">
                        Already a seeker?{" "}
                        <a href="/login" className="font-bold text-[#9fd7ff] hover:underline decoration-2">Return to Gate</a>
                      </p>
                    </div>
                  </motion.div>

                  {/* Guardian protocol footer */}
                  <div className="mx-auto mt-8 flex flex-col items-center gap-3 pb-9">
                    <div className="h-px w-12 bg-white/10" />
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-semibold">Guardian Protocol Active</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success flash */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 bg-white/5 backdrop-blur-md pointer-events-none"
              transition={{ duration: 0.6 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}