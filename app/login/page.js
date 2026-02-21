"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/lib/firebase.js";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in");
    }
  };

  return (
    <div>
    <div className="min-h-screen flex items-center justify-center from-blue-50 via-white to-blue-100 px-6">
      <div className="max-w-[1100px] w-full bg-white rounded-3xl shadow-xl flex overflow-hidden border border-blue-100">

        
        <div className="hidden md:flex w-1/2  to-blue-200 items-center justify-center ">
          <img
            src="/auth.png"
            alt="Camel illustration"
            className="w-75 md:w-120  "
          />
        </div>

        
        <form
          onSubmit={handleLogin}
          className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-12 py-12"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center md:text-left">
            Sign In
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center md:text-left">
              {error}
            </p>
          )}

          <div className="mb-4">
            <label className="text-sm text-gray-6-- block mb-2">
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
            className="bg-[#91c7da] text-white py-3 rounded-full font-medium shadow-md hover:bg-[#548293] transition-all duration-300 w-full"
          

          >
            Sign In
          </button>

          <p className="text-sm text-gray-600 mt-6 text-center md:text-left">
            Don't have an account?{" "}
            <a href="/signup" className="font-medium underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
    </div>
  );
}