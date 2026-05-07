"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      setError("Email y password son requeridos");
      return;
    }

    setLoading(true);
    setError("");

    const data = isLogin
      ? await login(email, password)
      : await register(email, password);

    setLoading(false);

    if (data.error) {
      setError(data.error);
      return;
    }

    if (isLogin) {
      localStorage.setItem("moodtune-token", data.token);
      localStorage.setItem("moodtune-user", JSON.stringify(data.user));
      router.push("/dashboard");
    } else {
      setIsLogin(true);
      setError("");
      setEmail("");
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-5">
      
      {/* titulo */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-white tracking-widest mb-2">
          🎵 MoodTune
        </h1>
        <p className="text-white/50 text-sm">
          AI-powered playlist generator
        </p>
      </div>

      {/* card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md backdrop-blur-md">
        
        {/* tabs */}
        <div className="flex gap-2 mb-6">
          {["Iniciar sesión", "Registrarse"].map((tab, i) => (
            <button
              key={tab}
              onClick={() => { setIsLogin(i === 0); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold text-white border border-purple-600/50 transition-colors cursor-pointer ${
                isLogin === (i === 0) ? "bg-purple-700" : "bg-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* inputs */}
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white text-sm outline-none placeholder:text-white/40"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="px-4 py-3 bg-white/10 border border-white/15 rounded-lg text-white text-sm outline-none placeholder:text-white/40"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-5 w-full py-3 rounded-lg text-white font-bold text-sm transition-colors cursor-pointer ${
            loading ? "bg-purple-900 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-600"
          }`}
        >
          {loading ? "Cargando..." : isLogin ? "Entrar" : "Registrarse"}
        </button>
      </div>
    </div>
  );
}