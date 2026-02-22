"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../src/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import loginPic from "@/public/loginPic.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ── shared post-login routing ──────────────────────────────────────────────
  const handlePostLogin = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        createdAt: new Date(),
        streak: 0,
        xp: 0,
        coins: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        onboardingCompleted: false,
      });
      router.push("/onboarding");
    } else if (!userSnap.data().onboardingCompleted) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  // ── Email / password login ─────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await handlePostLogin(user);
    } catch (err) {
      const msg = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Try again.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please wait a moment.",
      };
      setError(msg[err.code] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Google login ───────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await handlePostLogin(user);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <Image
        src={loginPic}
        alt="Login background"
        fill
        priority
        className="object-cover"
      />

      {/* Vignette / mist overlays (to match the dreamy portal vibe) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />
      <div className="absolute inset-0 [background:radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_55%)]" />
      <div className="absolute inset-0 [background:radial-gradient(circle_at_50%_35%,rgba(255,214,140,0.18),transparent_55%)]" />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[10%] top-[20%] h-2 w-2 rounded-full bg-white/60 blur-[1px]" />
        <div className="absolute left-[22%] top-[70%] h-1.5 w-1.5 rounded-full bg-emerald-200/70 blur-[1px]" />
        <div className="absolute right-[18%] top-[28%] h-2 w-2 rounded-full bg-amber-100/70 blur-[1px]" />
        <div className="absolute right-[25%] top-[66%] h-1.5 w-1.5 rounded-full bg-white/50 blur-[1px]" />
        <div className="absolute left-[55%] top-[12%] h-1.5 w-1.5 rounded-full bg-amber-200/60 blur-[1px]" />
      </div>

      {/* Top brand */}
      <div className="relative z-10 mx-auto flex max-w-5xl items-center justify-center px-6 pt-10">
        <div className="flex items-center gap-3 text-white/90 drop-shadow">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <Shield size={18} />
          </div>
          <span className="text-2xl font-black tracking-tight">Control.</span>
        </div>
      </div>

      {/* Center portal UI */}
      <div className="relative z-10 flex min-h-[calc(100vh-120px)] items-center justify-center px-5 pb-14 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="relative w-full max-w-[560px]"
        >
          {/* Outer glow */}
          <div className="absolute inset-0 -z-10 rounded-[44px] bg-[radial-gradient(circle_at_50%_35%,rgba(255,214,140,0.35),transparent_60%)] blur-2xl" />

          {/* Stone arch frame */}
          <div className="relative overflow-hidden rounded-[44px] border border-white/10 bg-black/25 shadow-2xl backdrop-blur-md">
            {/* “Stone ring” illusion */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-6 h-[520px] w-[520px] -translate-x-1/2 rounded-full border-[22px] border-[#6b4c2e]/65 shadow-[0_0_0_2px_rgba(0,0,0,0.25)]" />
              <div className="absolute left-1/2 top-6 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full [background:radial-gradient(circle_at_50%_40%,rgba(255,215,145,0.35),rgba(0,0,0,0)_58%)]" />
            </div>

            {/* Runes around ring (simple text glyphs spaced) */}
            <div className="pointer-events-none absolute left-1/2 top-[56px] -translate-x-1/2 text-[#f5d7a8]/40">
              <div className="relative h-[460px] w-[460px] rounded-full">
                {["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ"].map(
                  (r, i) => (
                    <span
                      key={r + i}
                      className="absolute left-1/2 top-1/2 text-lg drop-shadow-sm"
                      style={{
                        transform: `rotate(${i * 30}deg) translateY(-225px) rotate(-${
                          i * 30
                        }deg) translateX(-50%)`,
                      }}
                    >
                      {r}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Inner portal “door” area */}
            <div className="relative mx-auto mt-20 w-[86%] rounded-[34px] bg-gradient-to-b from-[#2a1b12]/55 via-[#2a1b12]/35 to-[#2a1b12]/55 ring-1 ring-white/10">
              {/* Tiny crest/shield */}
              <div className="absolute left-1/2 top-[-20px] -translate-x-1/2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1b120c]/70 ring-1 ring-[#f5d7a8]/25 shadow-[0_0_18px_rgba(255,214,140,0.20)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6b4c2e]/40 ring-1 ring-[#f5d7a8]/20">
                    <Shield size={18} className="text-[#f5d7a8]/80" />
                  </div>
                </div>
              </div>

              <div className="px-6 pb-7 pt-10 sm:px-10 sm:pb-9">
                <h1 className="text-center font-serif text-2xl font-semibold tracking-wide text-[#f7e6c9] drop-shadow">
                  Welcome Back, Seeker,
                </h1>
                <p className="mt-1 text-center text-sm text-white/60">
                  Embark on Your Next Recovery Chapter.
                </p>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 rounded-2xl border border-rose-200/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                  >
                    <span className="mr-2">⚠️</span>
                    {error}
                  </motion.div>
                )}

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/10 py-3.5 text-sm font-semibold text-white/85 shadow-lg shadow-black/30 backdrop-blur transition hover:bg-white/15 active:scale-[0.99] disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.9-4.5z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 15.1l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4.5 24 4.5c-7.7 0-14.3 4.5-17.7 10.6z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 45.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 37 26.8 38 24 38c-5.3 0-9.7-3.3-11.3-7.9l-6.6 4.8C9.6 41 16.3 45.5 24 45.5z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.4l6.2 5.2c-.4.4 6.3-4.6 6.3-13.6 0-1.5-.2-3-.9-4.5z"
                    />
                  </svg>
                  Google
                </button>

                {/* Divider */}
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/15" />
                  <span className="text-xs font-medium text-white/55">
                    or delve into email path
                  </span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="mt-5 space-y-4">
                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/55">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
                      />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-white/15 bg-black/25 py-3.5 pl-11 pr-4 text-sm text-white/90 placeholder:text-white/30 outline-none ring-0 transition focus:border-[#ffd692]/45 focus:bg-black/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      {/* tiny “scroll” accent */}
                      <div className="pointer-events-none absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 sm:flex">
                        <Sparkles size={16} className="text-[#ffd692]/70" />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/55">
                        Password
                      </label>
                      <a
                        href="/forgot-password"
                        className="text-xs font-semibold text-[#9fd7ff] hover:underline"
                      >
                        Forgot?
                      </a>
                    </div>

                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-white/15 bg-black/25 py-3.5 pl-11 pr-12 text-sm text-white/90 placeholder:text-white/30 outline-none transition focus:border-[#ffd692]/45 focus:bg-black/30"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-white/50 transition hover:bg-white/5 hover:text-white/80"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-white/45">
                      <span className="hover:text-white/70"> </span>
                      <a
                        href="/forgot-password"
                        className="font-medium text-white/45 hover:text-white/70"
                      >
                        Lost Your Way?
                      </a>
                    </div>
                  </div>

                  {/* Start Quest */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative mt-2 w-full overflow-hidden rounded-2xl py-4 text-sm font-extrabold tracking-widest text-white shadow-2xl shadow-black/40 transition active:scale-[0.99] disabled:opacity-60"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(56,189,248,0.95), rgba(59,130,246,0.95))",
                    }}
                  >
                    {/* glow */}
                    <span className="pointer-events-none absolute inset-0 opacity-70 blur-xl [background:radial-gradient(circle_at_50%_50%,rgba(125,211,252,0.95),transparent_60%)]" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                          STARTING...
                        </>
                      ) : (
                        <>
                          START QUEST
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* Signup */}
                <p className="mt-6 text-center text-sm text-white/65">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/signup"
                    className="font-bold text-[#9fd7ff] hover:underline"
                  >
                    Forge Your Legend
                  </a>
                </p>
              </div>
            </div>

            {/* Bottom lock note */}
            <div className="mx-auto mt-8 flex w-[86%] flex-col items-center gap-2 pb-9">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                <Lock size={18} className="text-white/70" />
              </div>
              <p className="text-center text-xs text-white/55">
                Your data is protected — your journey stays yours.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}