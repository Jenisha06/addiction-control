"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../src/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Sign in user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 2️⃣ Check if Firestore user doc exists
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 3️⃣ If missing → create it automatically
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          createdAt: new Date(),
          streak: 0,
          totalFocusTime: 0,
          onboardingCompleted: false,
        });
      }

      // 4️⃣ Redirect
      router.push("/dashboard");

    } catch (err) {
      setError(err.message || "Failed to sign in");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center from-blue-50 via-white to-blue-100 px-6">
      <div className="max-w-[1100px] w-full bg-white rounded-3xl shadow-xl flex overflow-hidden border border-blue-100">

        <div className="hidden md:flex w-1/2 items-center justify-center">
          <img
            src="/auth.png"
            alt="Illustration"
            className="w-75 md:w-120"
          />
        </div>

        <form
          onSubmit={handleLogin}
          className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-12 py-12"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Sign In
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-4">
              {error}
            </p>
          )}

          <div className="mb-4">
            <label className="text-sm text-gray-600 block mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full p-3 rounded-xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-600 block mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full p-3 rounded-xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#91c7da] text-white py-3 rounded-full font-medium shadow-md hover:bg-[#548293] transition-all duration-300 w-full disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <a href="/signup" className="font-medium underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}