import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const stack = [
  { icon: "🎤", name: "OpenAI Whisper",  role: "Speech Recognition", desc: "Auto language detection, segment timestamps, tiny→large models.", color: "violet" },
  { icon: "🌐", name: "Argos Translate", role: "Offline Translation", desc: "100% offline NLP — no API keys, no cost per character.",          color: "blue" },
  { icon: "🔊", name: "Edge Neural TTS", role: "Voice Generation",    desc: "Male & female neural voices for all 22 Indian languages.",        color: "indigo" },
  { icon: "👄", name: "Wav2Lip GAN",     role: "Lip Synchronization", desc: "GAN-based lip-sync — industry quality, comparable to HeyGen.",   color: "pink" },
  { icon: "🎞", name: "FFmpeg",          role: "Media Processing",    desc: "Extract, concat, mux audio/video at any quality level.",          color: "amber" },
  { icon: "⚗️", name: "Flask",           role: "API Gateway",         desc: "Microservice blueprints — each route works independently.",       color: "emerald" },
  { icon: "⚛️", name: "React",           role: "Frontend UI",         desc: "3-column studio layout, dark/light mode, responsive design.",     color: "cyan" },
];

const pipeline = [
  { step: "01", icon: "📁", label: "Upload",     desc: "User uploads video (MP4/MOV/AVI)",            color: "violet" },
  { step: "02", icon: "🔊", label: "Extract",    desc: "FFmpeg extracts clean WAV audio",              color: "blue" },
  { step: "03", icon: "🎤", label: "Transcribe", desc: "Whisper detects language & converts to text",  color: "indigo" },
  { step: "04", icon: "🌐", label: "Translate",  desc: "Argos translates offline to target language",  color: "cyan" },
  { step: "05", icon: "🗣", label: "TTS",        desc: "Edge TTS generates neural voice audio",        color: "pink" },
  { step: "06", icon: "🎬", label: "Dub",        desc: "Wav2Lip + FFmpeg produces final dubbed video", color: "emerald" },
];

const microservices = [
  { route: "POST /transcribe", desc: "Audio/video → transcribed text via Whisper",        color: "violet", span: "lg:col-span-1" },
  { route: "POST /translate",  desc: "Text → translated text via Argos (offline)",         color: "blue",   span: "lg:col-span-1" },
  { route: "POST /tts",        desc: "Text → neural voice audio via Edge TTS",             color: "pink",   span: "lg:col-span-1" },
  { route: "POST /dub/dub",    desc: "Full pipeline: video → dubbed video with lip-sync",  color: "emerald",span: "lg:col-span-1" },
];

const strengths = [
  { icon: "🔌", title: "Offline-first",       desc: "Argos runs with zero internet — no API keys, no rate limits, no cost.",         color: "blue",    size: "lg:col-span-2" },
  { icon: "🧩", title: "Modular design",      desc: "Each microservice can be tested, scaled, or replaced without touching others.",  color: "violet",  size: "lg:col-span-1" },
  { icon: "🌍", title: "22 Indian languages", desc: "Any source → any target, bridged through English automatically.",                color: "indigo",  size: "lg:col-span-1" },
  { icon: "⚡", title: "Model caching",       desc: "Whisper loads once at startup — no 30-second cold start per request.",          color: "amber",   size: "lg:col-span-1" },
  { icon: "🎭", title: "Gender-aware TTS",    desc: "Male/female voices mapped per language — selection passed through full pipeline.", color: "pink",  size: "lg:col-span-1" },
  { icon: "🛡️", title: "Error resilience",    desc: "Every route has try/except with structured JSON errors — no silent crashes.",    color: "emerald", size: "lg:col-span-2" },
];

const roadmap = [
  { icon: "🧠", label: "NLLB-200",        desc: "Meta's 200-language model for better translation quality.", color: "violet" },
  { icon: "🎯", label: "Whisper large-v3", desc: "Near-human transcription accuracy.",                       color: "blue" },
  { icon: "📄", label: "SRT export",       desc: "Timestamped subtitle files alongside dubbed video.",       color: "indigo" },
  { icon: "👥", label: "Diarization",      desc: "Separate multi-speaker audio for independent dubbing.",    color: "pink" },
  { icon: "⏱️", label: "Job queue",        desc: "Celery + Redis for non-blocking long video jobs.",         color: "amber" },
  { icon: "🌐", label: "Cloud deploy",     desc: "Vercel frontend + cloud GPU backend for production.",      color: "emerald" },
];

