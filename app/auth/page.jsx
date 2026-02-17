"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../src/lib/firebase.js";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async () => {
  setError("");
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    router.push("/dashboard");
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      } catch (loginErr) {
        setError(loginErr.message);
      }
    } else {
      setError(err.message);
    }
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Login / Sign Up</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleAuth}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
