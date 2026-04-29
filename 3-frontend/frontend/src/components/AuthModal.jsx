import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function AuthModal({ onClose }) {
  const { dark }                      = useTheme();
  const { signin, signup }            = useAuth();
  const [mode, setMode]               = useState("signin");
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);

  const tx1   = dark ? "text-white"     : "text-slate-900";
  const tx2   = dark ? "text-slate-400" : "text-slate-600";
  const tx3   = dark ? "text-slate-500" : "text-slate-400";
  const glass = dark
    ? "bg-[#0a0d1a] border-white/10"
    : "bg-white border-slate-200 shadow-2xl";
  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-violet-400 ${
    dark ? "border-white/10 bg-white/5 text-white placeholder-slate-500"
         : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white"
  }`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await signin(email, password);
      } else {
        await signup(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-md rounded-3xl border p-8 ${glass}`}>

        {/* Close */}
        <button onClick={onClose}
          className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border text-sm transition hover:scale-110 ${
            dark ? "border-white/10 text-slate-400 hover:text-white" : "border-slate-200 text-slate-400 hover:text-slate-700"
          }`}>
          ✕
        </button>

        {/* Logo */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 text-sm font-black text-white shadow-lg">
            M
          </div>
          <div>
            <p className={`text-base font-extrabold ${tx1}`}>MultiVidAI</p>
            <p className={`text-xs ${tx3}`}>{mode === "signin" ? "Welcome back" : "Create your account"}</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className={`mb-6 flex rounded-xl border p-1 ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
          {["signin", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                mode === m
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
                  : `${tx2} hover:${tx1}`
              }`}>
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className={`mb-1.5 block text-xs font-bold uppercase tracking-widest ${tx3}`}>Full Name</label>
              <input className={inputCls} type="text" placeholder="Saksham" value={name}
                onChange={e => setName(e.target.value)} required />
            </div>
          )}

          <div>
            <label className={`mb-1.5 block text-xs font-bold uppercase tracking-widest ${tx3}`}>Email</label>
            <input className={inputCls} type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className={`mb-1.5 block text-xs font-bold uppercase tracking-widest ${tx3}`}>Password</label>
            <div className="relative">
              <input className={inputCls} type={showPass ? "text" : "password"}
                placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${tx3}`}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-500">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-violet-500/30 transition-all hover:scale-[1.02] hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading
              ? <><span className="h-2 w-2 animate-pulse rounded-full bg-white" /> Processing...</>
              : mode === "signin" ? "Sign In →" : "Create Account →"
            }
          </button>
        </form>

        <p className={`mt-5 text-center text-xs ${tx3}`}>
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            className="font-bold text-violet-500 hover:underline">
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}