const accentDark = {
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/25",  text: "text-violet-300",  badge: "bg-violet-500/20 text-violet-200",  dot: "bg-violet-400",  glow: "shadow-violet-500/20"  },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/25",    text: "text-blue-300",    badge: "bg-blue-500/20 text-blue-200",      dot: "bg-blue-400",    glow: "shadow-blue-500/20"    },
  indigo:  { bg: "bg-indigo-500/10",  border: "border-indigo-500/25",  text: "text-indigo-300",  badge: "bg-indigo-500/20 text-indigo-200",  dot: "bg-indigo-400",  glow: "shadow-indigo-500/20"  },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/25",    text: "text-cyan-300",    badge: "bg-cyan-500/20 text-cyan-200",      dot: "bg-cyan-400",    glow: "shadow-cyan-500/20"    },
  pink:    { bg: "bg-pink-500/10",    border: "border-pink-500/25",    text: "text-pink-300",    badge: "bg-pink-500/20 text-pink-200",      dot: "bg-pink-400",    glow: "shadow-pink-500/20"    },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/25",   text: "text-amber-300",   badge: "bg-amber-500/20 text-amber-200",    dot: "bg-amber-400",   glow: "shadow-amber-500/20"   },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-200",dot: "bg-emerald-400", glow: "shadow-emerald-500/20" },
};

const accentLight = {
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  badge: "bg-violet-100 text-violet-700",  dot: "bg-violet-500",  glow: "shadow-violet-100"  },
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    badge: "bg-blue-100 text-blue-700",      dot: "bg-blue-500",    glow: "shadow-blue-100"    },
  indigo:  { bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700",  badge: "bg-indigo-100 text-indigo-700",  dot: "bg-indigo-500",  glow: "shadow-indigo-100"  },
  cyan:    { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    badge: "bg-cyan-100 text-cyan-700",      dot: "bg-cyan-500",    glow: "shadow-cyan-100"    },
  pink:    { bg: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700",    badge: "bg-pink-100 text-pink-700",      dot: "bg-pink-500",    glow: "shadow-pink-100"    },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-100 text-amber-700",    dot: "bg-amber-500",   glow: "shadow-amber-100"   },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500", glow: "shadow-emerald-100" },
};

export default function About() {
  const { dark } = useTheme();
  const acc = dark ? accentDark : accentLight;

  const pg   = dark ? "bg-[#030714]"   : "bg-[#f5f4ff]";
  const tx1  = dark ? "text-white"     : "text-slate-900";
  const tx2  = dark ? "text-slate-400" : "text-slate-600";
  const tx3  = dark ? "text-slate-500" : "text-slate-400";
  const glass = dark
    ? "bg-white/[0.04] border-white/10 backdrop-blur-xl"
    : "bg-white/80 border-slate-200 backdrop-blur-xl shadow-[0_4px_24px_rgba(99,91,255,0.07)]";
  const SL = ({ children }) => (
    <p className={`mb-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${tx3}`}>{children}</p>
  );

  return (
    <div className={`relative min-h-screen ${pg} ${tx1} transition-colors duration-300 overflow-hidden`}>

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {dark ? (
          <>
            <div className="absolute -left-48 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/15 blur-[140px]" />
            <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-indigo-700/12 blur-[150px]" />
            <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-pink-700/10 blur-[130px]" />
          </>
        ) : (
          <>
            <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-200/60 blur-[120px]" />
            <div className="absolute right-0 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-200/50 blur-[130px]" />
            <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-pink-200/30 blur-[100px]" />
          </>
        )}
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-16 sm:py-24">

        {/* ════════════════════════════════════
            HERO — 2-column asymmetric
        ════════════════════════════════════ */}
        <section className="mb-20 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left — heading + description */}
          <div>
            <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-widest ${
              dark ? "border-violet-500/30 bg-violet-500/10 text-violet-300" : "border-violet-300 bg-violet-50 text-violet-700 shadow-sm"
            }`}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
              About the project
            </div>
            <h1 className={`mb-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl ${tx1}`}>
              Built by{" "}
              <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
                Saksham
              </span>
            </h1>
            <p className={`mb-6 text-lg leading-relaxed ${tx2}`}>
              MultiVidAI is a full-stack AI pipeline that automates multilingual video dubbing —
              from speech recognition to lip-synced video output.
              Built as a real-world application, not a demo.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Full-Stack", "AI Pipeline", "22 Languages", "Offline-first", "Microservices"].map((tag) => (
                <span key={tag} className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-600 shadow-sm"
                }`}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Right — project summary card */}
          <div className={`rounded-3xl border p-7 ${glass}`}>
            <SL>One sentence explanation</SL>
            <p className={`mb-5 text-sm leading-relaxed ${tx2}`}>
              Takes a video in any language → automatically produces a dubbed version in the target language
              using{" "}
              <span className={`font-bold ${dark ? "text-violet-300" : "text-violet-700"}`}>Whisper</span>,{" "}
              <span className={`font-bold ${dark ? "text-blue-300" : "text-blue-700"}`}>Argos</span>,{" "}
              <span className={`font-bold ${dark ? "text-pink-300" : "text-pink-700"}`}>Neural TTS</span>, and{" "}
              <span className={`font-bold ${dark ? "text-emerald-300" : "text-emerald-700"}`}>Wav2Lip-GAN</span>.
            </p>
            {/* Mini flow */}
            <div className={`rounded-xl border p-4 font-mono text-[11px] ${dark ? "border-white/5 bg-black/30" : "border-slate-200 bg-slate-50"}`}>
              {[
                { label: "React Frontend",  port: ":3001", color: dark ? "text-cyan-400"     : "text-cyan-700" },
                { label: "Flask Backend",   port: ":8000", color: dark ? "text-emerald-400"  : "text-emerald-700" },
                { label: "AI Pipeline",     port: "",      color: dark ? "text-violet-400"   : "text-violet-700" },
              ].map((row, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 py-1">
                    <span className={`font-bold ${row.color}`}>{row.label}</span>
                    {row.port && <span className={`text-[9px] ${tx3}`}>{row.port}</span>}
                  </div>
                  {i < 2 && <div className={`ml-3 h-4 w-px ${dark ? "bg-white/10" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>
            {/* Stats row */}
            <div className={`mt-5 grid grid-cols-3 gap-2 rounded-xl border p-3 text-center text-xs ${dark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
              {[["22+","Languages"],["6","Steps"],["4","APIs"]].map(([n,l]) => (
                <div key={l}>
                  <p className={`text-lg font-black ${tx1}`}>{n}</p>
                  <p className={`text-[10px] ${tx3}`}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            PIPELINE — 3-column grid
        ════════════════════════════════════ */}
        <section className="mb-20">
          <div className="mb-8">
            <SL>End-to-end pipeline</SL>
            <h2 className={`text-2xl font-black tracking-tight ${tx1}`}>6-step automated process</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pipeline.map((s) => {
              const a = acc[s.color];
              return (
                <div key={s.step}
                  className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${a.glow} ${glass}`}>
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-110 ${a.bg}`}>
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black ${a.text}`}>{s.step}</span>
                      <span className={`text-sm font-extrabold ${tx1}`}>{s.label}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${tx2}`}>{s.desc}</p>
                    <div className={`mt-2.5 h-0.5 w-5 rounded-full transition-all duration-300 group-hover:w-full ${a.dot}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════
            TECH STACK — 2+1 asymmetric grid
        ════════════════════════════════════ */}
        <section className="mb-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <SL>Technology stack</SL>
              <h2 className={`text-2xl font-black tracking-tight ${tx1}`}>Every tool, explained</h2>
            </div>
            <span className={`text-sm font-semibold ${tx3}`}>{stack.length} technologies</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((t, i) => {
              const a = acc[t.color];
              const isWide = i === 0 || i === 6; // first and last span 2
              return (
                <div key={t.name}
                  className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${a.glow} ${glass} ${isWide ? "sm:col-span-2 lg:col-span-2" : ""}`}>
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-110 ${a.bg}`}>
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className={`text-sm font-extrabold ${tx1}`}>{t.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.badge}`}>{t.role}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${tx2}`}>{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════
            MICROSERVICES + STRENGTHS — bento
        ════════════════════════════════════ */}
        <section className="mb-20">
          <div className="mb-8">
            <SL>Architecture</SL>
            <h2 className={`text-2xl font-black tracking-tight ${tx1}`}>Microservice API design</h2>
            <p className={`mt-1.5 text-sm ${tx2}`}>Each endpoint works independently — use one or chain them all.</p>
          </div>

          {/* 2-column API routes */}
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            {microservices.map((m) => {
              const a = acc[m.color];
              return (
                <div key={m.route}
                  className={`group rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${a.glow} ${glass}`}>
                  <div className={`mb-2.5 inline-flex rounded-xl px-3 py-1.5 font-mono text-xs font-black ${a.badge}`}>
                    {m.route}
                  </div>
                  <p className={`text-sm leading-relaxed ${tx2}`}>{m.desc}</p>
                  <div className={`mt-3 h-0.5 w-5 rounded-full transition-all duration-300 group-hover:w-full ${a.dot}`} />
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════
            ENGINEERING STRENGTHS — bento grid
        ════════════════════════════════════ */}
        <section className="mb-20">
          <div className="mb-8">
            <SL>Engineering decisions</SL>
            <h2 className={`text-2xl font-black tracking-tight ${tx1}`}>What makes this production-grade</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strengths.map((item) => {
              const a = acc[item.color];
              return (
                <div key={item.title}
                  className={`group rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default ${a.glow} ${glass} ${item.size}`}>
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-110 ${a.bg}`}>
                    {item.icon}
                  </div>
                  <p className={`mb-2 text-base font-extrabold tracking-tight ${tx1}`}>{item.title}</p>
                  <p className={`text-sm leading-relaxed ${tx2}`}>{item.desc}</p>
                  <div className={`mt-4 h-0.5 w-6 rounded-full transition-all duration-300 group-hover:w-16 ${a.dot}`} />
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════
            ARCHITECTURE DIAGRAM — full width
        ════════════════════════════════════ */}
        <section className="mb-20">
          <div className={`rounded-3xl border p-8 lg:p-10 ${glass}`}>
            <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_1.5fr] lg:items-start">
              <div>
                <SL>System architecture</SL>
                <h2 className={`text-2xl font-black tracking-tight ${tx1}`}>How the layers connect</h2>
                <p className={`mt-3 text-sm leading-relaxed ${tx2}`}>
                  Three independent layers — React frontend talks to Flask via HTTP,
                  Flask orchestrates Python AI services, each service is stateless and cacheable.
                </p>
              </div>
              {/* Architecture diagram */}
              <div className={`rounded-2xl border p-5 font-mono text-sm ${dark ? "border-white/5 bg-black/40" : "border-slate-200 bg-slate-50 shadow-inner"}`}>
                {[
                  { label: "React Frontend",    port: "port 3001", color: dark ? "text-cyan-400"    : "text-cyan-700",    note: "Studio UI · Dark/Light · Responsive" },
                  { arrow: true },
                  { label: "Flask Backend",     port: "port 8000", color: dark ? "text-emerald-400" : "text-emerald-700", note: "4 blueprints · CORS · Logging · Threaded" },
                  { arrow: true },
                  { label: "AI Pipeline",       port: "",          color: dark ? "text-violet-400"  : "text-violet-700",  note: "Whisper · Argos · TTS · Wav2Lip · FFmpeg" },
                ].map((row, i) => (
                  row.arrow
                    ? <div key={i} className={`my-1 ml-4 flex items-center gap-1 text-xs ${tx3}`}><span>↓</span><span>HTTP / FormData</span></div>
                    : <div key={i} className="flex flex-wrap items-center gap-2 py-1">
                        <span className={`font-bold ${row.color}`}>{row.label}</span>
                        {row.port && <span className={`rounded px-1.5 py-0.5 text-[9px] ${dark ? "bg-white/5 text-slate-500" : "bg-slate-200 text-slate-500"}`}>{row.port}</span>}
                        <span className={`text-[10px] ${tx3}`}>— {row.note}</span>
                      </div>
                ))}
              </div>
            </div>

            {/* Key metrics row */}
            <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border p-4 ${dark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
              {[
                { val: "22+",   label: "Languages supported", color: "text-violet-500" },
                { val: "4",     label: "Microservice routes",  color: "text-blue-500" },
                { val: "0",     label: "API cost (offline)",   color: "text-emerald-500" },
                { val: "100%",  label: "Pipeline automated",   color: "text-pink-500" },
              ].map(({ val, label, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-2xl font-black ${color}`}>{val}</p>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${tx3}`}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            ROADMAP — horizontal full-width cards
        ════════════════════════════════════ */}
        <section className="mb-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <SL>Roadmap</SL>
              <h2 className={`text-2xl font-black tracking-tight ${tx1}`}>Planned improvements</h2>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${dark ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-white text-slate-500 shadow-sm"}`}>
              v3.0 →
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((item) => {
              const a = acc[item.color];
              return (
                <div key={item.label}
                  className={`group flex items-center gap-4 rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${a.glow} ${glass}`}>
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl ${a.bg}`}>{item.icon}</div>
                  <div className="min-w-0">
                    <p className={`text-sm font-extrabold ${a.text}`}>{item.label}</p>
                    <p className={`text-xs ${tx2} truncate`}>{item.desc}</p>
                  </div>
                  <div className={`ml-auto h-2 w-2 flex-shrink-0 rounded-full opacity-40 ${a.dot}`} />
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════
            CTA — full width
        ════════════════════════════════════ */}
        <section>
          <div className={`relative overflow-hidden rounded-3xl border p-10 lg:p-14 ${
            dark ? "border-violet-500/20 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-indigo-900/30"
                 : "border-violet-200 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 shadow-xl shadow-violet-100/50"
          }`}>
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-violet-500/15 blur-[60px]" />
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pink-500/15 blur-[60px]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className={`mb-3 text-3xl font-black tracking-tight ${tx1}`}>Try it yourself</h2>
                <p className={`text-base leading-relaxed ${tx2}`}>
                  Open the Studio and dub your first video in minutes.
                  All processing happens locally — no data leaves your machine.
                </p>
              </div>
              <Link to="/studio"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-violet-500/40 transition-all duration-200 hover:scale-105 hover:shadow-violet-500/60 whitespace-nowrap">
                Try the Studio →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}